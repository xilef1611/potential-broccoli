
"use client";
import Link from "next/link";

interface CartProps {
  open: boolean;
  onClose: () => void;
  items: any[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
}

export default function Cart({ open, onClose, items, onRemove, onUpdateQty }: CartProps) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-cyber-dark border-l border-cyber-border flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 border-b border-cyber-border flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">CART <span className="text-cyber-accent">({items.length})</span></h2>
          <button onClick={onClose} className="text-cyber-muted hover:text-white transition-colors text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 text-cyber-muted font-mono">
              <p className="text-4xl mb-4">◈</p>
              <p>Your cart is empty</p>
            </div>
          ) : items.map((item) => (
            <div key={item.cartId} className="flex gap-4 p-4 border border-cyber-border/50 bg-cyber-card/30">
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-white text-sm truncate">{item.name}</div>
                {item.variant && <div className="font-mono text-xs text-cyber-muted">{item.variant.value}</div>}
                <div className="font-mono text-cyber-accent font-bold mt-1">€{(item.price * item.quantity).toFixed(2)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onUpdateQty(item.cartId, Math.max(1, item.quantity - 1))} className="w-6 h-6 border border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-accent transition-colors text-sm">-</button>
                  <span className="font-mono text-sm text-white w-6 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.cartId, item.quantity + 1)} className="w-6 h-6 border border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-accent transition-colors text-sm">+</button>
                  <button onClick={() => onRemove(item.cartId)} className="ml-auto text-cyber-muted hover:text-cyber-pink transition-colors text-sm font-mono">REMOVE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-6 border-t border-cyber-border space-y-4">
            <div className="flex justify-between font-mono">
              <span className="text-cyber-muted">TOTAL</span>
              <span className="text-cyber-accent font-bold text-xl">€{total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="btn-primary w-full block text-center py-4 font-mono font-bold tracking-widest">
              PROCEED TO CHECKOUT →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
