const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    await client.query(`
      -- Sequences
      CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      );

      -- Categories
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Product variants
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        price_modifier DECIMAL(10,2) DEFAULT 0,
        stock INTEGER DEFAULT 0
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id),
        email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        address_line1 VARCHAR(500) NOT NULL,
        address_line2 VARCHAR(500),
        city VARCHAR(255) NOT NULL,
        postal_code VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'EUR',
        payment_status VARCHAR(50) DEFAULT 'pending',
        order_status VARCHAR(50) DEFAULT 'pending',
        oxapay_track_id VARCHAR(255),
        oxapay_invoice_id VARCHAR(255),
        oxapay_pay_link TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
      );

      -- Order items
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        variant_info JSONB,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL
      );

      -- Support tickets
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(20) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id),
        order_id INTEGER REFERENCES orders(id),
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Ticket replies
      CREATE TABLE IF NOT EXISTS ticket_replies (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Site settings
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Sequences for tickets
      CREATE SEQUENCE IF NOT EXISTS ticket_sequence START 1;

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
      CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
      CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

      -- Default admin user (password: Admin@Asklepios2024!)
      INSERT INTO users (email, password_hash, role)
      VALUES ('admin@asklepi0s.top', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0d1CqJhN7m', 'admin')
      ON CONFLICT (email) DO NOTHING;

      -- Default settings
      INSERT INTO site_settings (key, value) VALUES
        ('shop_name', 'ASKLEPI0S'),
        ('shop_tagline', 'Privacy-First Crypto Store'),
        ('announcement', ''),
        ('maintenance_mode', 'false')
      ON CONFLICT (key) DO NOTHING;

      -- Sample category
      INSERT INTO categories (name, slug, description) VALUES
        ('Digital Goods', 'digital', 'Digital products and downloads'),
        ('Physical Goods', 'physical', 'Physical shipped items')
      ON CONFLICT (slug) DO NOTHING;
    `);

    console.log('✅ Migrations completed successfully!');
    console.log('');
    console.log('Default admin credentials:');
    console.log('  Email: admin@asklepi0s.top');
    console.log('  Password: Admin@Asklepios2024!');
    console.log('');
    console.log('⚠️  CHANGE THE ADMIN PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

// Run v2 additions
async function migrateV2() {
  const { Pool } = require('pg');
  require('dotenv').config({ path: '.env.local' });
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(`
      -- Coupons table
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(10) NOT NULL DEFAULT 'percent' CHECK (type IN ('percent','fixed')),
        value NUMERIC(10,2) NOT NULL DEFAULT 0,
        min_order NUMERIC(10,2) NOT NULL DEFAULT 0,
        max_uses INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

      -- Add name column to users if missing
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      
      -- Add tracking/admin fields to orders if missing
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_note TEXT;
      
      -- Add is_featured, compare_price to products if missing
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price NUMERIC(10,2);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS track_stock BOOLEAN DEFAULT false;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

      -- Add customer_name to orders
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

      -- Unique index on products slug
      CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;

      -- Announcement settings
      INSERT INTO site_settings (key, value) VALUES
        ('announcement_bar', '🔒 100% Anonym · XMR & Bitcoin · Weltweiter Versand'),
        ('announcement_active', 'true'),
        ('currency', 'EUR'),
        ('currency_symbol', '€')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ V2 migrations completed!');
  } finally { client.release(); await pool.end(); }
}
migrateV2().catch(console.error);
