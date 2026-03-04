import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const result = await query("SELECT key, value FROM site_settings", []);
    const settings: Record<string, any> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value === 'true' ? true : row.value === 'false' ? false : row.value;
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({});
  }
}
