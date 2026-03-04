"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-warning",
  paid_not_shipped: "badge-info",
  processing: "badge-info",
  shipped: "badge-success",
  delivered: "badge-success",
  cancelled: "badge-danger",
  refunded: "badge-danger",
};

const STATUS_DE: Record<string, string> = {
  pending: "Ausstehend",
  paid_not_shipped: "Bezahlt",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Geliefert",
  cancelled: "Storniert",
  refunded: "Rückerstattet",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics").then(r => r.json()),
      fetch("/api/admin/orders?limit=8").then(r => r.json()),
    ]).then(([analyticsData, ordersData]) => {
      setStats(analyticsData.stats);
      setRecentOrders(ordersData.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    {
      label: "Gesamtumsatz",
      value: `€${parseFloat(stats.total_revenue || 0).toFixed(2)}`,
      emoji: "💰",
      bg: "rgba(0,212,255,0.1)",
      color: "var(--cm-cyan)",
      href: "/admin/analytics",
    },
    {
      label: "Bestellungen",
      value: stats.total_orders ?? 0,
      emoji: "📦",
      bg: "rgba(124,58,237,0.1)",
      color: "var(--cm-purple)",
      href: "/admin/orders",
    },
    {
      label: "Ausstehend",
      value: stats.pending_shipment ?? 0,
      emoji: "⏳",
      bg: "rgba(245,158,11,0.1)",
      color: "var(--cm-orange)",
      href: "/admin/orders?status=paid_not_shipped",
    },
    {
      label: "Produkte",
      value: stats.total_products ?? 0,
      emoji: "🛍️",
      bg: "rgba(16,185,129,0.1)",
      color: "var(--cm-green)",
      href: "/admin/products",
    },
    {
      label: "Kunden",
      value: stats.total_customers ?? 0,
      emoji: "👥",
      bg: "rgba(244,63,138,0.1)",
      color: "var(--cm-pink)",
      href: "/admin/customers",
    },
  ] : [];

  const quickActions = [
    { href: "/admin/orders?status=paid_not_shipped", emoji: "📦", label: "Bestellungen", sub: "Packliste anzeigen", color: "#f59e0b" },
    { href: "/admin/products?modal=new", emoji: "➕", label: "Produkt anlegen", sub: "Artikel hinzufügen", color: "var(--cm-cyan)" },
    { href: "/admin/coupons?modal=new", emoji: "🏷️", label: "Gutschein erstellen", sub: "Rabattcode anlegen", color: "var(--cm-purple)" },
    { href: "/admin/customers", emoji: "👥", label: "Kunden", sub: "Accounts verwalten", color: "var(--cm-pink)" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--cm-muted)" }}>Übersicht</p>
        <h1 className="text-3xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>
          Dashboard
        </h1>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map(i => (
            <div key={i} className="admin-stat-card animate-pulse" style={{ height: 100 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((s, i) => (
            <Link key={i} href={s.href} className="admin-stat-card flex items-start gap-3 group hover:scale-[1.02] transition-transform">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: s.bg }}>
                {s.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider mb-1 truncate" style={{ color: "var(--cm-muted)" }}>{s.label}</p>
                <p className="text-2xl font-black font-mono leading-none" style={{ color: s.color }}>{s.value}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2/3 width) */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--cm-border)" }}>
            <h2 className="font-bold flex items-center gap-2" style={{ color: "var(--cm-text-bright)" }}>
              📋 Letzte Bestellungen
            </h2>
            <Link href="/admin/orders" className="text-xs font-mono transition-colors hover:text-white"
              style={{ color: "var(--cm-cyan)" }}>
              Alle anzeigen →
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map(i => <div key={i} className="h-12 rounded animate-pulse" style={{ background: "var(--cm-surface)" }} />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Bestell-Nr.</th>
                    <th>Datum</th>
                    <th>Kunde</th>
                    <th>Gesamt</th>
                    <th>Status</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td>
                        <span className="font-mono text-xs" style={{ color: "var(--cm-cyan)" }}>{order.order_number}</span>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: "var(--cm-muted)" }}>
                          {new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm truncate max-w-[120px] block">{order.customer_name || order.customer_email}</span>
                      </td>
                      <td>
                        <span className="font-mono font-bold text-sm" style={{ color: "var(--cm-cyan)" }}>
                          €{parseFloat(order.total_amount || order.total || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[order.order_status] || "badge-neutral"} text-xs`}>
                          {STATUS_DE[order.order_status] || order.order_status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/orders`}
                          className="text-xs px-2 py-1 rounded transition-all"
                          style={{ color: "var(--cm-muted)", background: "var(--cm-surface)" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--cm-text)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--cm-muted)"; }}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-sm" style={{ color: "var(--cm-muted)" }}>
                        Noch keine Bestellungen.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Access (1/3 width) */}
        <div className="space-y-5">
          {/* Schnellzugriff */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--cm-border)" }}>
              <h2 className="font-bold flex items-center gap-2" style={{ color: "var(--cm-text-bright)" }}>
                ⚡ Schnellzugriff
              </h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {quickActions.map((a, i) => (
                <Link key={i} href={a.href} className="quick-action group">
                  <div className="icon-wrap" style={{ background: `${a.color}22` }}>
                    <span className="text-xl">{a.emoji}</span>
                  </div>
                  <p className="text-xs font-bold text-center leading-tight" style={{ color: "var(--cm-text-bright)" }}>{a.label}</p>
                  <p className="text-xs text-center" style={{ color: "var(--cm-muted)" }}>{a.sub}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Mini analytics */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--cm-text-bright)" }}>
              📈 Status-Übersicht
            </h3>
            {stats ? (
              <div className="space-y-3">
                {[
                  { label: "Bezahlt (unversendet)", value: stats.pending_shipment ?? 0, color: "var(--cm-orange)" },
                  { label: "Versendet", value: stats.shipped_orders ?? 0, color: "var(--cm-cyan)" },
                  { label: "Geliefert", value: stats.delivered_orders ?? 0, color: "var(--cm-green)" },
                  { label: "Storniert", value: stats.cancelled_orders ?? 0, color: "var(--cm-pink)" },
                ].map((item, i) => {
                  const max = Math.max(stats.total_orders || 1, 1);
                  const pct = Math.round((item.value / max) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "var(--cm-muted)" }}>{item.label}</span>
                        <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cm-border)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {[...Array(4)].map(i => <div key={i} className="h-6 rounded animate-pulse" style={{ background: "var(--cm-surface)" }} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
