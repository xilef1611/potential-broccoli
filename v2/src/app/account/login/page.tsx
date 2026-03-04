"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.user.role === "admin") router.push("/admin/dashboard");
      else router.push("/account/orders");
    } catch (err: any) { setError(err.message); setLoading(false); }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-6" style={{ background: "var(--cm-bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}>🔒</div>
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>
              Crypto<span style={{ color: "var(--cm-cyan)" }}>Market</span>
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "var(--cm-muted)" }}>Anmelden bei deinem Konto</p>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>Login</h1>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(244,63,138,0.1)", border: "1px solid rgba(244,63,138,0.3)", color: "var(--cm-pink)" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--cm-muted)" }}>E-Mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }} />
                <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="input pl-9" placeholder="deine@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--cm-muted)" }}>Passwort</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }} />
                <input type={showPw ? "text" : "password"} required value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  className="input pl-9 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center mt-2">
              {loading ? <div className="spinner w-4 h-4" /> : null}
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: "var(--cm-muted)" }}>
            Noch kein Konto?{" "}
            <Link href="/account/register" style={{ color: "var(--cm-cyan)" }} className="hover:underline">Registrieren</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
