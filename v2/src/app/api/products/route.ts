import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    let sql = `SELECT p.*, c.name as category_name,
      (SELECT json_agg(pv.*) FROM product_variants pv WHERE pv.product_id = p.id) as variants
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = true`;
    const params: any[] = [];
    if (category) { params.push(category); sql += ` AND c.slug = $${params.length}`; }
    if (featured === "true") { sql += ` AND p.featured = true`; }
    if (search) { params.push(`%${search}%`); sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`; }
    sql += " ORDER BY p.featured DESC, p.created_at DESC";
    const result = await query(sql, params);
    return NextResponse.json({ products: result.rows });
  } catch (err) { return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, description, price, category_id, image_url, stock, active, featured } = body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    const result = await query(
      "INSERT INTO products (name, slug, description, price, category_id, image_url, stock, active, featured) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [name, slug, description, price, category_id, image_url, stock || 0, active !== false, featured || false]
    );
    return NextResponse.json({ product: result.rows[0] }, { status: 201 });
  } catch (err) { return NextResponse.json({ error: "Failed to create product" }, { status: 500 }); }
}
