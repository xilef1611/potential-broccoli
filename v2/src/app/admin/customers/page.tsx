"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, X, Mail, Package, Calendar } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const PER_PAGE = 20;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
      if (search) params.set("search", search);
      const r = await fetch(`/api/admin/customers?${params}`);
      const d = await r.json();
      setCustomers(d.customers || []);
      setTotal(d.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--cm-muted)" }}>Verwaltung</p>
        <h1 className="text-3xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>
          Kunden
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-muted)" }} />
          <input type="text" placeholder="Name oder E-Mail suchen..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9 h-10 text-sm" />
        </div>
        {search && (
          <button onClick={() => { setSearch(""); setPage(1); }} className="btn-secondary h-10 px-3">
            <X size={14} />
          </button>
        )}
        <span className="ml-auto text-sm self-center" style={{ color: "var(--cm-muted)" }}>{total} Kunden</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>E-Mail</th>
                <th>Bestellungen</th>
                <th>Ausgaben</th>
                <th>Registriert</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="h-4 rounded animate-pulse" style={{ background: "var(--cm-border)", width: "80%" }} /></td>
                    ))}
                  </tr>
                ))
              ) : customers.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "var(--cm-cyan-dim)", color: "var(--cm-cyan)" }}>
                        {(c.name || c.email || "?")[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{c.name || "—"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm" style={{ color: "var(--cm-muted)" }}>{c.email}</span>
                  </td>
                  <td>
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--cm-cyan)" }}>{c.order_count ?? 0}</span>
                  </td>
                  <td>
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--cm-green)" }}>
                      €{parseFloat(c.total_spent || 0).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: "var(--cm-muted)" }}>
                      {new Date(c.created_at).toLocaleDateString("de-DE")}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => setSelected(c)}
                      className="text-xs px-2 py-1 rounded transition-all"
                      style={{ color: "var(--cm-cyan)", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && customers.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: "var(--cm-muted)" }}>Keine Kunden gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PER_PAGE && (
          <div className="flex justify-center gap-2 p-4 border-t" style={{ borderColor: "var(--cm-border)" }}>
            {page > 1 && <button onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-4 py-2">← Zurück</button>}
            <span className="px-3 py-2 text-sm" style={{ color: "var(--cm-muted)" }}>Seite {page} / {Math.ceil(total / PER_PAGE)}</span>
            {page * PER_PAGE < total && <button onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-4 py-2">Weiter →</button>}
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-lg">
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: "var(--cm-border)" }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--cm-text-bright)" }}>Kundenprofil</h3>
              <button onClick={() => setSelected(null)} style={{ color: "var(--cm-muted)" }}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: "var(--cm-cyan-dim)", color: "var(--cm-cyan)" }}>
                  {(selected.name || selected.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: "var(--cm-text-bright)" }}>{selected.name || "Kein Name"}</p>
                  <p className="text-sm" style={{ color: "var(--cm-muted)" }}>{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "📦", label: "Bestellungen", value: selected.order_count ?? 0, color: "var(--cm-cyan)" },
                  { icon: "💰", label: "Ausgaben", value: `€${parseFloat(selected.total_spent || 0).toFixed(2)}`, color: "var(--cm-green)" },
                  { icon: "📅", label: "Registriert", value: new Date(selected.created_at).toLocaleDateString("de-DE"), color: "var(--cm-muted)" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl text-center" style={{ background: "var(--cm-surface)", border: "1px solid var(--cm-border)" }}>
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className="text-sm font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-xs" style={{ color: "var(--cm-muted)" }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: "var(--cm-border)" }}>
              <button onClick={() => setSelected(null)} className="btn-secondary text-sm px-4 py-2">Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
