'use client';
import { useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, Search } from 'lucide-react';

function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(product ? {
    name: product.name, description: product.description || '',
    short_description: product.short_description || '',
    price: product.price, compare_price: product.compare_price || '',
    category_id: product.category_id || '', is_active: product.is_active !== false,
    is_featured: product.is_featured || false,
    stock_quantity: product.stock_quantity || product.stock || 0,
    track_stock: product.track_stock || false,
  } : {
    name: '', description: '', short_description: '', price: '', compare_price: '',
    category_id: '', is_active: true, is_featured: false, stock_quantity: 0, track_stock: false,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [loading, setLoading] = useState(false);
  const imgBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Name und Preis sind Pflichtfelder');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('existingImages', JSON.stringify(existingImages));
      images.forEach(img => fd.append('newImages', img));
      if (product?.id) {
        await api.put(`/products/${product.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produkt aktualisiert');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produkt erstellt');
      }
      onSaved(); onClose();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="card w-full max-w-2xl my-6">
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--cm-border)' }}>
          <h2 className="font-bold text-lg" style={{ color: 'var(--cm-text-bright)' }}>{product ? 'Produkt bearbeiten' : 'Neues Produkt'}</h2>
          <button onClick={onClose} style={{ color: 'var(--cm-muted)' }}><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--cm-muted)' }}>Name *</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="Produktname" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--cm-muted)' }}>Preis (€) *</label>
              <input className="input" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--cm-muted)' }}>Vergleichspreis (€)</label>
              <input className="input" type="number" step="0.01" min="0" value={form.compare_price} onChange={set('compare_price')} placeholder="Optional (für Rabatt)" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--cm-muted)' }}>Kategorie</label>
              <select className="input" value={form.category_id} onChange={set('category_id')}>
                <option value="">Keine Kategorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--cm-muted)' }}>Lagerbestand</label>
              <input className="input" type="number" min="0" value={form.stock_quantity} onChange={set('stock_quantity')} />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--cm-muted)' }}>Kurzbeschreibung</label>
            <input className="input" value={form.short_description} onChange={set('short_description')} placeholder="Kurze Zusammenfassung..." />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: 'var(--cm-muted)' }}>Vollständige Beschreibung</label>
            <textarea className="input" rows={4} value={form.description} onChange={set('description')} placeholder="Detaillierte Produktbeschreibung..." />
          </div>

          <div className="flex gap-6">
            {[['is_active', 'Aktiv'], ['is_featured', 'Empfohlen'], ['track_stock', 'Lager verfolgen']].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form[k]} onChange={set(k)} style={{ accentColor: 'var(--cm-cyan)' }} />
                {l}
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'var(--cm-muted)' }}>Bilder</label>
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={`${imgBase}${img}`} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button onClick={() => setExistingImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold hidden group-hover:flex items-center justify-center"
                      style={{ background: 'var(--cm-pink)', color: 'white' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <input type="file" multiple accept="image/*" className="input text-sm py-2"
              onChange={e => setImages(Array.from(e.target.files))} />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--cm-border)' }}>
          <button onClick={onClose} className="btn-secondary px-5 py-2 text-sm">Abbrechen</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary px-5 py-2 text-sm">
            {loading ? <div className="spinner w-4 h-4" /> : <Save size={15} />}
            {product ? 'Aktualisieren' : 'Erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const imgBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, cr] = await Promise.all([
        api.get('/products/admin/all'),
        api.get('/categories'),
      ]);
      setProducts(pr.data.products || []);
      setCategories(cr.data.categories || []);
    } catch { toast.error('Fehler beim Laden der Produkte'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!confirm('Produkt wirklich deaktivieren?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Produkt deaktiviert'); fetchAll(); }
    catch { toast.error('Fehler'); }
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--cm-muted)' }}>Verwaltung</p>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>Produkte</h1>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary text-sm px-4 py-2.5">
          <Plus size={16} /> Neues Produkt
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cm-muted)' }} />
          <input className="input pl-9 h-10 text-sm" placeholder="Produkt suchen..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {search && <button onClick={() => setSearch('')} className="btn-secondary h-10 px-3"><X size={14} /></button>}
        <span className="ml-auto text-sm self-center" style={{ color: 'var(--cm-muted)' }}>{filtered.length} Produkte</span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategorie</th>
                <th>Preis</th>
                <th>Bestand</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className="h-4 rounded animate-pulse" style={{ background: 'var(--cm-border)', width: '80%' }} /></td>)}</tr>)
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--cm-surface)' }}>
                        {p.images?.[0] ? <img src={`${imgBase}${p.images[0]}`} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-base">📦</div>}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.is_featured && <span className="badge badge-info text-xs">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="text-sm" style={{ color: 'var(--cm-muted)' }}>{p.category_name || '—'}</span></td>
                  <td>
                    <span className="font-mono font-bold text-sm" style={{ color: 'var(--cm-cyan)' }}>€{parseFloat(p.price).toFixed(2)}</span>
                    {p.compare_price && <span className="line-through text-xs ml-2 font-mono" style={{ color: 'var(--cm-muted)' }}>€{parseFloat(p.compare_price).toFixed(2)}</span>}
                  </td>
                  <td><span className="text-sm font-mono">{p.stock_quantity ?? p.stock ?? '∞'}</span></td>
                  <td>
                    <span className={`badge ${p.is_active !== false ? 'badge-success' : 'badge-neutral'} text-xs`}>
                      {p.is_active !== false ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setModal(p)} className="p-1.5 rounded transition-all hover:bg-white/5" style={{ color: 'var(--cm-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color='var(--cm-cyan)'} onMouseLeave={e => e.currentTarget.style.color='var(--cm-muted)'}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded transition-all hover:bg-red-500/10" style={{ color: 'var(--cm-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color='var(--cm-pink)'} onMouseLeave={e => e.currentTarget.style.color='var(--cm-muted)'}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: 'var(--cm-muted)' }}>Keine Produkte gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <ProductModal product={modal === 'new' ? null : modal} categories={categories} onClose={() => setModal(null)} onSaved={fetchAll} />
      )}
    </div>
  );
}
