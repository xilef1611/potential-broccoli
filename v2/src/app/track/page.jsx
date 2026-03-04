'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import api from '@/lib/api';
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  pending: { label: 'Pending Payment', icon: Clock, color: 'text-yellow-400', badge: 'badge-warning' },
  paid_not_shipped: { label: 'Paid — Preparing', icon: Package, color: 'text-blue-400', badge: 'badge-info' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-400', badge: 'badge-info' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-ask-accent', badge: 'badge-success' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-400', badge: 'badge-success' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-400', badge: 'badge-danger' },
};

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderNum, setOrderNum] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('order')) handleTrack(searchParams.get('order'));
  }, []);

  const handleTrack = async (num) => {
    const n = (num || orderNum).trim().toUpperCase();
    if (!n) return toast.error('Enter an order number');
    setLoading(true);
    setSearched(true);
    try {
      const r = await api.get(`/orders/track/${n}`);
      setOrder(r.data);
    } catch {
      setOrder(null);
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const status = order ? STATUS_MAP[order.order_status] || STATUS_MAP.pending : null;
  const items = order?.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black mb-2">TRACK <span className="text-gradient">ORDER</span></h1>
      <p className="text-ask-muted mb-8">Enter your order number to check its status</p>

      <div className="flex gap-2 mb-8">
        <input
          className="input flex-1"
          placeholder="ORD-000001"
          value={orderNum}
          onChange={e => setOrderNum(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
        />
        <button onClick={() => handleTrack()} disabled={loading}
          className="btn-primary px-6 flex items-center gap-2">
          {loading ? <div className="spinner w-4 h-4" /> : <Search size={18} />}
        </button>
      </div>

      {searched && !loading && !order && (
        <div className="card p-8 text-center">
          <XCircle size={48} className="mx-auto mb-3 text-red-400 opacity-50" />
          <p className="text-ask-muted">Order not found. Check the order number and try again.</p>
        </div>
      )}

      {order && status && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="font-mono text-ask-accent font-bold text-xl">{order.order_number}</span>
              <p className="text-ask-muted text-sm mt-1">
                Placed {new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
            <span className={`badge ${status.badge}`}>{status.label}</span>
          </div>

          {/* Status progress */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto">
            {['pending', 'paid_not_shipped', 'shipped', 'delivered'].map((s, i) => {
              const statuses = ['pending', 'paid_not_shipped', 'shipped', 'delivered'];
              const currentIdx = statuses.indexOf(order.order_status);
              const done = i <= currentIdx;
              const S = STATUS_MAP[s];
              return (
                <div key={s} className="flex items-center gap-1 shrink-0">
                  <div className={`flex items-center gap-1 text-xs ${done ? 'text-ask-accent' : 'text-ask-muted'}`}>
                    <S.icon size={16} />
                    <span className="hidden md:block">{S.label}</span>
                  </div>
                  {i < 3 && <div className={`w-8 h-px ${done ? 'bg-ask-accent' : 'bg-ask-border'}`} />}
                </div>
              );
            })}
          </div>

          {order.tracking_number && (
            <div className="p-3 bg-ask-accent/10 border border-ask-accent/20 rounded-xl mb-4">
              <p className="text-xs text-ask-muted">Tracking Number</p>
              <p className="font-mono text-ask-accent font-bold">{order.tracking_number}</p>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-ask-muted uppercase tracking-wider">Items</h3>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.name} {item.variant_name ? `(${item.variant_name})` : ''} ×{item.quantity}</span>
                <span className="font-mono text-ask-accent">€{parseFloat(item.total).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-ask-border flex justify-between font-bold">
              <span>Total</span>
              <span className="font-mono text-ask-accent">€{parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return <Layout><Suspense fallback={<div className="p-16 text-center"><div className="spinner w-8 h-8 mx-auto" /></div>}><TrackContent /></Suspense></Layout>;
}
