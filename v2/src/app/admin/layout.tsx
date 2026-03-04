"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard",      icon: "⊞",  emoji: "📊" },
  { href: "/admin/orders",    label: "Bestellungen",   icon: "⊟",  emoji: "📦" },
  { href: "/admin/products",  label: "Produkte",       icon: "⬡",  emoji: "🛍️" },
  { href: "/admin/customers", label: "Kunden",         icon: "◉",  emoji: "👥" },
  { href: "/admin/coupons",   label: "Gutscheincodes", icon: "◈",  emoji: "🏷️" },
  { href: "/admin/analytics", label: "Analytics",      icon: "▲",  emoji: "📈" },
  { href: "/admin/tickets",   label: "Support",        icon: "✉",  emoji: "💬" },
  { href: "/admin/settings",  label: "Einstellungen",  icon: "⚙",  emoji: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== "admin") router.push("/account/login");
      else { setUser(d.user); setLoading(false); }
    }).catch(() => router.push("/account/login"));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cm-bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="spinner w-8 h-8" />
        <span className="text-sm font-mono" style={{ color: "var(--cm-cyan)" }}>Authentifizierung...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cm-bg)" }}>
      {/* ── Sidebar ── */}
      <aside className="w-60 flex flex-col shrink-0 fixed inset-y-0 left-0 z-30 transition-transform"
        style={{ background: "var(--cm-surface)", borderRight: "1px solid var(--cm-border)" }}>
        
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--cm-border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}>🔒</div>
            <div>
              <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--cm-text-bright)" }}>
                Crypto<span style={{ color: "var(--cm-cyan)" }}>Market</span>
              </p>
              <p className="text-xs" style={{ color: "var(--cm-pink)" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-0.5">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}
                  className={`admin-sidebar-link ${active ? "active" : ""}`}>
                  <span className="text-base">{link.emoji}</span>
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: "var(--cm-border)" }}>
          {user && (
            <div className="px-3 py-2 rounded-lg" style={{ background: "var(--cm-card)" }}>
              <p className="text-xs font-medium truncate" style={{ color: "var(--cm-text-bright)" }}>
                {user.name || user.email}
              </p>
              <p className="text-xs" style={{ color: "var(--cm-muted)" }}>Administrator</p>
            </div>
          )}
          <div className="flex gap-2">
            <Link href="/" target="_blank"
              className="flex-1 text-center text-xs px-2 py-2 rounded-lg font-medium transition-all"
              style={{ background: "var(--cm-card)", color: "var(--cm-muted)", border: "1px solid var(--cm-border)" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--cm-cyan)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "var(--cm-muted)"; }}>
              🛍️ Shop
            </Link>
            <button onClick={logout}
              className="flex-1 text-center text-xs px-2 py-2 rounded-lg font-medium transition-all"
              style={{ background: "var(--cm-card)", color: "var(--cm-muted)", border: "1px solid var(--cm-border)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--cm-pink)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--cm-muted)"; }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-60 min-h-screen overflow-auto">
        {/* Top header bar */}
        <div className="sticky top-0 z-20 px-6 py-3 flex items-center justify-between border-b"
          style={{ background: "rgba(6,7,20,0.95)", borderColor: "var(--cm-border)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono" style={{ color: "var(--cm-muted)" }}>Admin</span>
            <span style={{ color: "var(--cm-border)" }}>/</span>
            <span className="text-sm font-medium" style={{ color: "var(--cm-text-bright)" }}>
              {NAV_LINKS.find(l => pathname.startsWith(l.href))?.label || "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "var(--cm-card)", color: "var(--cm-cyan)", border: "1px solid var(--cm-border)" }}>
              ● ONLINE
            </span>
            {user && (
              <span className="text-sm" style={{ color: "var(--cm-muted)" }}>
                👤 {user.name || user.email?.split('@')[0]}
              </span>
            )}
            <Link href="/" target="_blank"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{ background: "var(--cm-cyan)", color: "#020712" }}>
              🛍️ Shop
            </Link>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
