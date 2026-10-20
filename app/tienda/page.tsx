'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { I18nProvider, useI18n } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/superadmin/LanguageSwitcher';
import {
  ShoppingBag,
  ShoppingCart,
  X,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

interface CartItem extends Product {
  quantity: number;
}

function StoreFrontContent() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  // Checkout form
  const [customerName, setCustomerName] = useState('Cliente Demo');
  const [customerEmail, setCustomerEmail] = useState('comprador@latotaltienda.es');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/store/products?category=${categoryFilter}`);
      const json = await res.json();
      if (json.ok) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          items: cart.map(i => ({
            productId: i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          totalAmount: subtotal,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setOrderComplete(json.data.orderId);
        setCart([]);
        setIsCheckoutOpen(false);
        fetchProducts(); // refresh stock
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#171717] flex flex-col font-sans">
      {/* Black & Red Commercial Header (Amazon-like clarity, strictly NO search bar per Rule 9) */}
      <header className="sticky top-0 z-40 bg-[#111111] text-white border-b border-neutral-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#D71920] flex items-center justify-center shadow-lg shadow-red-950">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white">
                  Fenix<span className="text-[#D71920]">Store</span>
                </span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {t('zone.shop')} (Zona 4)
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageSwitcher />

            {/* Cart Button with Badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1B1B1B] hover:bg-neutral-800 border border-neutral-700 text-white transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-[#D71920]" />
              <span className="text-xs font-bold hidden sm:inline">{t('shop.cart')}</span>
              {totalItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D71920] text-white text-[11px] font-extrabold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner with Modern Store Visual */}
      <div className="bg-[#1B1B1B] text-white border-b border-neutral-800 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold tracking-widest text-[#D71920] uppercase">
              Módulo E-Commerce FenixCMS
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
              {t('shop.title')}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300">
              {t('shop.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-300">
            <div className="flex items-center gap-2 bg-[#111111] p-3 rounded-lg border border-neutral-800">
              <Truck className="w-4 h-4 text-[#D71920]" />
              <span>Envío 24/48h</span>
            </div>
            <div className="flex items-center gap-2 bg-[#111111] p-3 rounded-lg border border-neutral-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantía Oficial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24 flex-1 space-y-6">
        {/* Category Filter Bar (Strict: Dropdown selector, NO text search bar) */}
        <div className="bg-white rounded-lg p-4 border border-[#DDDDDD] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#626262]">{t('shop.category')}:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs bg-white border border-[#DDDDDD] rounded px-3 py-1.5 font-medium text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#D71920]"
            >
              <option value="ALL">{t('shop.allCategories')}</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Fotografía">Fotografía</option>
            </select>
          </div>

          <div className="text-xs text-[#626262]">
            Mostrando <span className="font-bold text-[#171717]">{products.length}</span> productos
          </div>
        </div>

        {/* Order Success Banner */}
        {orderComplete && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">{t('shop.orderPlaced')}</h3>
                <p className="text-xs text-emerald-800">
                  Referencia de pedido: <span className="font-mono font-bold">{orderComplete}</span> · Confirmación enviada por email.
                </p>
              </div>
            </div>
            <button
              onClick={() => setOrderComplete(null)}
              className="text-xs font-semibold px-3 py-1 rounded bg-emerald-200 text-emerald-900 hover:bg-emerald-300"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden shadow-xs hover:shadow-md hover:border-neutral-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-48 bg-neutral-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/75 text-white backdrop-blur-xs">
                    {product.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm text-[#171717] line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-[#626262] mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-[#171717]">
                        {product.price.toFixed(2)} €
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {product.stock} disponibles
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="w-full py-2 px-3 rounded-lg bg-[#D71920] hover:bg-[#A81218] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{t('action.addToCart')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#DDDDDD]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#D71920]" />
                  <h2 className="text-base font-bold text-[#171717]">{t('shop.cart')}</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded text-[#626262] hover:text-[#171717]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[60vh]">
                {cart.length === 0 ? (
                  <p className="py-8 text-center text-xs text-[#626262]">{t('shop.emptyCart')}</p>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-[#DDDDDD] flex items-center justify-between gap-3 bg-neutral-50/50"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-xs text-[#171717]">{item.name}</div>
                        <div className="text-xs text-[#D71920] font-semibold mt-0.5">
                          {item.price.toFixed(2)} €
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded border border-[#DDDDDD] bg-white flex items-center justify-center text-xs hover:bg-neutral-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded border border-[#DDDDDD] bg-white flex items-center justify-center text-xs hover:bg-neutral-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-[#DDDDDD] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#626262]">{t('shop.total')}:</span>
                  <span className="font-extrabold text-[#171717] text-lg">{subtotal.toFixed(2)} €</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#D71920] hover:bg-[#A81218] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <span>{t('action.checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal Form */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full border border-[#DDDDDD] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDDDD] mb-4">
              <h3 className="text-base font-bold text-[#171717]">Finalizar Compra</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-[#626262]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-[#DDDDDD] rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-[#DDDDDD] rounded"
                />
              </div>

              <div className="p-3 rounded bg-neutral-50 border border-[#DDDDDD] flex justify-between items-center">
                <span className="font-semibold text-[#626262]">Total del Pedido:</span>
                <span className="font-extrabold text-base text-[#171717]">{subtotal.toFixed(2)} €</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded bg-[#D71920] hover:bg-[#A81218] text-white font-bold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="p-4 text-center text-xs text-[#626262] border-t border-[#DDDDDD] bg-white">
        FenixStore · E-Commerce Integrado de FenixCMS SaaS · 7 Idiomas
      </footer>
    </div>
  );
}

export default function StoreFrontPage() {
  return <StoreFrontContent />;
}
