import { useState } from "react";
import { ArrowRight, Beef, Drumstick, Egg, Fish, ShoppingBag, X } from "lucide-react";
import "./_group.css";

const categories = [
  { name: "All", icon: ShoppingBag, count: 32 },
  { name: "Fish", icon: Fish, count: 18 },
  { name: "Prawns", icon: Fish, count: 5 },
  { name: "Chicken", icon: Drumstick, count: 4 },
  { name: "Mutton", icon: Beef, count: 2 },
  { name: "Masalas", icon: Egg, count: 3 },
];

const products = [
  { name: "Rawa" },
  { name: "Pomfret" },
  { name: "Tiger Prawns" },
  { name: "Chicken Curry Cut" },
  { name: "Mutton Keema" },
  { name: "Malvani Masala" },
];

export function FsxRedesign() {
  const [selected, setSelected] = useState("All");
  return (
    <main className="category-menu-preview min-h-screen bg-[#f3e6d4] p-2 sm:p-8 flex items-start sm:items-center justify-center">
      <section className="w-full max-w-[980px] overflow-hidden rounded-2xl border border-[#f2c994] bg-[#7b3a14] shadow-[0_24px_70px_rgba(64,28,10,.3)]">
        <header className="flex items-center justify-between gap-4 px-4 py-4 text-white sm:px-7 sm:py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#f6c27e]">Fresh Stock Xchange</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">Shop by category</h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">Choose a category, then find your fresh favourites.</p>
          </div>
          <button aria-label="Close categories" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/30 text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="bg-[#f7ebdb] px-3 pb-4 pt-2 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {categories.map(({ name, icon: Icon, count }) => (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className={`group flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center transition duration-200 sm:min-h-[92px] ${
                  selected === name
                    ? "border-[#c8651b] bg-[#c8651b] text-white shadow-md"
                    : "border-[#ead3bb] bg-white text-[#7b3a14] hover:-translate-y-0.5 hover:border-[#c8651b] hover:shadow"
                }`}
              >
                <Icon className={`h-5 w-5 ${selected === name ? "text-white" : "text-[#c8651b]"}`} aria-hidden="true" />
                <span className="text-xs font-semibold sm:text-sm">{name}</span>
                <span className={`text-[10px] ${selected === name ? "text-white/80" : "text-[#9d6b4a]"}`}>{count} items</span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#ead3bb] bg-white p-3 sm:mt-5 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#7b3a14] sm:text-lg">{selected === "All" ? "Popular products" : selected}</h2>
                <p className="mt-0.5 text-xs font-medium text-[#8d6953]">Open a product to view details and sizes.</p>
              </div>
              <button className="flex shrink-0 items-center gap-1 rounded-full bg-[#7b3a14] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5c2a0e] sm:px-4">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <button key={product.name} className="flex min-h-[66px] items-center justify-between gap-3 rounded-lg border border-[#f0e3d5] bg-[#fffaf4] px-3 py-3 text-left transition hover:border-[#c8651b] hover:bg-[#fff3e5]">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#7b3a14]">{product.name}</span>
                    <span className="mt-1 block truncate text-xs text-[#8d6953]">View product details</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#c8651b]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
