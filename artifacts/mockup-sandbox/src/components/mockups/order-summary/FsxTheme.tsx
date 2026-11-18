import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, ShoppingBag, Tag, Trash2, Wallet, X } from "lucide-react";
import "./_group.css";

const items = [
  { name: "POMFRET + PRAWNS", detail: "2kg", price: 2350, image: "/__mockup/images/prawns.png" },
  { name: "Rawas", detail: "900 g · Cleaned and slices", price: 1050, image: "/__mockup/images/fish.png" },
];

export function FsxTheme() {
  const [offersOpen, setOffersOpen] = useState(true);

  return (
    <main className="order-summary-preview flex h-screen w-full justify-end bg-[#34241b] text-[#542813]">
      <section className="flex h-full w-full max-w-[420px] flex-col overflow-hidden border-l border-[#dba77d] bg-[#fbf1e6] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#9e5424] bg-gradient-to-r from-[#71330f] to-[#8b3a0f] px-5 py-4 text-white">
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="h-5 w-5" /> Order Summary
          </h1>
          <button aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {items.map((item) => (
            <article key={item.name} className="flex items-center gap-3 rounded-2xl border border-[#e6c7a9] bg-white p-3 shadow-[0_3px_10px_rgba(82,39,15,.07)]">
              <img src={item.image} alt="" className="h-16 w-16 rounded-xl border border-[#f0dfcf] object-cover" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold">{item.name}</h2>
                <p className="text-xs font-medium text-[#8b6a53]">{item.detail}</p>
                <p className="mt-1 text-sm font-bold text-[#a84d12]">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-[#e6c7a9] bg-[#fff8f0] p-1 text-xs">
                <button aria-label="Remove item" className="grid h-7 w-7 place-items-center rounded-full text-[#7b3a14] hover:bg-white"><Trash2 className="h-3.5 w-3.5" /></button>
                <span className="w-5 text-center font-bold">1</span>
                <button aria-label="Increase quantity" className="grid h-7 w-7 place-items-center rounded-full text-[#7b3a14] hover:bg-white"><Plus className="h-3.5 w-3.5" /></button>
              </div>
            </article>
          ))}

          <section className="overflow-hidden rounded-2xl border border-[#e6c7a9] bg-white shadow-[0_3px_10px_rgba(82,39,15,.05)]">
            <button onClick={() => setOffersOpen((open) => !open)} className="flex w-full items-center gap-2.5 bg-[#fff5e9] px-4 py-3.5 text-left transition hover:bg-[#ffedd9]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#7b3a14] text-white"><Tag className="h-4 w-4" /></span>
              <span className="flex-1 text-sm font-bold">Offers Available</span>
              <ChevronDown className={`h-4 w-4 text-[#7b3a14] transition-transform ${offersOpen ? "rotate-180" : ""}`} />
            </button>
            {offersOpen && (
              <div className="space-y-3 border-t border-[#f0dfcf] p-3.5">
                <div className="flex gap-2">
                  <input placeholder="Enter coupon code" className="h-10 min-w-0 flex-1 rounded-full border border-[#e6c7a9] bg-[#fffdfb] px-4 text-xs outline-none transition focus:border-[#c8651b]" />
                  <button className="rounded-full bg-[#c8651b] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#a84d12]">Apply</button>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#f0dfcf] bg-[#fffaf5] p-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f3dfca] text-[#7b3a14]"><Tag className="h-3.5 w-3.5" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-bold tracking-wide">AIROLI_REDRAWAS100</p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-[#80634e]">₹100 off Red Snapper or Rawas orders of ₹1,000 or more</p>
                    </div>
                  </div>
                  <button className="shrink-0 rounded-full bg-[#7b3a14] px-3.5 py-2 text-[10px] font-bold text-white transition hover:bg-[#5c2a0e]">Apply</button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#e6c7a9] bg-white p-4 shadow-[0_3px_10px_rgba(82,39,15,.05)]">
            <h2 className="mb-3 text-sm font-bold">Bill Details</h2>
            {items.map((item) => (
              <div key={item.name} className="mb-2.5 flex justify-between gap-3 text-xs">
                <span className="min-w-0 truncate font-medium">{item.name} × 1</span><span className="shrink-0 font-semibold">₹{item.price}</span>
              </div>
            ))}
            <div className="space-y-2.5 border-t border-[#ead9c8] pt-3 text-xs">
              <div className="flex justify-between"><span className="text-[#80634e]">Subtotal</span><span className="font-semibold">₹3400</span></div>
              <div className="flex justify-between"><span className="text-[#80634e]">Delivery fee</span><span className="font-bold text-emerald-700">FREE</span></div>
              <div className="flex justify-between border-t border-[#ead9c8] pt-3 text-sm font-bold"><span>Total</span><span className="text-[#a84d12]">₹3400</span></div>
            </div>
          </section>

          <button className="flex w-full items-center justify-between rounded-2xl border border-[#e6c7a9] bg-white p-3.5 text-left shadow-[0_3px_10px_rgba(82,39,15,.05)]">
            <span className="flex items-center gap-2.5 text-xs font-semibold"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f3dfca] text-[#7b3a14]"><Wallet className="h-4 w-4" /></span> Fresh Stock Xchange Wallet</span>
            <span className="text-xs font-bold text-[#7b3a14]">₹0 <ChevronRight className="inline h-3.5 w-3.5" /></span>
          </button>
        </div>

        <footer className="flex items-center justify-between border-t border-[#e4c2a2] bg-[#fffaf4] px-4 py-4 shadow-[0_-6px_18px_rgba(76,35,13,.08)]">
          <div><p className="text-xs font-semibold text-[#80634e]">Total</p><p className="text-xl font-extrabold text-[#7b3a14]">₹3400</p></div>
          <button className="flex h-12 items-center gap-2 rounded-full bg-[#c8651b] px-7 text-sm font-bold text-white shadow-[0_5px_14px_rgba(200,101,27,.25)] transition hover:bg-[#a84d12]">
            Pay Now <ChevronRight className="h-4 w-4" />
          </button>
        </footer>
      </section>
    </main>
  );
}
