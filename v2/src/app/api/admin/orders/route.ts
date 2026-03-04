import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth || auth.role !== "admin") return null;
  return auth;
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    let sql = `SELECT o.*, 
      (SELECT json_agg(json_build_object(
        "product_name", oi.product_name, "quantity", oi.quantity,
        "unit_price", oi.unit_price, "subtotal", oi.subtotal, "variant_info", oi.variant_info
      )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o WHERE 1=1`;
    const params: any[] = [];
    if (status) { params.push(status); sql += ` AND o.order_status = $${params.length}`; }
    sql += ` ORDER BY o.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
    params.push(limit, offset);
    const result = await query(sql, params);
    const countRes = await query("SELECT COUNT(*) FROM orders" + (status ? " WHERE order_status = $1" : ""), status ? [status] : []);
    return NextResponse.json({ orders: result.rows, total: parseInt(countRes.rows[0].count), page, limit });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
