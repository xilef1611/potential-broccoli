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
    // Ensure table exists
    await query(`
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
      )
    `, []);
    const result = await query("SELECT * FROM coupons ORDER BY created_at DESC", []);
    return NextResponse.json({ coupons: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { code, type, value, min_order, max_uses, is_active, expires_at } = body;
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    // Ensure table
    await query(`
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
      )
    `, []);

    const result = await query(
      `INSERT INTO coupons (code, type, value, min_order, max_uses, is_active, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [code.toUpperCase(), type || "percent", value || 0, min_order || 0, max_uses || null, is_active !== false, expires_at || null]
    );
    return NextResponse.json({ coupon: result.rows[0] });
  } catch (err: any) {
    if (err.code === "23505") return NextResponse.json({ error: "Code already exists" }, { status: 400 });
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
