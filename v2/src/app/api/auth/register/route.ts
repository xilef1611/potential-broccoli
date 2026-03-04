import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Min 8 characters" }, { status: 400 });
    const existing = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const hash = await hashPassword(password);
    const result = await query("INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role", [email.toLowerCase(), hash, "customer"]);
    const user = result.rows[0];
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 604800, path: "/" });
    return response;
  } catch (err) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}