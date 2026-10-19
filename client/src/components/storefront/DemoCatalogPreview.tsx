import { useState } from "react";

const categories = [
  { name: "All categories", image: "/banners/banner2.png", value: "All" },
  { name: "Fish", image: "/categories/fish.png", value: "Fish" },
  { name: "Prawns", image: "/categories/prawns.png", value: "Prawns" },
  { name: "Chicken", image: "/categories/chicken.png", value: "Chicken" },
  { name: "Mutton", image: "/categories/mutton.png", value: "Mutton" },
  { name: "Masalas", image: "/categories/masalas.png", value: "Masalas" },
];

const products = [
  { name: "Fresh Pomfret", category: "Fish", detail: "Whole fish · 500 g", price: "₹549", image: "/categories/fish.png" },
  { name: "Coastal Prawns", category: "Prawns", detail: "Cleaned · 500 g", price: "₹399", image: "/categories/prawns.png" },
  { name: "Chicken Curry Cut", category: "Chicken", detail: "Bone-in · 500 g", price: "₹189", image: "/categories/chicken.png" },
  { name: "Goat Curry Cut", category: "Mutton", detail: "Bone-in · 500 g", price: "₹449", image: "/categories/mutton.png" },
  { name: "Coastal Fish Masala", category: "Masalas", detail: "House blend · 100 g", price: "₹99", image: "/categories/masalas.png" },
];

const sections = [
  { title: "Best Sellers", subtitle: "Popular picks from the demo catalogue", products: products.slice(0, 4) },
  { title: "Fresh From The Sea", subtitle: "Sample seafood favourites", products: products.slice(0, 2) },
  { title: "Meat For Every Meal", subtitle: "Demo cuts for everyday cooking", products: products.slice(2, 4) },
  { title: "Pantry Pairings", subtitle: "A sample masala to complete the meal", products: products.slice(4) },
];

function DemoProductCard({ product }: { product: (typeof products)[number] }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-[#1B324D] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Demo
        </span>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1B324D]/65">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-[#1B324D]">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{product.detail}</p>
        <p className="mt-2 font-bold text-[#1B324D]">{product.price}</p>
      </div>
    </article>
  );
}

export function DemoCatalogPreview() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const visibleSections = sections
    .map((section) => ({
      ...section,
      products: selectedCategory === "All"
        ? section.products
        : section.products.filter((product) => product.category === selectedCategory),
    }))
    .filter((section) => section.products.length > 0);

  return (
    <div className="space-y-7 sm:space-y-9" data-testid="demo-catalog-preview">
      <section className="relative isolate min-h-[190px] sm:min-h-[240px] overflow-hidden rounded-2xl bg-[#1B324D] shadow-lg">
        <img
          src="/banners/banner2.png"
          alt="Seafood and meat selection"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1B324D] via-[#1B324D]/90 to-[#1B324D]/35" />
        <div className="flex min-h-[190px] max-w-2xl flex-col justify-center p-6 sm:min-h-[240px] sm:p-10">
          <span className="mb-3 w-fit rounded-full bg-[#59C39E] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1B324D]">
            Replit preview catalogue
          </span>
          <h1 className="max-w-xl text-2xl font-bold leading-tight text-white sm:text-4xl">
            Fresh picks for every table
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/90 sm:text-base">
            Explore sample seafood, meat, and masala selections.
          </p>
        </div>
      </section>

      <section aria-labelledby="demo-categories-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="demo-categories-heading" className="text-xl font-semibold text-[#1B324D] sm:text-2xl">
            Shop by category
          </h2>
          <span className="text-xs font-medium text-slate-500">Sample content</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.value;
            return (
            <button
              key={category.value}
              type="button"
              onClick={() => setSelectedCategory(category.value)}
              aria-pressed={isSelected}
              aria-label={`Show ${category.name} demo products`}
              className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#1B324D] text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#59C39E] ${
                isSelected ? "ring-4 ring-[#59C39E]" : ""
              }`}
            >
              <img src={category.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#1B324D]/95 via-[#1B324D]/20 to-transparent" />
              <span className="absolute bottom-3 left-3 right-2 text-base font-bold text-white sm:bottom-4 sm:left-4 sm:text-lg">
                {category.name}
              </span>
            </button>
            );
          })}
        </div>
      </section>

      {visibleSections.map((section) => (
        <section key={section.title} aria-labelledby={`demo-${section.title.toLowerCase().replaceAll(" ", "-")}`}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2
                id={`demo-${section.title.toLowerCase().replaceAll(" ", "-")}`}
                className="text-xl font-semibold text-[#1B324D] sm:text-2xl"
              >
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{section.subtitle}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#59C39E]/20 px-3 py-1 text-xs font-semibold text-[#1B324D]">
              Demo
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {section.products.map((product) => (
              <DemoProductCard key={`${section.title}-${product.name}`} product={product} />
            ))}
          </div>
        </section>
      ))}
      <p className="rounded-xl bg-[#59C39E]/15 px-4 py-3 text-sm text-[#1B324D]">
        Preview only: products, prices, and stock are examples. No demo item can be purchased or added to your cart.
      </p>
    </div>
  );
}
