import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { createOxapayInvoice } from "@/lib/oxapay";

async function generateOrderNumber(): Promise<string> {
  const result = await query("SELECT nextval('order_sequence') as seq");
  const seq = result.rows[0].seq;
  return `ORD-${String(seq).padStart(6, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, customer_name, address_line1, address_line2, city, postal_code, country, items, notes } = body;
    if (!email || !customer_name || !address_line1 || !city || !postal_code || !country || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const token = req.cookies.get("auth_token")?.value;
    const auth = token ? verifyToken(token) : null;
    let total = 0;
    const resolvedItems = [];
    for (const item of items) {
      const res = await query("SELECT * FROM products WHERE id=$1 AND active=true", [item.product_id]);
      const product = res.rows[0];
      if (!product) return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
      const subtotal = product.price * item.quantity;
      total += subtotal;
      resolvedItems.push({ ...item, product_name: product.name, unit_price: product.price, subtotal });
    }
    const orderNumber = await generateOrderNumber();
    const orderRes = await query(
      `INSERT INTO orders (order_number, user_id, email, customer_name, address_line1, address_line2, city, postal_code, country, total_amount, notes, payment_status, order_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,"pending","pending") RETURNING *`,
      [orderNumber, auth?.userId || null, email, customer_name, address_line1, address_line2 || null, city, postal_code, country, total, notes || null]
    );
    const order = orderRes.rows[0];
    for (const item of resolvedItems) {
      await query(
        "INSERT INTO order_items (order_id, product_id, product_name, variant_info, quantity, unit_price, subtotal) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [order.id, item.product_id, item.product_name, item.variant ? JSON.stringify(item.variant) : null, item.quantity, item.unit_price, item.subtotal]
      );
    }
    const invoice = await createOxapayInvoice({ orderId: orderNumber, amount: total, email, description: `Order ${orderNumber}` });
    await query(
      "UPDATE orders SET oxapay_track_id=$1, oxapay_pay_link=$2 WHERE id=$3",
      [invoice.trackId, invoice.payLink, order.id]
    );
    return NextResponse.json({ success: true, order_number: orderNumber, order_id: order.id, pay_link: invoice.payLink, track_id: invoice.trackId, total }, { status: 201 });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
