"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const maxRevenue = Math.max(...(data?.daily?.map((d: any) => parseFloat(d.revenue)) || [0]), 1);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--cm-muted)" }}>Auswertung</p>
        <h1 className="text-3xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>Analytics</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          [...Array(4)].map(i => <div key={i} className="admin-stat-card animate-pulse" style={{ height: 90 }} />)
        ) : [
          { label: "Gesamtumsatz", value: `€${parseFloat(data?.stats?.total_revenue || 0).toFixed(2)}`, color: "var(--cm-cyan)", emoji: "💰" },
          { label: "Bestellungen", value: data?.stats?.total_orders, color: "var(--cm-purple)", emoji: "📦" },
          { label: "Ausstehend", value: data?.stats?.pending_shipment, color: "var(--cm-orange)", emoji: "⏳" },
          { label: "Versendet", value: data?.stats?.shipped_orders, color: "var(--cm-green)", emoji: "🚀" },
        ].map((s, i) => (
          <div key={i} className="admin-stat-card flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${s.color}22` }}>{s.emoji}</div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "var(--cm-muted)" }}>{s.label}</p>
              <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-bold mb-5" style={{ color: "var(--cm-text-bright)" }}>📊 Tagesumsatz (letzte 30 Tage)</h2>
          {loading ? (
            <div className="h-40 animate-pulse rounded" style={{ background: "var(--cm-surface)" }} />
          ) : data?.daily?.length > 0 ? (
            <div className="flex items-end gap-1 h-40">
              {data.daily.slice().reverse().map((d: any, i: number) => {
                const h = Math.max((parseFloat(d.revenue) / maxRevenue) * 100, 2);
                return (
                  <div key={i} className="flex-1 group relative">
                    <div className="rounded-sm transition-all cursor-pointer"
                      style={{ height: `${h}%`, minHeight: 2, background: "var(--cm-cyan)", opacity: 0.4 }}
                      title={`${d.date}: €${parseFloat(d.revenue).toFixed(2)}`}
                      onMouseEnter={e => { (e.target as HTMLElement).style.opacity = "1"; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.opacity = "0.4"; }} />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-mono hidden group-hover:block whitespace-nowrap z-10"
                      style={{ background: "var(--cm-card)", color: "var(--cm-cyan)", border: "1px solid var(--cm-border)" }}>
                      €{parseFloat(d.revenue).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-center py-12 text-sm" style={{ color: "var(--cm-muted)" }}>Noch keine Umsatzdaten</p>}
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h2 className="font-bold mb-4" style={{ color: "var(--cm-text-bright)" }}>🏆 Top Produkte</h2>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: "var(--cm-surface)" }} />)}</div>
          ) : data?.top_products?.length > 0 ? (
            <div className="space-y-3">
              {data.top_products.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--cm-surface)" }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono w-4 shrink-0" style={{ color: "var(--cm-muted)" }}>#{i+1}</span>
                    <span className="text-sm truncate" style={{ color: "var(--cm-text)" }}>{p.product_name}</span>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <span className="text-xs" style={{ color: "var(--cm-muted)" }}>{p.sold}×</span>
                    <span className="text-xs font-mono font-bold" style={{ color: "var(--cm-cyan)" }}>€{parseFloat(p.revenue).toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-center py-8" style={{ color: "var(--cm-muted)" }}>Noch keine Verkäufe</p>}
        </div>
      </div>
    </div>
  );
}
