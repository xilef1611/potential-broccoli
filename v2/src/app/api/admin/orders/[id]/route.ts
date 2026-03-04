import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { order_status, notes } = await req.json();
    const result = await query(
      "UPDATE orders SET order_status=$1, notes=COALESCE($2, notes), updated_at=NOW() WHERE id=$3 RETURNING *",
      [order_status, notes, params.id]
    );
    return NextResponse.json({ order: result.rows[0] });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
