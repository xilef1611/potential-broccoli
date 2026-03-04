import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const orderRes = await query(
      `SELECT o.*, json_agg(json_build_object(
        "id", oi.id, "product_name", oi.product_name, "quantity", oi.quantity,
        "unit_price", oi.unit_price, "subtotal", oi.subtotal, "variant_info", oi.variant_info
      )) as items FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.order_number = $1 GROUP BY o.id`,
      [params.orderNumber]
    );
    if (!orderRes.rows[0]) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const order = orderRes.rows[0];
    const token = req.cookies.get("auth_token")?.value;
    const auth = token ? verifyToken(token) : null;
    if (auth?.role !== "admin" && order.user_id && order.user_id !== auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ order });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
