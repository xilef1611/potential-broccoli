import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("auth_token")?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { message, status } = await req.json();
    await query("INSERT INTO ticket_replies (ticket_id, user_id, message, is_admin) VALUES ($1,$2,$3,true)", [params.id, auth.userId, message]);
    if (status) await query("UPDATE support_tickets SET status=$1, updated_at=NOW() WHERE id=$2", [status, params.id]);
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
