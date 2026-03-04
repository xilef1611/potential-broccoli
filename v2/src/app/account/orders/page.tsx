"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Search, LogOut, MessageCircle } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderNum, setOrderNum] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/account/login"); return; }
      setUser(d.user); setLoading(false);
    });
    const last = localStorage.getItem("last_order_number");
    if (last) setOrderNum(last);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cm-bg)" }}>
      <div className="spinner w-8 h-8" />
    </div>
  );

  return (
    <div className="min-h-screen grid-bg" style={{ background: "var(--cm-bg)" }}>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--cm-muted)" }}>Konto</p>
            <h1 className="text-3xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>
              Mein Bereich
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--cm-muted)" }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            <LogOut size={14} /> Abmelden
          </button>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--cm-text-bright)" }}>
              <Package size={18} style={{ color: "var(--cm-cyan)" }} /> Bestellung verfolgen
            </h2>
            <div className="flex gap-2">
              <input type="text" placeholder="ORD-000001"
                value={orderNum} onChange={e => setOrderNum(e.target.value)}
                className="input flex-1" />
              <button onClick={() => router.push(`/track?order=${orderNum}`)} className="btn-primary px-5 py-2 text-sm">
                <Search size={15} />
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: "var(--cm-text-bright)" }}>
              <MessageCircle size={18} style={{ color: "var(--cm-purple)" }} /> Support
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--cm-muted)" }}>Problem mit einer Bestellung? Erstelle ein Support-Ticket.</p>
            <Link href="/support" className="btn-secondary text-sm px-4 py-2 inline-flex">Ticket erstellen →</Link>
          </div>

          {user?.role === "admin" && (
            <div className="card p-6" style={{ borderColor: "rgba(0,212,255,0.3)" }}>
              <h2 className="font-bold mb-3" style={{ color: "var(--cm-cyan)" }}>⚙️ Admin-Bereich</h2>
              <Link href="/admin/dashboard" className="btn-primary text-sm px-4 py-2 inline-flex">Admin Dashboard →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
