'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Shield, Lock, Zap, Package, ChevronRight, Eye, Globe, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

const CRYPTO_BADGES = [
  { symbol: '₿', name: 'Bitcoin', color: '#f7931a' },
  { symbol: 'Ξ', name: 'Ethereum', color: '#627eea' },
  { symbol: 'ɱ', name: 'Monero', color: '#ff6600' },
  { symbol: '₮', name: 'USDT', color: '#26a17b' },
  { symbol: 'Ł', name: 'Litecoin', color: '#b8b8b8' },
];

function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const imgBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');
  const img = product.images?.[0];

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    toast.success(`${product.name} zum Warenkorb hinzugefügt`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link href={`/products/${product.slug}`} className="product-card block group">
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: 'var(--cm-surface)' }}>
        {img ? (
          <img src={`${imgBase}${img}`} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-2" style={{ color: 'var(--cm-muted)' }}>
            <Package size={36} className="opacity-20" />
            <span className="text-xs opacity-30 font-mono">{product.name}</span>
          </div>
        )}
        {product.is_featured && (
          <span className="badge badge-info absolute top-2 left-2 text-xs">✦ Featured</span>
        )}
        {product.compare_price && (
          <span className="badge badge-danger absolute top-2 right-2 text-xs">
            -{Math.round((1 - product.price / product.compare_price) * 100)}%
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: 'var(--cm-cyan)', opacity: 0.7 }}>
          {product.category_name || 'Allgemein'}
        </p>
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors" style={{ color: 'var(--cm-text-bright)' }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--cm-border)' }}>
          <div>
            <span className="font-mono font-bold" style={{ color: 'var(--cm-cyan)' }}>€{parseFloat(product.price).toFixed(2)}</span>
            {product.compare_price && (
              <span className="line-through text-xs ml-2 font-mono" style={{ color: 'var(--cm-muted)' }}>€{parseFloat(product.compare_price).toFixed(2)}</span>
            )}
          </div>
          <button onClick={handleAdd}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${added ? '' : ''}`}
            style={added ? { background: 'var(--cm-cyan)', color: '#020712' } : { background: 'rgba(0,212,255,0.1)', color: 'var(--cm-cyan)', border: '1px solid rgba(0,212,255,0.3)' }}>
            {added ? '✓ Hinzugefügt' : '+ Warenkorb'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?featured=true&limit=8')
      .then(r => setFeatured(r.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Bg effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(0,212,255)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center animate-fade-in">
          {/* Sub-label */}
          <p className="text-xs font-mono tracking-widest mb-6 flex items-center justify-center gap-3" style={{ color: 'var(--cm-muted)' }}>
            <span style={{ color: 'var(--cm-cyan)' }}>VERSCHLÜSSELT</span>
            <span>·</span>
            <span style={{ color: 'var(--cm-cyan)' }}>ANONYM</span>
            <span>·</span>
            <span style={{ color: 'var(--cm-cyan)' }}>SICHER</span>
          </p>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-[0.95]" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>
            Anonymes{' '}
            <span className="text-gradient">Crypto</span>
            <span>-Shopping</span>
          </h1>

          <p className="text-lg mt-5 mb-8 max-w-2xl mx-auto" style={{ color: 'var(--cm-muted)' }}>
            Bezahle sicher mit Bitcoin, Monero & mehr. Weltweiter diskreter Versand.
          </p>

          {/* Crypto badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {CRYPTO_BADGES.map(c => (
              <span key={c.name} className="crypto-badge">
                <span style={{ color: c.color }}>{c.symbol}</span>
                {c.name}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop" className="btn-primary text-base px-8 py-3.5">
              <Zap size={18} /> Alle Produkte
            </Link>
            <Link href="/track" className="btn-secondary text-base px-8 py-3.5">
              <Package size={18} /> Bestellung verfolgen
            </Link>
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { value: '100%', label: 'Anonym', sub: 'Kein Tracking' },
              { value: 'XMR', label: 'Monero', sub: 'Max. Privacy' },
              { value: '∞', label: 'Privatsphäre', sub: 'Garantiert' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black font-mono text-gradient">{s.value}</div>
                <div className="text-xs mt-1 font-semibold" style={{ color: 'var(--cm-text)' }}>{s.label}</div>
                <div className="text-xs" style={{ color: 'var(--cm-muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Shield, title: 'Vollständige Anonymität', desc: 'Keine persönlichen Daten gespeichert. Kein Tracking, kein Verlauf.' },
            { icon: Lock, title: 'Alles verschlüsselt', desc: 'End-to-end gesicherte Transaktionen. Null Überwachung.' },
            { icon: Globe, title: 'Weltweiter Versand', desc: 'Diskreter Versand in alle Länder. Schnell und zuverlässig.' },
          ].map(f => (
            <div key={f.title} className="card p-6 group hover:border-cyan-500/30 transition-all">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--cm-cyan)' }}>
                <f.icon size={22} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--cm-text-bright)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--cm-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--cm-cyan)' }}>Handverlesen</p>
            <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>
              Featured Produkte
            </h2>
          </div>
          <Link href="/shop" className="btn-secondary text-sm px-4 py-2">
            Alle anzeigen <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3]" style={{ background: 'var(--cm-border)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 rounded w-1/3" style={{ background: 'var(--cm-border)' }} />
                  <div className="h-4 rounded" style={{ background: 'var(--cm-border)' }} />
                  <div className="h-3 rounded w-2/3" style={{ background: 'var(--cm-border)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 card rounded-2xl">
            <Package size={56} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--cm-muted)' }} />
            <p className="font-semibold" style={{ color: 'var(--cm-muted)' }}>Produkte kommen bald</p>
          </div>
        )}
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl p-12 text-center card">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.05) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <Eye size={44} className="mx-auto mb-5" style={{ color: 'var(--cm-cyan)' }} />
            <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>
              Deine Privatsphäre ist uns wichtig
            </h2>
            <p className="max-w-xl mx-auto mb-8 text-base" style={{ color: 'var(--cm-muted)' }}>
              Keine Cookies. Kein Tracking. Keine Datenweitergabe. Einfach sauberer, privater Handel.
            </p>
            <Link href="/shop" className="btn-primary text-base px-10 py-3.5">
              Jetzt shoppen <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
