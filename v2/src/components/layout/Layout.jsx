'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, useAuthStore } from '@/lib/store';
import { ShoppingCart, Menu, X, Shield, Lock, User, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

function CryptoMarketLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
        🔒
      </div>
      <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        Crypto<span style={{ color: 'var(--cm-cyan)' }}>Market</span>
      </span>
    </Link>
  );
}

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('🔒 100% Anonym · XMR & Bitcoin · Weltweiter Versand');
  const { items, removeItem, updateQuantity, getTotal, getCount } = useCartStore();
  const { user, logout, isAdmin } = useAuthStore();

  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data.announcement_active && r.data.announcement_bar) setAnnouncement(r.data.announcement_bar);
    }).catch(() => {});
  }, []);

  const navLinks = [
    { href: '/shop', label: 'Produkte' },
    { href: '/support', label: 'Support' },
    { href: '/track', label: 'Bestellung verfolgen' },
  ];

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--cm-bg)', color: 'var(--cm-text)' }}>
      {/* Announcement Bar */}
      <div className="announcement-bar py-2 px-4 text-center text-xs font-mono" style={{ color: 'var(--cm-cyan)' }}>
        {announcement}
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(6,7,20,0.92)', borderColor: 'var(--cm-border)' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <CryptoMarketLogo />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: 'var(--cm-muted)' }}
                onMouseEnter={e => { e.target.style.color='var(--cm-text)'; e.target.style.background='rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { e.target.style.color='var(--cm-muted)'; e.target.style.background='transparent'; }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Auth */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{ color: 'var(--cm-muted)', border: '1px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--cm-border)'; e.currentTarget.style.color='var(--cm-text)'; }}
                  onMouseLeave={e => { if (!userMenuOpen) { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--cm-muted)'; } }}>
                  <User size={15} />
                  <span>{user.name || user.email?.split('@')[0]}</span>
                  <ChevronDown size={13} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl py-1 z-50"
                    style={{ background: 'var(--cm-card)', border: '1px solid var(--cm-border)' }}>
                    {isAdmin() && (
                      <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--cm-cyan)' }}>
                        <Settings size={14} /> Admin Panel
                      </Link>
                    )}
                    <Link href="/account/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
                      <Package size={14} /> Meine Bestellungen
                    </Link>
                    <button onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                      style={{ color: 'var(--cm-pink)' }}>
                      <LogOut size={14} /> Abmelden
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/account/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: 'var(--cm-muted)', border: '1px solid var(--cm-border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--cm-cyan)'; e.currentTarget.style.color='var(--cm-cyan)'; e.currentTarget.style.background='var(--cm-cyan-dim)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--cm-border)'; e.currentTarget.style.color='var(--cm-muted)'; e.currentTarget.style.background='transparent'; }}>
                <User size={14} />
                Login
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--cm-cyan)', color: '#020712' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 20px rgba(0,212,255,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; }}>
              <ShoppingCart size={16} />
              {getCount() > 0 && (
                <span className="text-xs font-bold">({getCount()})</span>
              )}
            </button>

            {/* Mobile menu btn */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg" style={{ color: 'var(--cm-text)' }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t p-4 flex flex-col gap-2" style={{ background: 'var(--cm-surface)', borderColor: 'var(--cm-border)' }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm" style={{ color: 'var(--cm-text)' }}>
                {l.label}
              </Link>
            ))}
            <div className="border-t my-2" style={{ borderColor: 'var(--cm-border)' }} />
            {user ? (
              <>
                {isAdmin() && <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} style={{ color: 'var(--cm-cyan)' }} className="px-4 py-2 text-sm">Admin Panel</Link>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="px-4 py-2 text-sm text-left" style={{ color: 'var(--cm-pink)' }}>Abmelden</button>
              </>
            ) : (
              <Link href="/account/login" onClick={() => setMenuOpen(false)} style={{ color: 'var(--cm-cyan)' }} className="px-4 py-2 text-sm">Login / Registrieren</Link>
            )}
          </div>
        )}
      </nav>

      {/* Click-away for user menu */}
      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-24 py-16 border-t" style={{ borderColor: 'var(--cm-border)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <CryptoMarketLogo />
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--cm-muted)' }}>
                Verschlüsselt. Anonym. Sicher. Bezahl mit Krypto für maximale Privatsphäre.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--cm-muted)' }}>Shop</p>
              <div className="flex flex-col gap-2">
                {[['Alle Produkte','/shop'],['Bestellungen verfolgen','/track'],['Support','/support']].map(([label,href]) => (
                  <Link key={href} href={href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--cm-muted)' }}>{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--cm-muted)' }}>Zahlungen</p>
              <div className="flex flex-wrap gap-2">
                {['₿ Bitcoin','Ξ Ethereum','ɱ Monero','₮ USDT','Ł Litecoin'].map(c => (
                  <span key={c} className="text-xs px-2 py-1 rounded font-mono" style={{ background: 'var(--cm-surface)', border: '1px solid var(--cm-border)', color: 'var(--cm-muted)' }}>{c}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--cm-muted)' }}>Konto</p>
              <div className="flex flex-col gap-2">
                {[['Login','/account/login'],['Registrieren','/account/register'],['Meine Bestellungen','/account/orders']].map(([label,href]) => (
                  <Link key={href} href={href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--cm-muted)' }}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-xs" style={{ borderColor: 'var(--cm-border)', color: 'var(--cm-muted)' }}>
            <span>© 2025 CryptoMarket. Alle Rechte vorbehalten.</span>
            <span className="flex items-center gap-1.5"><Lock size={10} style={{ color: 'var(--cm-cyan)' }} /> Verschlüsselt & Anonym</span>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm flex flex-col h-full overflow-y-auto" style={{ background: 'var(--cm-surface)', borderLeft: '1px solid var(--cm-border)' }}>
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--cm-border)' }}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart size={18} style={{ color: 'var(--cm-cyan)' }} /> Warenkorb
              </h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5"><X size={18} /></button>
            </div>

            <div className="flex-1 p-5">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm" style={{ color: 'var(--cm-muted)' }}>Warenkorb ist leer</p>
                  <Link href="/shop" onClick={() => setCartOpen(false)}
                    className="btn-secondary mt-4 inline-flex text-sm px-4 py-2">
                    Zum Shop
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map(item => (
                    <div key={item.key} className="card p-3 flex gap-3">
                      {item.image && (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.image}`}
                          alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        {item.variant_name && <p className="text-xs" style={{ color: 'var(--cm-muted)' }}>{item.variant_name}</p>}
                        <p className="text-sm font-bold mt-0.5 font-mono" style={{ color: 'var(--cm-cyan)' }}>
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="w-6 h-6 rounded text-sm font-bold flex items-center justify-center"
                            style={{ background: 'var(--cm-border)', color: 'var(--cm-text)' }}>−</button>
                          <span className="text-sm font-mono">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="w-6 h-6 rounded text-sm font-bold flex items-center justify-center"
                            style={{ background: 'var(--cm-border)', color: 'var(--cm-text)' }}>+</button>
                          <button onClick={() => removeItem(item.key)} className="ml-auto text-xs" style={{ color: 'var(--cm-pink)' }}>Entfernen</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t" style={{ borderColor: 'var(--cm-border)' }}>
                <div className="flex justify-between items-center mb-4">
                  <span style={{ color: 'var(--cm-muted)' }}>Gesamt</span>
                  <span className="text-xl font-bold font-mono" style={{ color: 'var(--cm-cyan)' }}>€{getTotal().toFixed(2)}</span>
                </div>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-primary w-full justify-center py-3">
                  Zur Kasse →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
