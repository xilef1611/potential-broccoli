import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Oxapay callback:", JSON.stringify(body));
    const { status, orderId, trackId, invoiceId, amount, currency } = body;
    if (!orderId) return NextResponse.json({ error: "No order ID" }, { status: 400 });
    const orderRes = await query("SELECT * FROM orders WHERE order_number = $1", [orderId]);
    if (!orderRes.rows[0]) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    let paymentStatus = "pending";
    let orderStatus = "pending";
    if (status === "Completed" || status === "completed") {
      paymentStatus = "paid";
      orderStatus = "paid_not_shipped";
    } else if (status === "Failed" || status === "failed" || status === "Expired") {
      paymentStatus = "failed";
      orderStatus = "payment_failed";
    } else if (status === "Waiting") {
      paymentStatus = "waiting";
    }
    await query(
      "UPDATE orders SET payment_status=$1, order_status=$2, oxapay_track_id=$3, oxapay_invoice_id=$4, updated_at=NOW() WHERE order_number=$5",
      [paymentStatus, orderStatus, trackId, invoiceId, orderId]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
