import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, subject, message, order_number } = await req.json();
    if (!email || !subject || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const token = req.cookies.get("auth_token")?.value;
    const auth = token ? verifyToken(token) : null;
    const seqRes = await query("SELECT nextval('ticket_sequence') as seq");
    const ticketNumber = `TKT-${String(seqRes.rows[0].seq).padStart(6, "0")}`;
    let orderId = null;
    if (order_number) {
      const orderRes = await query("SELECT id FROM orders WHERE order_number = $1", [order_number]);
      if (orderRes.rows[0]) orderId = orderRes.rows[0].id;
    }
    await query(
      "INSERT INTO support_tickets (ticket_number, user_id, order_id, email, subject, message) VALUES ($1,$2,$3,$4,$5,$6)",
      [ticketNumber, auth?.userId || null, orderId, email, subject, message]
    );
    return NextResponse.json({ success: true, ticket_number: ticketNumber }, { status: 201 });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
