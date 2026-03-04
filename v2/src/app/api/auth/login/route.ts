import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    const result = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 604800, path: "/" });
    return response;
  } catch (err) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}