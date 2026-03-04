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
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let where = "WHERE u.role = 'customer'";
    const params: any[] = [];
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    const sql = `
      SELECT u.id, u.name, u.email, u.created_at,
        COUNT(DISTINCT o.id)::int AS order_count,
        COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.customer_email = u.email
      ${where}
      GROUP BY u.id, u.name, u.email, u.created_at
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const countSql = `SELECT COUNT(*) FROM users u ${where.replace(/\$\d+/g, () => `$${params.indexOf(params.find(p => typeof p === 'string' && p.startsWith('%')) ?? '') + 1}`)}`;
    
    const [result, countResult] = await Promise.all([
      query(sql, params),
      query(`SELECT COUNT(*) FROM users u WHERE u.role = 'customer'${search ? ` AND (u.name ILIKE $1 OR u.email ILIKE $1)` : ""}`, search ? [`%${search}%`] : []),
    ]);

    return NextResponse.json({
      customers: result.rows,
      total: parseInt(countResult.rows[0].count),
      page, limit,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
