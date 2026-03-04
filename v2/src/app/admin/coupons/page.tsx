"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Copy, X } from "lucide-react";
import toast from "react-hot-toast";

interface Coupon {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

function CouponModal({ coupon, onClose, onSaved }: { coupon: Coupon | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(coupon ? {
    code: coupon.code, type: coupon.type, value: coupon.value,
    min_order: coupon.min_order || 0, max_uses: coupon.max_uses || "", is_active: coupon.is_active,
    expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "",
  } : {
    code: "", type: "percent", value: 10, min_order: 0, max_uses: "", is_active: true, expires_at: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm(p => ({ ...p, code }));
  };

  const handleSave = async () => {
    if (!form.code) return toast.error("Code ist erforderlich");
    setSaving(true);
    try {
      const method = coupon ? "PUT" : "POST";
      const url = coupon ? `/api/admin/coupons/${coupon.id}` : "/api/admin/coupons";
      const r = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, max_uses: form.max_uses || null }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success(coupon ? "Gutschein aktualisiert" : "Gutschein erstellt");
      onSaved(); onClose();
    } catch (err: any) { toast.error(err.message || "Fehler"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: "var(--cm-border)" }}>
          <h3 className="font-bold" style={{ color: "var(--cm-text-bright)" }}>{coupon ? "Gutschein bearbeiten" : "Neuer Gutschein"}</h3>
          <button onClick={onClose} style={{ color: "var(--cm-muted)" }}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: "var(--cm-muted)" }}>Code *</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={form.code} onChange={set("code")} placeholder="z.B. SAVE10" style={{ textTransform: "uppercase" }} />
              <button onClick={generateCode} className="btn-secondary px-3 text-xs">Zufällig</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: "var(--cm-muted)" }}>Typ</label>
              <select className="input" value={form.type} onChange={set("type")}>
                <option value="percent">Prozent (%)</option>
                <option value="fixed">Fester Betrag (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: "var(--cm-muted)" }}>Wert</label>
              <input className="input" type="number" step="0.01" min="0" value={form.value} onChange={set("value")} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: "var(--cm-muted)" }}>Mindestbestellwert (€)</label>
              <input className="input" type="number" step="0.01" min="0" value={form.min_order} onChange={set("min_order")} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: "var(--cm-muted)" }}>Max. Nutzungen</label>
              <input className="input" type="number" min="1" value={form.max_uses} onChange={set("max_uses")} placeholder="Unbegrenzt" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: "var(--cm-muted)" }}>Läuft ab am (optional)</label>
            <input className="input" type="date" value={form.expires_at} onChange={set("expires_at")} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={set("is_active")} style={{ accentColor: "var(--cm-cyan)" }} />
            <span className="text-sm">Aktiv</span>
          </label>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: "var(--cm-border)" }}>
          <button onClick={onClose} className="btn-secondary text-sm px-4 py-2">Abbrechen</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2">
            {saving ? <div className="spinner w-4 h-4" /> : null}
            {coupon ? "Aktualisieren" : "Erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Coupon | null | "new">(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/coupons");
      const d = await r.json();
      setCoupons(d.coupons || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleDelete = async (id: number) => {
    if (!confirm("Gutschein wirklich löschen?")) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      toast.success("Gutschein gelöscht");
      fetchCoupons();
    } catch { toast.error("Fehler beim Löschen"); }
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast.success("Code kopiert!"); };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--cm-muted)" }}>Verwaltung</p>
          <h1 className="text-3xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>Gutscheincodes</h1>
        </div>
        <button onClick={() => setModal("new")} className="btn-primary text-sm px-4 py-2.5">
          <Plus size={16} /> Neuer Gutschein
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Typ</th>
                <th>Wert</th>
                <th>Verwendet</th>
                <th>Status</th>
                <th>Läuft ab</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="h-4 rounded animate-pulse" style={{ background: "var(--cm-border)" }} /></td>)}</tr>
                ))
              ) : coupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm" style={{ color: "var(--cm-cyan)" }}>{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="opacity-40 hover:opacity-100 transition-opacity">
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                  <td><span className="text-sm capitalize">{c.type === "percent" ? "Prozent" : "Fest"}</span></td>
                  <td>
                    <span className="font-mono font-bold text-sm" style={{ color: "var(--cm-green)" }}>
                      {c.type === "percent" ? `${c.value}%` : `€${c.value}`}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm font-mono">{c.used_count || 0}{c.max_uses ? ` / ${c.max_uses}` : ""}</span>
                  </td>
                  <td>
                    <span className={`badge ${c.is_active ? "badge-success" : "badge-neutral"} text-xs`}>
                      {c.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: "var(--cm-muted)" }}>
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString("de-DE") : "Nie"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setModal(c)}
                        className="text-xs px-2 py-1 rounded transition-all"
                        style={{ color: "var(--cm-muted)", background: "var(--cm-surface)" }}>Bearbeiten</button>
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded transition-all hover:bg-red-500/10"
                        style={{ color: "var(--cm-muted)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--cm-pink)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--cm-muted)"; }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && coupons.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-sm" style={{ color: "var(--cm-muted)" }}>Noch keine Gutscheincodes erstellt.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <CouponModal
          coupon={modal === "new" ? null : modal as Coupon}
          onClose={() => setModal(null)}
          onSaved={fetchCoupons}
        />
      )}
    </div>
  );
}
