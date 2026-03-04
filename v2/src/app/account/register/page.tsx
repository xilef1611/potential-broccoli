"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", name: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwörter stimmen nicht überein"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email, name: form.name, password: form.password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/account/orders");
    } catch (err: any) { setError(err.message); setLoading(false); }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-6" style={{ background: "var(--cm-bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}>🔒</div>
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>
              Crypto<span style={{ color: "var(--cm-cyan)" }}>Market</span>
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "var(--cm-muted)" }}>Konto erstellen</p>
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>Registrieren</h1>
          {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(244,63,138,0.1)", border: "1px solid rgba(244,63,138,0.3)", color: "var(--cm-pink)" }}>{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--cm-muted)" }}>Name (optional)</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }} />
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input pl-9" placeholder="Max Mustermann" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--cm-muted)" }}>E-Mail *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }} />
                <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input pl-9" placeholder="deine@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--cm-muted)" }}>Passwort * (min. 8 Zeichen)</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }} />
                <input type={showPw ? "text" : "password"} required minLength={8} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input pl-9 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }}>{showPw ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--cm-muted)" }}>Passwort bestätigen *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }} />
                <input type="password" required value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))} className="input pl-9" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center mt-2">
              {loading ? <div className="spinner w-4 h-4" /> : null}
              {loading ? "Wird erstellt..." : "Konto erstellen"}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: "var(--cm-muted)" }}>
            Bereits registriert?{" "}
            <Link href="/account/login" style={{ color: "var(--cm-cyan)" }} className="hover:underline">Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
