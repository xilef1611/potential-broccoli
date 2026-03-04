import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await query(`SELECT t.*, 
      (SELECT COUNT(*) FROM ticket_replies tr WHERE tr.ticket_id = t.id) as reply_count
      FROM support_tickets t ORDER BY t.created_at DESC`);
    return NextResponse.json({ tickets: result.rows });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
