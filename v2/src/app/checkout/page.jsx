'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { useCartStore } from '@/lib/store';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { Shield, Package, Tag, X } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [form, setForm] = useState({
    customer_email: '', customer_name: '',
    street: '', city: '', zip: '', country: 'Deutschland',
    customer_note: '',
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const r = await api.post('/coupons/validate', { code: coupon.trim().toUpperCase(), order_total: getTotal() });
      setCouponApplied(r.data);
      toast.success(`Gutschein angewendet: ${r.data.code}`);
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Ungültiger Gutschein');
      setCouponApplied(null);
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponApplied(null); setCoupon(''); };

  const getDiscountedTotal = () => {
    const total = getTotal();
    if (!couponApplied) return total;
    if (couponApplied.type === 'percent') return Math.max(0, total - (total * couponApplied.value / 100));
    return Math.max(0, total - couponApplied.value);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <Package size={64} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--cm-muted)' }} />
          <h2 className="text-2xl font-bold mb-2">Warenkorb ist leer</h2>
          <Link href="/shop" className="btn-primary inline-flex mt-4 px-8 py-3">Zum Shop</Link>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async () => {
    const required = ['customer_email', 'customer_name', 'street', 'city', 'zip', 'country'];
    for (const f of required) {
      if (!form[f].trim()) return toast.error(`Bitte fülle ${f.replace('_', ' ')} aus`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) return toast.error('Gültige E-Mail eingeben');
    setLoading(true);
    try {
      const payload = {
        customer_email: form.customer_email,
        customer_name: form.customer_name,
        shipping_address: { street: form.street, city: form.city, zip: form.zip, country: form.country },
        items: items.map(i => ({ product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity })),
        customer_note: form.customer_note || undefined,
        coupon_code: couponApplied?.code || undefined,
      };
      const r = await api.post('/orders', payload);
      localStorage.setItem('last_order_number', r.data.order_number);
      clearCart();
      toast.success('Bestellung erstellt! Weiterleitung zur Zahlung...');
      if (r.data.pay_link) {
        setTimeout(() => { window.location.href = r.data.pay_link; }, 1500);
      } else {
        router.push(`/payment-success?order=${r.data.order_number}`);
      }
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const total = getTotal();
  const finalTotal = getDiscountedTotal();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>
          Kasse
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-5">
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--cm-text-bright)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'var(--cm-cyan)', color: '#020712' }}>1</span>
                Kontaktinformationen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium" style={{ color: 'var(--cm-muted)' }}>Vollständiger Name *</label>
                  <input className="input" placeholder="Max Mustermann" value={form.customer_name} onChange={set('customer_name')} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium" style={{ color: 'var(--cm-muted)' }}>E-Mail *</label>
                  <input className="input" type="email" placeholder="du@beispiel.de" value={form.customer_email} onChange={set('customer_email')} />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--cm-text-bright)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'var(--cm-cyan)', color: '#020712' }}>2</span>
                Lieferadresse
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium" style={{ color: 'var(--cm-muted)' }}>Straße & Hausnummer *</label>
                  <input className="input" placeholder="Musterstraße 1" value={form.street} onChange={set('street')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium" style={{ color: 'var(--cm-muted)' }}>Stadt *</label>
                    <input className="input" placeholder="Berlin" value={form.city} onChange={set('city')} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium" style={{ color: 'var(--cm-muted)' }}>PLZ *</label>
                    <input className="input" placeholder="10115" value={form.zip} onChange={set('zip')} />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium" style={{ color: 'var(--cm-muted)' }}>Land *</label>
                  <input className="input" placeholder="Deutschland" value={form.country} onChange={set('country')} />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--cm-text-bright)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'var(--cm-border)', color: 'var(--cm-muted)' }}>3</span>
                Anmerkung <span className="text-sm font-normal" style={{ color: 'var(--cm-muted)' }}>(optional)</span>
              </h2>
              <textarea className="input" rows={3} placeholder="Besondere Wünsche..." value={form.customer_note} onChange={set('customer_note')} />
            </div>

            <div className="flex items-start gap-3 text-sm p-4 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Shield size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--cm-cyan)' }} />
              <p style={{ color: 'var(--cm-muted)' }}>Deine Daten werden nur zur Bearbeitung und Lieferung verwendet. Wir speichern sie nicht dauerhaft.</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--cm-text-bright)' }}>Bestellübersicht</h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.key} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden" style={{ background: 'var(--cm-border)' }}>
                      {item.image && (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api','')}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      {item.variant_name && <p className="text-xs" style={{ color: 'var(--cm-muted)' }}>{item.variant_name}</p>}
                      <p className="text-xs" style={{ color: 'var(--cm-muted)' }}>×{item.quantity}</p>
                    </div>
                    <span className="font-mono shrink-0" style={{ color: 'var(--cm-cyan)' }}>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-5 pt-4 border-t" style={{ borderColor: 'var(--cm-border)' }}>
                {couponApplied ? (
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <div className="flex items-center gap-2">
                      <Tag size={14} style={{ color: 'var(--cm-green)' }} />
                      <span className="text-sm font-mono font-bold" style={{ color: 'var(--cm-green)' }}>{couponApplied.code}</span>
                      <span className="text-xs" style={{ color: 'var(--cm-green)' }}>
                        -{couponApplied.type === 'percent' ? `${couponApplied.value}%` : `€${couponApplied.value}`}
                      </span>
                    </div>
                    <button onClick={removeCoupon} style={{ color: 'var(--cm-muted)' }}><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input className="input flex-1 text-sm h-10" placeholder="Gutscheincode" value={coupon}
                      onChange={e => setCoupon(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                    <button onClick={applyCoupon} disabled={couponLoading} className="btn-secondary h-10 px-3 text-sm shrink-0">
                      {couponLoading ? <div className="spinner w-4 h-4" /> : 'Einlösen'}
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-5 space-y-2" style={{ borderColor: 'var(--cm-border)' }}>
                <div className="flex justify-between text-sm" style={{ color: 'var(--cm-muted)' }}>
                  <span>Zwischensumme</span>
                  <span className="font-mono">€{total.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm" style={{ color: 'var(--cm-green)' }}>
                    <span>Rabatt ({couponApplied.code})</span>
                    <span className="font-mono">-€{(total - finalTotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm" style={{ color: 'var(--cm-muted)' }}>
                  <span>Versand</span>
                  <span style={{ color: 'var(--cm-cyan)' }}>Wird bei Zahlung berechnet</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-3 border-t" style={{ borderColor: 'var(--cm-border)' }}>
                  <span>Gesamt</span>
                  <span className="font-mono" style={{ color: 'var(--cm-cyan)' }}>€{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: 'rgba(247,147,26,0.05)', border: '1px solid rgba(247,147,26,0.2)' }}>
                <span className="text-xl">₿</span>
                <div>
                  <p className="text-sm font-semibold">Crypto-Zahlung</p>
                  <p className="text-xs" style={{ color: 'var(--cm-muted)' }}>BTC, ETH, XMR, USDT & mehr via Oxapay</p>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? <><div className="spinner w-5 h-5" /> Wird verarbeitet...</> : 'Zur Zahlung →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
