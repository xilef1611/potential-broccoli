import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth || auth.role !== "admin") return null;
  return auth;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { code, type, value, min_order, max_uses, is_active, expires_at } = body;
    const result = await query(
      `UPDATE coupons SET code=$1, type=$2, value=$3, min_order=$4, max_uses=$5, is_active=$6, expires_at=$7
       WHERE id=$8 RETURNING *`,
      [code?.toUpperCase(), type, value, min_order || 0, max_uses || null, is_active !== false, expires_at || null, params.id]
    );
    if (!result.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ coupon: result.rows[0] });
  } catch (err: any) {
    if (err.code === "23505") return NextResponse.json({ error: "Code already exists" }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await query("DELETE FROM coupons WHERE id=$1", [params.id]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
