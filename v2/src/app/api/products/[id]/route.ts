import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await query(
      `SELECT p.*, c.name as category_name,
        (SELECT json_agg(pv.*) FROM product_variants pv WHERE pv.product_id = p.id) as variants
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.active = true`,
      [params.id]
    );
    if (!result.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product: result.rows[0] });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, description, price, category_id, image_url, stock, active, featured } = body;
    const result = await query(
      "UPDATE products SET name=$1,description=$2,price=$3,category_id=$4,image_url=$5,stock=$6,active=$7,featured=$8,updated_at=NOW() WHERE id=$9 RETURNING *",
      [name, description, price, category_id, image_url, stock, active, featured, params.id]
    );
    return NextResponse.json({ product: result.rows[0] });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await query("UPDATE products SET active=false WHERE id=$1", [params.id]);
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
