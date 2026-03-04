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
    const [statsRes, dailyRes, topProductsRes] = await Promise.all([
      query(`
        SELECT
          COUNT(*)::int AS total_orders,
          COALESCE(SUM(CASE WHEN payment_status='paid' THEN total_amount ELSE 0 END), 0) AS total_revenue,
          COUNT(CASE WHEN order_status='paid_not_shipped' OR order_status='processing' THEN 1 END)::int AS pending_shipment,
          COUNT(CASE WHEN order_status='shipped' THEN 1 END)::int AS shipped_orders,
          COUNT(CASE WHEN order_status='delivered' THEN 1 END)::int AS delivered_orders,
          COUNT(CASE WHEN order_status='cancelled' THEN 1 END)::int AS cancelled_orders
        FROM orders
      `, []),
      query(`
        SELECT DATE(created_at) AS date, COUNT(*)::int AS orders,
          COALESCE(SUM(CASE WHEN payment_status='paid' THEN total_amount ELSE 0 END), 0) AS revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `, []),
      query(`
        SELECT oi.product_name,
          SUM(oi.quantity)::int AS sold,
          SUM(oi.subtotal) AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.payment_status = 'paid'
        GROUP BY oi.product_name
        ORDER BY sold DESC
        LIMIT 10
      `, []),
    ]);

    // Get product and customer counts
    const [productCountRes, customerCountRes] = await Promise.all([
      query("SELECT COUNT(*)::int AS count FROM products WHERE is_active = true", []).catch(() => ({ rows: [{ count: 0 }] })),
      query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'", []).catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    const stats = {
      ...statsRes.rows[0],
      total_products: productCountRes.rows[0]?.count ?? 0,
      total_customers: customerCountRes.rows[0]?.count ?? 0,
    };

    return NextResponse.json({
      stats,
      daily: dailyRes.rows,
      top_products: topProductsRes.rows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
