'use client';
import { useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { FileDown, Search, X, Package, ChevronLeft, ChevronRight, Printer, ExternalLink } from 'lucide-react';

const STATUS_BADGES = {
  pending: 'badge-warning', paid_not_shipped: 'badge-info', processing: 'badge-info',
  shipped: 'badge-success', delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-danger',
};
const STATUS_DE = {
  pending: 'Ausstehend', paid_not_shipped: 'Bezahlt', processing: 'In Bearbeitung',
  shipped: 'Versendet', delivered: 'Geliefert', cancelled: 'Storniert', refunded: 'Rückerstattet',
};
const ORDER_STATUSES = ['pending', 'paid_not_shipped', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

function OrderDetail({ order, onUpdate, onClose }) {
  const [status, setStatus] = useState(order.order_status);
  const [tracking, setTracking] = useState(order.tracking_number || '');
  const [note, setNote] = useState(order.admin_note || '');
  const [saving, setSaving] = useState(false);
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/orders/admin/${order.id}`, { order_status: status, tracking_number: tracking, admin_note: note });
      toast.success('Bestellung aktualisiert');
      onUpdate();
      onClose();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10" style={{ background: 'var(--cm-card)', borderColor: 'var(--cm-border)' }}>
          <div>
            <span className="font-mono font-bold" style={{ color: 'var(--cm-cyan)' }}>{order.order_number}</span>
            <span className={`badge ${STATUS_BADGES[order.order_status] || 'badge-neutral'} text-xs ml-3`}>{STATUS_DE[order.order_status] || order.order_status}</span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--cm-muted)' }}>✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--cm-surface)', border: '1px solid var(--cm-border)' }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--cm-muted)' }}>Kunde</p>
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-sm" style={{ color: 'var(--cm-muted)' }}>{order.customer_email || order.email}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--cm-surface)', border: '1px solid var(--cm-border)' }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--cm-muted)' }}>Betrag</p>
              <p className="text-2xl font-black font-mono" style={{ color: 'var(--cm-cyan)' }}>
                €{parseFloat(order.total_amount || order.total || 0).toFixed(2)}
              </p>
              <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'} text-xs`}>
                {order.payment_status === 'paid' ? 'Bezahlt' : 'Ausstehend'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--cm-muted)' }}>Artikel ({items.length})</p>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--cm-surface)' }}>
                  <div>
                    <p className="text-sm font-medium">{item.product_name || item.name}</p>
                    {item.variant_info && <p className="text-xs" style={{ color: 'var(--cm-muted)' }}>{JSON.stringify(item.variant_info)}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono" style={{ color: 'var(--cm-cyan)' }}>€{parseFloat(item.subtotal || item.unit_price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs" style={{ color: 'var(--cm-muted)' }}>×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--cm-muted)' }}>Bestellung bearbeiten</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--cm-muted)' }}>Status</label>
                <select className="input text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_DE[s] || s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--cm-muted)' }}>Tracking-Nummer</label>
                <input className="input text-sm" placeholder="Optional" value={tracking} onChange={e => setTracking(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--cm-muted)' }}>Admin-Notiz</label>
              <input className="input text-sm" placeholder="Interne Notiz..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>

          {order.oxapay_pay_link && (
            <a href={order.oxapay_pay_link} target="_blank" rel="noopener noreferrer"
              className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2">
              <ExternalLink size={14} /> Zahlungslink öffnen
            </a>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--cm-border)' }}>
          <button onClick={onClose} className="btn-secondary text-sm px-4 py-2">Abbrechen</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2">
            {saving ? <div className="spinner w-4 h-4" /> : null}
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: PER_PAGE, offset: page * PER_PAGE });
      if (search) params.set('search', search);
      if (tab !== 'all') params.set('order_status', tab);
      const r = await api.get(`/orders/admin/all?${params}`);
      setOrders(r.data.orders || []);
      setTotal(r.data.total || 0);
    } catch { toast.error('Fehler beim Laden der Bestellungen'); }
    finally { setLoading(false); }
  }, [tab, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const TABS = [
    { key: 'all', label: 'Alle' },
    { key: 'paid_not_shipped', label: '📦 Zu versenden' },
    { key: 'shipped', label: '🚀 Versendet' },
    { key: 'pending', label: '⏳ Ausstehend' },
    { key: 'delivered', label: '✅ Geliefert' },
    { key: 'cancelled', label: '❌ Storniert' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--cm-muted)' }}>Verwaltung</p>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>Bestellungen</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { const a = document.createElement('a'); a.href = `${process.env.NEXT_PUBLIC_API_URL}/admin/orders/export`; a.download = 'orders.csv'; document.body.appendChild(a); a.click(); a.remove(); }}
            className="btn-secondary text-sm px-4 py-2">
            <FileDown size={15} /> CSV Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(0); }}
            className={`cat-tab ${tab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cm-muted)' }} />
          <input className="input pl-9 h-10 text-sm" placeholder="Bestellnr., Name, E-Mail..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
        </div>
        {search && <button onClick={() => setSearch('')} className="btn-secondary h-10 px-3"><X size={14} /></button>}
        <span className="ml-auto text-sm self-center" style={{ color: 'var(--cm-muted)' }}>{total} Bestellungen</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Bestell-Nr.</th>
                <th>Datum</th>
                <th>Kunde</th>
                <th>Artikel</th>
                <th>Gesamt</th>
                <th>Status</th>
                <th>Zahlung</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => <td key={j}><div className="h-4 rounded animate-pulse" style={{ background: 'var(--cm-border)', width: '80%' }} /></td>)}</tr>
                ))
              ) : orders.map(order => {
                const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
                return (
                  <tr key={order.id}>
                    <td><span className="font-mono text-xs font-bold" style={{ color: 'var(--cm-cyan)' }}>{order.order_number}</span></td>
                    <td><span className="text-xs" style={{ color: 'var(--cm-muted)' }}>{new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span></td>
                    <td>
                      <div>
                        <p className="text-sm font-medium">{order.customer_name}</p>
                        <p className="text-xs" style={{ color: 'var(--cm-muted)' }}>{order.customer_email || order.email}</p>
                      </div>
                    </td>
                    <td><span className="text-sm">{items.length} Artikel</span></td>
                    <td><span className="font-mono font-bold text-sm" style={{ color: 'var(--cm-cyan)' }}>€{parseFloat(order.total_amount || order.total || 0).toFixed(2)}</span></td>
                    <td><span className={`badge ${STATUS_BADGES[order.order_status] || 'badge-neutral'} text-xs`}>{STATUS_DE[order.order_status] || order.order_status}</span></td>
                    <td><span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'} text-xs`}>{order.payment_status === 'paid' ? 'Bezahlt' : 'Offen'}</span></td>
                    <td>
                      <button onClick={() => setSelected(order)}
                        className="text-xs px-2 py-1 rounded transition-all"
                        style={{ color: 'var(--cm-cyan)', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-sm" style={{ color: 'var(--cm-muted)' }}>Keine Bestellungen gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {total > PER_PAGE && (
          <div className="flex justify-center gap-2 p-4 border-t" style={{ borderColor: 'var(--cm-border)' }}>
            <button onClick={() => setPage(p => p-1)} disabled={page === 0} className="btn-secondary text-sm px-3 py-2"><ChevronLeft size={16}/></button>
            <span className="px-3 py-2 text-sm" style={{ color: 'var(--cm-muted)' }}>Seite {page+1} / {Math.ceil(total/PER_PAGE)}</span>
            <button onClick={() => setPage(p => p+1)} disabled={(page+1)*PER_PAGE >= total} className="btn-secondary text-sm px-3 py-2"><ChevronRight size={16}/></button>
          </div>
        )}
      </div>

      {selected && <OrderDetail order={selected} onUpdate={fetchOrders} onClose={() => setSelected(null)} />}
    </div>
  );
}
