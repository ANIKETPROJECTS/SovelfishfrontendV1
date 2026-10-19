import { useState } from "react";
import type { Product } from "@shared/schema";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/context/CartContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const categories = [
  { name: "All categories", image: "/categories/all.png", value: "All" },
  { name: "Fish", image: "/categories/fish.png", value: "Fish" },
  { name: "Prawns", image: "/categories/prawns.png", value: "Prawns" },
  { name: "Chicken", image: "/categories/chicken.png", value: "Chicken" },
  { name: "Mutton", image: "/categories/mutton.png", value: "Mutton" },
  { name: "Masalas", image: "/categories/masalas.png", value: "Masalas" },
];

type PreviewProduct = Product & { isPreviewOnly: true };

function makePreviewProduct(
  id: number,
  name: string,
  category: string,
  price: number,
  imageUrl: string,
  grossWeight: string,
  netWeight: string,
): PreviewProduct {
  return {
    id: id as unknown as string,
    name,
    category,
    subCategory: null,
    status: "active",
    limitedStockNote: null,
    price,
    originalPrice: null,
    unit: "500 g",
    imageUrl,
    isArchived: false,
    updatedAt: new Date(0),
    sectionId: null,
    description: null,
    grossWeight,
    netWeight,
    pieces: null,
    serves: null,
    discountPct: 0,
    quantity: 999,
    availableQty: 999,
    batchExpired: false,
    couponIds: [],
    recipes: [],
    preorderMode: "normal",
    isPreviewOnly: true,
  };
}

const products = [
  makePreviewProduct(990001, "Fresh Pomfret", "Fish", 549, "/categories/fish.png", "500", "450"),
  makePreviewProduct(990002, "Coastal Prawns", "Prawns", 399, "/categories/prawns.png", "500", "450"),
  makePreviewProduct(990003, "Fresh Basa Fillets", "Fish", 329, "/categories/fish.png", "500", "450"),
  makePreviewProduct(990004, "Chicken Curry Cut", "Chicken", 189, "/categories/chicken.png", "500", "450"),
  makePreviewProduct(990005, "Goat Curry Cut", "Mutton", 449, "/categories/mutton.png", "500", "450"),
  makePreviewProduct(990006, "Coastal Fish Masala", "Masalas", 99, "/categories/masalas.png", "100", "100"),
  makePreviewProduct(990007, "Classic Tandoori Masala", "Masalas", 89, "/categories/masalas.png", "100", "100"),
];

const sections = [
  {
    id: "best-sellers",
    title: "Best Sellers",
    subtitle: "Fresh favourites for your table",
    products: [products[0], products[1], products[3], products[4]],
  },
  {
    id: "from-the-sea",
    title: "From the Sea",
    subtitle: "Seafood prepared for easy cooking",
    products: [products[0], products[1], products[2]],
  },
  {
    id: "meat-counter",
    title: "Meat Counter",
    subtitle: "Classic cuts for everyday meals",
    products: [products[3], products[4]],
  },
  {
    id: "kitchen-essentials",
    title: "Kitchen Essentials",
    subtitle: "Finishing touches for your favourite recipes",
    products: [products[5], products[6]],
  },
];

export function DemoCatalogPreview() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openProduct, setOpenProduct] = useState<PreviewProduct | null>(null);
  const { addToCart } = useCart();
  const visibleSections = sections
    .map((section) => ({
      ...section,
      products: selectedCategory === "All"
        ? section.products
        : section.products.filter((product) => product.category === selectedCategory),
    }))
    .filter((section) => section.products.length > 0);

  return (
    <div className="space-y-8 pb-8 sm:space-y-10" data-testid="preview-catalog">
      <section className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-[#1B324D] shadow-lg">
        <img
          src="/banners/fresh-stock-xchange.jpg"
          alt="Fresh Stock Xchange banner featuring premium fish, meat, and chicken"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </section>

      <section aria-labelledby="catalog-categories-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#248764]">Find your favourites</p>
            <h2 id="catalog-categories-heading" className="mt-1 text-xl font-semibold text-[#1B324D] sm:text-2xl">
              Shop by category
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                aria-pressed={isSelected}
                aria-label={`Show ${category.name} products`}
                className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#59C39E] ${
                  isSelected ? "ring-4 ring-[#59C39E]" : ""
                }`}
              >
                <span className="block aspect-square overflow-hidden bg-slate-50">
                  <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="flex min-h-11 items-center justify-center px-2 py-2 text-center text-sm font-bold text-[#1B324D] sm:text-base">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {visibleSections.map((section, index) => (
        <section
          key={section.id}
          aria-labelledby={section.id}
          className={`rounded-3xl border p-4 sm:p-6 ${
            index % 2 === 1
              ? "border-[#59C39E]/25 bg-[#59C39E]/[0.07]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 id={section.id} className="text-xl font-semibold text-[#1B324D] sm:text-2xl">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{section.subtitle}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#1B324D]">
              {section.products.length} picks
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {section.products.map((product) => (
              <div key={`${section.id}-${product.id}`} className="h-full rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm sm:p-3">
                <ProductCard
                  product={product}
                  disableNavigation
                  onProductClick={() => setOpenProduct(product)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <Dialog open={Boolean(openProduct)} onOpenChange={(open) => !open && setOpenProduct(null)}>
        <DialogContent className="max-w-md overflow-hidden rounded-3xl p-0">
          {openProduct && (
            <>
              <img
                src={openProduct.imageUrl ?? ""}
                alt={openProduct.name}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5 sm:p-6">
                <DialogHeader className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#248764]">
                    {openProduct.category}
                  </p>
                  <DialogTitle className="text-2xl font-semibold text-[#1B324D]">
                    {openProduct.name}
                  </DialogTitle>
                  <DialogDescription>
                    {openProduct.grossWeight} g gross · {openProduct.netWeight} g net
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="text-2xl font-bold text-[#1B324D]">₹{openProduct.price}</span>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(openProduct, 1, true);
                      setOpenProduct(null);
                    }}
                    className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
