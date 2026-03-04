
"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductCardProps {
  product: any;
  onAddToCart: (product: any, variant?: any, qty?: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [added, setAdded] = useState(false);

  const price = product.price + (selectedVariant?.price_modifier || 0);

  function handleAdd() {
    onAddToCart(product, selectedVariant, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="card-cyber group hover:border-cyber-accent/30 transition-all duration-300 flex flex-col">
      <div className="relative h-48 bg-cyber-dark/50 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl text-cyber-border">◈</span>
          </div>
        )}
        {product.featured && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-cyber-accent text-cyber-black font-mono text-xs font-bold">
            FEATURED
          </div>
        )}
        <div className="absolute top-2 right-2 font-mono text-cyber-accent font-bold text-lg">
          €{price.toFixed(2)}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="font-mono text-cyber-muted text-xs mb-1">{product.category_name || "UNCATEGORIZED"}</div>
        <h3 className="font-display font-bold text-white text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-cyber-muted text-sm font-mono flex-1 line-clamp-3 mb-4">{product.description}</p>
        {product.variants?.length > 0 && (
          <div className="mb-4">
            <div className="font-mono text-xs text-cyber-muted mb-2">VARIANT:</div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                  className={`px-3 py-1 font-mono text-xs border transition-colors ${selectedVariant?.id === v.id ? "border-cyber-accent text-cyber-accent bg-cyber-accent/10" : "border-cyber-border text-cyber-muted hover:border-cyber-accent/50"}`}
                >
                  {v.value}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={handleAdd}
          className={`w-full py-3 font-mono font-bold text-sm tracking-widest transition-all duration-300 ${added ? "bg-cyber-accent text-cyber-black" : "btn-primary"}`}
        >
          {added ? "✓ ADDED" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}
