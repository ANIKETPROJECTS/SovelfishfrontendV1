import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, ShoppingBag, Tag, Trash2, Wallet, X } from "lucide-react";
import "./_group.css";

const items = [
  { name: "POMFRET + PRAWNS", detail: "2kg", price: 2350, image: "/__mockup/images/prawns.png" },
  { name: "Rawas", detail: "900 g · Cleaned and slices", price: 1050, image: "/__mockup/images/fish.png" },
];

export function Current() {
  const [offersOpen, setOffersOpen] = useState(true);

  return (
    <main className="order-summary-preview flex h-screen w-full justify-end bg-[#292522] text-[#65371f]">
      <section className="flex h-full w-full max-w-[420px] flex-col overflow-hidden bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#eee9e5] bg-white px-5 py-4">
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="h-4 w-4" /> Order Summary
          </h1>
          <button aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full bg-[#7b3a14] text-white">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {items.map((item) => (
            <article key={item.name} className="flex items-center gap-3">
              <img src={item.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xs font-semibold">{item.name}</h2>
                <p className="text-[11px] text-[#927e70]">{item.detail}</p>
                <p className="mt-0.5 text-xs font-bold text-[#bd6322]">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#faf9f8] px-2 py-1 text-xs">
                <Trash2 className="h-3.5 w-3.5 text-[#746b65]" />
                <span className="font-semibold">1</span>
                <Plus className="h-3 w-3 text-[#746b65]" />
              </div>
            </article>
          ))}

          <section className="overflow-hidden rounded-xl border border-[#eee9e5]">
            <button onClick={() => setOffersOpen((open) => !open)} className="flex w-full items-center gap-2 px-3 py-3 text-left">
              <Tag className="h-4 w-4 text-[#7b3a14]" />
              <span className="flex-1 text-sm font-semibold">Offers Available</span>
              <ChevronDown className="h-4 w-4 text-[#8f8176]" />
            </button>
            {offersOpen && (
              <div className="space-y-3 border-t border-[#f0ece8] px-3 py-3">
                <div className="flex gap-2">
                  <input placeholder="Enter coupon code" className="h-9 min-w-0 flex-1 rounded-full border border-[#ebe6e1] px-3 text-xs outline-none" />
                  <button className="rounded-full bg-[#7b3a14] px-4 text-xs font-bold text-white">Apply</button>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fffaf6] p-2.5">
                  <div className="flex items-start gap-2">
                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[#bd6322]" />
                    <div>
                      <p className="text-[10px] font-bold">AIROLI_REDRAWAS100</p>
                      <p className="text-[10px] text-[#8f8176]">₹100 off Red Snapper or Rawas orders of ₹1,000 or more</p>
                    </div>
                  </div>
                  <button className="rounded-full bg-[#7b3a14] px-3 py-1.5 text-[10px] font-bold text-white">Apply</button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#eee9e5] p-3">
            <h2 className="mb-3 text-xs font-bold">Bill Details</h2>
            {items.map((item) => (
              <div key={item.name} className="mb-2 flex justify-between gap-3 text-[11px]">
                <span>{item.name} × 1</span><span>₹{item.price}</span>
              </div>
            ))}
            <div className="space-y-2 border-t border-[#eee9e5] pt-2 text-[11px]">
              <div className="flex justify-between"><span>Subtotal</span><span>₹3400</span></div>
              <div className="flex justify-between"><span>Delivery fee</span><span className="font-semibold text-emerald-600">FREE</span></div>
              <div className="flex justify-between border-t border-[#eee9e5] pt-2 text-sm font-bold"><span>Total</span><span>₹3400</span></div>
            </div>
          </section>

          <button className="flex w-full items-center justify-between rounded-xl border border-[#eee9e5] p-3 text-left">
            <span className="flex items-center gap-2 text-xs font-semibold"><Wallet className="h-4 w-4" /> Fresh Stock Xchange Wallet</span>
            <span className="text-xs font-bold text-[#7b3a14]">₹0 <ChevronRight className="inline h-3.5 w-3.5" /></span>
          </button>
        </div>

        <footer className="flex items-center justify-between border-t border-[#eee9e5] bg-white px-4 py-4">
          <div><p className="text-[10px] text-[#8f8176]">Total</p><p className="text-lg font-bold">₹3400</p></div>
          <button className="flex h-11 items-center gap-2 rounded-full bg-[#ef6c18] px-7 text-sm font-bold text-white">
            Pay Now <ChevronRight className="h-4 w-4" />
          </button>
        </footer>
      </section>
    </main>
  );
}
