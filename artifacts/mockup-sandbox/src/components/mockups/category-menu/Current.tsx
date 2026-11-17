import { useState } from "react";
import { Beef, Drumstick, Egg, Fish, ShoppingBag } from "lucide-react";
import "./_group.css";

const categories = [
  { name: "All", icon: ShoppingBag },
  { name: "Fish", icon: Fish },
  { name: "Prawns", icon: Fish },
  { name: "Chicken", icon: Drumstick },
  { name: "Mutton", icon: Beef },
  { name: "Masalas", icon: Egg },
];

const products = [
  { name: "Rawa", detail: "500 g", price: "₹450" },
  { name: "Pomfret", detail: "Large • 500 g", price: "₹1,350" },
  { name: "Tiger Prawns", detail: "Medium • 500 g", price: "₹620" },
  { name: "Chicken Curry Cut", detail: "Fresh • 500 g", price: "₹210" },
  { name: "Mutton Keema", detail: "500 g", price: "₹480" },
  { name: "Malvani Masala", detail: "100 g", price: "₹90" },
];

export function Current() {
  const [selected, setSelected] = useState("All");
  return (
    <main className="category-menu-preview min-h-screen bg-[#f5eee5] p-3 sm:p-8 flex items-start sm:items-center justify-center">
      <section className="w-full max-w-[660px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="grid h-[min(620px,78vh)] grid-cols-[42%_58%] sm:grid-cols-[224px_1fr]">
          <nav className="overflow-y-auto border-r border-slate-100 bg-slate-50">
            {categories.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className={`flex w-full items-center gap-3 border-b border-slate-200/70 border-l-[3px] px-3 py-4 text-left transition ${
                  selected === name
                    ? "border-l-[#c8651b] bg-white text-[#7b3a14]"
                    : "border-l-transparent text-slate-700 hover:bg-white"
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4e5d6]">
                  <Icon className="h-5 w-5 text-[#9a4d1d]" />
                </span>
                <span className="text-sm font-semibold">{name}</span>
              </button>
            ))}
          </nav>
          <div className="overflow-y-auto p-4 sm:p-6">
            <button className="mb-3 flex w-full items-center justify-between text-left text-xs font-semibold text-[#c8651b]">
              <span>View all in {selected}</span><span aria-hidden>→</span>
            </button>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {products.map((product) => (
                <button key={product.name} className="rounded-lg border-b border-slate-100 px-2 py-4 text-left hover:bg-[#fffaf5]">
                  <span className="block text-sm font-semibold text-slate-700">{product.name}</span>
                  <span className="mt-1 flex justify-between gap-2 text-xs text-slate-500">
                    <span>{product.detail}</span><span className="font-semibold text-slate-700">{product.price}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
