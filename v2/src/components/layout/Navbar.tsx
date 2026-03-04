
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface NavbarProps {
  cartCount?: number;
  onCartOpen?: () => void;
}

export default function Navbar({ cartCount = 0, onCartOpen }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user));
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-cyber-black/95 border-b border-cyber-border backdrop-blur-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display font-black text-2xl text-white hover:text-cyber-accent transition-colors">
          ASKLEPI<span className="text-cyber-accent">0</span>S
        </Link>
        <div className="hidden md:flex items-center gap-8 font-mono text-sm">
          <Link href="/shop" className="text-cyber-text hover:text-cyber-accent transition-colors tracking-wider">SHOP</Link>
          <Link href="/support" className="text-cyber-text hover:text-cyber-accent transition-colors tracking-wider">SUPPORT</Link>
          {user?.role === "admin" && <Link href="/admin/dashboard" className="text-cyber-pink hover:text-pink-400 transition-colors tracking-wider">ADMIN</Link>}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/account/orders" className="font-mono text-sm text-cyber-muted hover:text-cyber-accent transition-colors">
              {user.email.split("@")[0]}
            </Link>
          ) : (
            <Link href="/account/login" className="font-mono text-sm text-cyber-muted hover:text-cyber-accent transition-colors">LOGIN</Link>
          )}
          <button onClick={onCartOpen} className="relative btn-primary text-sm px-4 py-2">
            CART
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-cyber-accent text-cyber-black text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
