#!/bin/bash
# ============================================================
#  CryptoMarket Frontend & Admin Upgrade Script
#  Applies the new design + features to your shop
# ============================================================

set -e

SHOP_DIR="${1:-$(pwd)}"
UPDATE_DIR="$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   CryptoMarket Shop Upgrade — Starting...        ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Check we're in the right directory
if [ ! -f "$SHOP_DIR/package.json" ]; then
  echo "❌  ERROR: No package.json found in $SHOP_DIR"
  echo "   Usage: bash upgrade.sh /path/to/your/shop"
  exit 1
fi

echo "📁  Shop directory: $SHOP_DIR"
echo ""

# ── 1. Backup existing files ────────────────────────────
BACKUP="$SHOP_DIR/.backup-$(date +%Y%m%d-%H%M%S)"
echo "📦  Creating backup in $BACKUP ..."
mkdir -p "$BACKUP"
for f in \
  src/app/globals.css \
  src/app/page.jsx \
  src/app/shop/page.jsx \
  src/app/shop/page.tsx \
  src/components/layout/Layout.jsx \
  src/app/admin/layout.tsx \
  src/app/admin/dashboard/page.tsx \
  src/app/admin/analytics/page.tsx \
  src/app/api/admin/analytics/route.ts; do
  if [ -f "$SHOP_DIR/$f" ]; then
    mkdir -p "$BACKUP/$(dirname $f)"
    cp "$SHOP_DIR/$f" "$BACKUP/$f"
  fi
done
echo "   ✅  Backup done"
echo ""

# ── Helper: copy with directory creation ────────────────
copy_file() {
  local SRC="$UPDATE_DIR/src/$1"
  local DST="$SHOP_DIR/src/$1"
  if [ -f "$SRC" ]; then
    mkdir -p "$(dirname "$DST")"
    cp "$SRC" "$DST"
    echo "   ✅  Updated: src/$1"
  else
    echo "   ⚠️   Missing source: $SRC  (skipping)"
  fi
}

# ── 2. Apply CSS / Design ───────────────────────────────
echo "🎨  Updating global styles..."
copy_file "app/globals.css"

# ── 3. Update Frontend ──────────────────────────────────
echo ""
echo "🛍️   Updating frontend pages..."
copy_file "app/page.jsx"
copy_file "app/shop/page.jsx"
copy_file "components/layout/Layout.jsx"

# ── 4. Update Admin ─────────────────────────────────────
echo ""
echo "⚙️   Updating admin panel..."
copy_file "app/admin/layout.tsx"
copy_file "app/admin/dashboard/page.tsx"
copy_file "app/admin/analytics/page.tsx"

# ── 5. Add new Admin pages ──────────────────────────────
echo ""
echo "➕  Installing new admin pages..."
copy_file "app/admin/customers/page.tsx"
copy_file "app/admin/coupons/page.tsx"

# ── 6. Add new API routes ────────────────────────────────
echo ""
echo "🔌  Installing new API routes..."
copy_file "app/api/admin/customers/route.ts"
copy_file "app/api/admin/coupons/route.ts"
copy_file "app/api/admin/coupons/[id]/route.ts"
copy_file "app/api/admin/analytics/route.ts"

# ── 7. Remove conflicting .tsx duplicates ───────────────
echo ""
echo "🧹  Removing conflicting duplicate page files..."
DUPES=(
  "src/app/shop/page.tsx"
  "src/app/checkout/page.tsx"
  "src/app/support/page.tsx"
  "src/app/admin/orders/page.tsx"
  "src/app/admin/products/page.tsx"
  "src/app/admin/tickets/page.tsx"
)
for dup in "${DUPES[@]}"; do
  if [ -f "$SHOP_DIR/$dup" ]; then
    # Only remove if .jsx counterpart exists
    JSX="${dup/.tsx/.jsx}"
    if [ -f "$SHOP_DIR/$JSX" ]; then
      rm "$SHOP_DIR/$dup"
      echo "   🗑️   Removed conflicting: $dup  (kept .jsx)"
    fi
  fi
done

# ── 8. Update tailwind config to add new colors ─────────
echo ""
echo "🎨  Patching tailwind config..."
TAILWIND="$SHOP_DIR/tailwind.config.ts"
if [ -f "$TAILWIND" ]; then
  # Add cm- color vars if not already present
  if ! grep -q "cm-bg" "$TAILWIND"; then
    cat >> "$TAILWIND" << 'TWEOF'

// NOTE: cm- CSS variables are defined in globals.css
// Tailwind picks them up via CSS variable references
TWEOF
    echo "   ✅  Tailwind config noted"
  else
    echo "   ⏭️   Tailwind config already patched"
  fi
fi

# ── 9. Summary ──────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║              ✅  Upgrade Complete!               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "📋  Changes applied:"
echo "    • New CryptoMarket dark navy design system"
echo "    • Redesigned homepage with crypto payment badges"
echo "    • Shop page with category tab filters"
echo "    • New admin sidebar with emoji navigation"
echo "    • Admin dashboard with stat cards + orders table"
echo "    • Schnellzugriff quick action panel"
echo "    • NEW: Customers management page (/admin/customers)"
echo "    • NEW: Coupon codes management (/admin/coupons)"
echo "    • NEW: Customer & coupon API routes"
echo "    • Updated analytics API with more stats"
echo "    • Removed conflicting .tsx/.jsx duplicates"
echo ""
echo "🔄  Next steps:"
echo "    1. cd $SHOP_DIR"
echo "    2. npm run build   (check for TS errors)"
echo "    3. npm run dev     (test locally)"
echo "    4. Deploy to production"
echo ""
echo "⚠️   Database: Run this SQL to add the coupons table:"
echo "    CREATE TABLE IF NOT EXISTS coupons ("
echo "      id SERIAL PRIMARY KEY,"
echo "      code VARCHAR(50) UNIQUE NOT NULL,"
echo "      type VARCHAR(10) DEFAULT 'percent' CHECK (type IN ('percent','fixed')),"
echo "      value NUMERIC(10,2) DEFAULT 0,"
echo "      min_order NUMERIC(10,2) DEFAULT 0,"
echo "      max_uses INTEGER,"
echo "      used_count INTEGER DEFAULT 0,"
echo "      is_active BOOLEAN DEFAULT true,"
echo "      expires_at TIMESTAMP,"
echo "      created_at TIMESTAMP DEFAULT NOW()"
echo "    );"
echo ""
echo "   Backup saved to: $BACKUP"
echo ""
