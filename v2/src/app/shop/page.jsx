'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { Package, Search, X } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const imgBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  return (
    <div className="product-card group overflow-hidden flex flex-col">
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', background: 'var(--cm-surface)' }}>
          {product.images?.[0] ? (
            <img src={`${imgBase}${product.images[0]}`} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Package size={36} className="opacity-20" style={{ color: 'var(--cm-muted)' }} />
              <span className="text-xs opacity-30 font-mono px-4 text-center" style={{ color: 'var(--cm-muted)' }}>{product.name}</span>
            </div>
          )}
          {product.is_featured && <span className="badge badge-info absolute top-2 left-2 text-xs">✦ Featured</span>}
          {product.compare_price && (
            <span className="badge badge-danger absolute top-2 right-2 text-xs">
              -{Math.round((1 - product.price / product.compare_price) * 100)}%
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--cm-cyan)', opacity: 0.8 }}>
          {product.category_name || 'Allgemein'}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 hover:text-cyan-300 transition-colors" style={{ color: 'var(--cm-text-bright)' }}>
            {product.name}
          </h3>
        </Link>
        {product.short_description && (
          <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--cm-muted)' }}>{product.short_description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'var(--cm-border)' }}>
          <div>
            <span className="font-mono font-bold" style={{ color: 'var(--cm-cyan)' }}>€{parseFloat(product.price).toFixed(2)}</span>
            {product.compare_price && (
              <span className="line-through text-xs ml-1.5 font-mono" style={{ color: 'var(--cm-muted)' }}>€{parseFloat(product.compare_price).toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => { addItem(product); setAdded(true); toast.success('Zum Warenkorb hinzugefügt'); setTimeout(() => setAdded(false), 2000); }}
            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
            style={added
              ? { background: 'var(--cm-cyan)', color: '#020712' }
              : { background: 'rgba(0,212,255,0.1)', color: 'var(--cm-cyan)', border: '1px solid rgba(0,212,255,0.3)' }}>
            {added ? '✓ Hinzugefügt' : '+ Warenkorb'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const PER_PAGE = 24;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: PER_PAGE, offset: page * PER_PAGE });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const r = await api.get(`/products?${params}`);
      setProducts(r.data.products);
      setTotal(r.data.total);
    } catch { toast.error('Produkte konnten nicht geladen werden'); }
    finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--cm-cyan)' }}>Verschlüsselt · Anonym · Sicher</p>
          <h1 className="text-4xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>
            Anonymes <span className="text-gradient">Crypto</span>-Shopping
          </h1>
          <p className="text-sm" style={{ color: 'var(--cm-muted)' }}>Bezahle sicher mit Bitcoin, Monero & mehr. Weltweiter diskreter Versand.</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => { setCategory(''); setPage(0); }}
            className={`cat-tab ${!category ? 'active' : ''}`}>
            Alle Produkte
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => { setCategory(c.slug); setPage(0); }}
              className={`cat-tab ${category === c.slug ? 'active' : ''}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cm-muted)' }} />
            <input type="text" placeholder="Produkte suchen..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="input pl-9 h-10 text-sm" />
          </div>
          {(search || category) && (
            <button onClick={() => { setSearch(''); setCategory(''); setPage(0); }}
              className="btn-secondary h-10 px-3 flex items-center gap-1.5 text-sm">
              <X size={14} /> Zurücksetzen
            </button>
          )}
          {total > 0 && (
            <span className="ml-auto text-sm self-center" style={{ color: 'var(--cm-muted)' }}>
              {total} Produkte
            </span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="card animate-pulse overflow-hidden">
                <div className="aspect-[4/3]" style={{ background: 'var(--cm-border)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 rounded w-1/3" style={{ background: 'var(--cm-border)' }} />
                  <div className="h-4 rounded" style={{ background: 'var(--cm-border)' }} />
                  <div className="h-3 rounded w-2/3" style={{ background: 'var(--cm-border)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {total > PER_PAGE && (
              <div className="flex justify-center gap-2 mt-12">
                {page > 0 && (
                  <button onClick={() => setPage(p => p - 1)} className="btn-secondary px-5 py-2 text-sm">← Zurück</button>
                )}
                <span className="px-4 py-2 text-sm" style={{ color: 'var(--cm-muted)' }}>
                  Seite {page + 1} von {Math.ceil(total / PER_PAGE)}
                </span>
                {(page + 1) * PER_PAGE < total && (
                  <button onClick={() => setPage(p => p + 1)} className="btn-secondary px-5 py-2 text-sm">Weiter →</button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 card rounded-2xl">
            <Package size={56} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--cm-muted)' }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--cm-muted)' }}>Keine Produkte gefunden</p>
            {(search || category) && (
              <button onClick={() => { setSearch(''); setCategory(''); }} className="btn-secondary mt-4 text-sm px-5 py-2">
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
