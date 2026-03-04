import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, order_total } = await req.json();
    if (!code) return NextResponse.json({ error: "Code erforderlich" }, { status: 400 });
    let result;
    try { result = await query("SELECT * FROM coupons WHERE code = $1 AND is_active = true", [code.toUpperCase()]); }
    catch { return NextResponse.json({ error: "Gutscheine nicht verfügbar" }, { status: 400 }); }
    if (!result.rows[0]) return NextResponse.json({ error: "Ungültiger Gutschein" }, { status: 400 });
    const c = result.rows[0];
    if (c.expires_at && new Date(c.expires_at) < new Date()) return NextResponse.json({ error: "Gutschein abgelaufen" }, { status: 400 });
    if (c.max_uses && c.used_count >= c.max_uses) return NextResponse.json({ error: "Gutschein aufgebraucht" }, { status: 400 });
    if (c.min_order && order_total < parseFloat(c.min_order)) return NextResponse.json({ error: "Mindestbestellwert nicht erreicht" }, { status: 400 });
    return NextResponse.json({ code: c.code, type: c.type, value: parseFloat(c.value), id: c.id });
  } catch { return NextResponse.json({ error: "Fehler" }, { status: 500 }); }
}
