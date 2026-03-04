'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || localStorage.getItem('last_order_number') || '';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderNumber) {
      api.get(`/orders/track/${orderNumber}`).then(r => setOrder(r.data)).catch(() => {});
    }
  }, [orderNumber]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg" style={{ background: 'var(--cm-bg)' }}>
      <div className="card w-full max-w-lg p-10 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}>
          ✅
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>
          Zahlung erfolgreich!
        </h1>
        <p className="mb-6" style={{ color: 'var(--cm-muted)' }}>Deine Bestellung wurde aufgegeben.</p>
        {orderNumber && (
          <div className="px-4 py-3 rounded-xl mb-6" style={{ background: 'var(--cm-surface)', border: '1px solid var(--cm-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--cm-muted)' }}>Bestellnummer</p>
            <p className="font-mono font-bold text-xl" style={{ color: 'var(--cm-cyan)' }}>{orderNumber}</p>
          </div>
        )}
        <p className="text-sm mb-8" style={{ color: 'var(--cm-muted)' }}>
          Du erhältst eine Bestätigung sobald die Zahlung verarbeitet wurde.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/track?order=${orderNumber}`} className="btn-primary px-6 py-2.5 text-sm">📦 Bestellung verfolgen</Link>
          <Link href="/shop" className="btn-secondary px-6 py-2.5 text-sm">Weiter shoppen</Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentFailed() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg" style={{ background: 'var(--cm-bg)' }}>
      <div className="card w-full max-w-lg p-10 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
          style={{ background: 'rgba(244,63,138,0.15)', border: '2px solid rgba(244,63,138,0.4)' }}>
          ❌
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--cm-text-bright)' }}>
          Zahlung fehlgeschlagen
        </h1>
        <p className="mb-8" style={{ color: 'var(--cm-muted)' }}>Die Zahlung konnte nicht abgeschlossen werden.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {orderNumber && <Link href={`/track?order=${orderNumber}`} className="btn-secondary px-6 py-2.5 text-sm">Bestellung prüfen</Link>}
          <Link href="/checkout" className="btn-primary px-6 py-2.5 text-sm">Erneut versuchen</Link>
          <Link href="/support" className="btn-secondary px-6 py-2.5 text-sm">Support kontaktieren</Link>
        </div>
      </div>
    </div>
  );
}
