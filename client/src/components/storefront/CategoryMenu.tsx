import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Category, Product } from "@shared/schema";
import { formatStorePrice, getProductVariantKey } from "@/lib/productVariants";
import { ArrowRight, ChevronRight, X } from "lucide-react";

import fishImg from "@assets/Gemini_Generated_Image_w6wqkkw6wqkkw6wq_(1)_1772713077919.png";
import prawnsImg from "@assets/Gemini_Generated_Image_5xy0sd5xy0sd5xy0_1772713090650.png";
import chickenImg from "@assets/Gemini_Generated_Image_g0ecb4g0ecb4g0ec_1772713219972.png";
import muttonImg from "@assets/Gemini_Generated_Image_8fq0338fq0338fq0_1772713565349.png";
import masalaImg from "@assets/Gemini_Generated_Image_4e60a64e60a64e60_1772713888468.png";
import menuIcon from "@assets/menu_1774777071510.png";
import bagIcon from "@/assets/bag-icon.png";
import { isNormalStorefrontProduct } from "@shared/productVisibility";

function getFallbackImage(category: string) {
  switch (category) {
    case "Prawns":
    case "Crab":
    case "Lobster":
      return prawnsImg;
    case "Chicken":
    case "Eggs":
      return chickenImg;
    case "Mutton":
    case "Mutton Keema":
      return muttonImg;
    case "Masalas":
      return masalaImg;
    default:
      return fishImg;
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

type ProductMenuEntry = {
  key: string;
  product: Product;
  saleOption: string | null;
  variantLabel: string | null;
  variantPrice: number | null;
};

export function CategoryMenuDropdown({ open, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const visibleCategories = categories.filter((c) => c.isActive);

  const activeCategoryName = activeCategory ?? "All";

  const storefrontProducts = allProducts.filter(
    (product) => !product.isArchived && !product.batchExpired && isNormalStorefrontProduct(product),
  );
  const activeProducts = activeCategoryName === "All"
    ? storefrontProducts
    : storefrontProducts.filter((product) => product.category === activeCategoryName);

  const activeProductEntries: ProductMenuEntry[] = activeProducts.flatMap((product) => {
    const variants = product.weightVariants ?? [];
    if (variants.length === 0) {
      return [{
        key: `product-${product.id}`,
        product,
        saleOption: null,
        variantLabel: null,
        variantPrice: null,
      }];
    }

    return variants.map((variant) => ({
      key: `variant-${product.id}-${getProductVariantKey(variant)}`,
      product,
      saleOption: getProductVariantKey(variant),
      variantLabel: variant.averageWeightLabel
        ? `${variant.label} (avg. ${variant.averageWeightLabel})`
        : variant.label,
      variantPrice: variant.price,
    }));
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("keydown", keyHandler);
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleProductClick = (product: Product, saleOption?: string | null) => {
    onClose();
    const query = saleOption ? `?saleOption=${encodeURIComponent(saleOption)}` : "";
    navigate(`/product/${product.id}${query}`);
  };

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
  };

  const handleViewAll = (catName: string) => {
    onClose();
    navigate(`/category/${encodeURIComponent(catName)}`);
  };

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-full z-[100] px-2 pt-2 sm:px-6 sm:pt-3">
      <section
        ref={ref}
        id="category-menu-panel"
        role="dialog"
        aria-label="Browse product categories"
        className="pointer-events-auto mx-auto w-full max-w-[1120px] overflow-hidden rounded-2xl border border-[#F0A458] bg-[#7B3A14] shadow-[0_24px_70px_rgba(52,22,8,.42)]"
        style={{ maxHeight: "78vh" }}
      >
        <div className="flex items-start justify-between gap-3 px-4 py-4 text-white sm:px-6 sm:py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#F0A458]">Fresh Stock Xchange</p>
            <h2 className="mt-1 text-lg font-bold sm:text-2xl">Shop by category</h2>
            <p className="mt-1 text-xs font-medium text-white/80 sm:text-sm">
              Choose a category to find your fresh favourites.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close categories"
            title="Close categories"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0A458]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[calc(78vh-100px)] overflow-y-auto bg-[#F7EBDD] px-3 pb-4 pt-1 sm:px-6 sm:pb-6">
          <div
            role="group"
            aria-label="Product categories"
            className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          >
            <button
              type="button"
              aria-pressed={activeCategoryName === "All"}
              onClick={() => handleCategoryClick("All")}
              onMouseEnter={() => setActiveCategory("All")}
              className={`group flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center transition duration-200 sm:min-h-[92px] ${
                activeCategoryName === "All"
                  ? "border-[#C8651B] bg-[#C8651B] text-white shadow-md"
                  : "border-[#EAD3BB] bg-white text-[#7B3A14] hover:-translate-y-0.5 hover:border-[#C8651B] hover:shadow"
              }`}
              data-testid="menu-category-all"
            >
              <img
                src={bagIcon}
                alt=""
                className={`h-8 w-8 object-contain ${activeCategoryName === "All" ? "brightness-0 invert" : ""}`}
              />
              <span className="text-xs font-semibold sm:text-sm">All</span>
              <span className={`text-[10px] ${activeCategoryName === "All" ? "text-white/80" : "text-[#9D6B4A]"}`}>
                {storefrontProducts.length} items
              </span>
            </button>

            {visibleCategories.map((category) => {
              const isActive = category.name === activeCategoryName;
              const image = category.imageUrl || getFallbackImage(category.name);
              const count = storefrontProducts.filter((product) => product.category === category.name).length;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleCategoryClick(category.name)}
                  onMouseEnter={() => setActiveCategory(category.name)}
                  className={`group flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center transition duration-200 sm:min-h-[92px] ${
                    isActive
                      ? "border-[#C8651B] bg-[#C8651B] text-white shadow-md"
                      : "border-[#EAD3BB] bg-white text-[#7B3A14] hover:-translate-y-0.5 hover:border-[#C8651B] hover:shadow"
                  }`}
                  data-testid={`menu-category-${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white/90">
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="line-clamp-1 text-xs font-semibold sm:text-sm">{category.name}</span>
                  <span className={`text-[10px] ${isActive ? "text-white/80" : "text-[#9D6B4A]"}`}>
                    {count} items
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[#EAD3BB] bg-white p-3 sm:mt-5 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#B3784F]">Browse</p>
                <h3 className="truncate text-base font-bold text-[#7B3A14] sm:text-lg">
                  {activeCategoryName === "All" ? "Popular products" : activeCategoryName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleViewAll(activeCategoryName)}
                className="flex shrink-0 items-center gap-1 rounded-full bg-[#7B3A14] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5C2A0E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8651B] sm:px-4"
              >
                View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {activeProductEntries.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#D8B99C] bg-[#FFFAF4] px-4 py-6 text-center text-sm font-medium text-[#7B3A14]">
                No products available in this category yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {activeProductEntries.map((entry, index) => (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => handleProductClick(entry.product, entry.saleOption)}
                    aria-label={entry.variantLabel
                      ? `${entry.product.name}, ${entry.variantLabel}, ₹${formatStorePrice(entry.variantPrice)}`
                      : entry.product.name}
                    className="group flex min-h-[66px] items-center justify-between gap-3 rounded-lg border border-[#F0E3D5] bg-[#FFFAF4] px-3 py-3 text-left transition hover:border-[#C8651B] hover:bg-[#FFF3E5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C8651B]"
                    data-testid={`menu-product-${entry.product.id}${entry.variantLabel ? `-${index}` : ""}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#7B3A14]">
                        {entry.product.name}
                      </span>
                      {entry.variantLabel && (
                        <span className="mt-1 block truncate text-xs font-medium text-[#8D6953]">
                          {entry.variantLabel}
                        </span>
                      )}
                    </span>
                    {entry.variantPrice != null ? (
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="rounded-full bg-[#F3E0CA] px-2.5 py-1 text-xs font-bold text-[#7B3A14]">
                          ₹{formatStorePrice(entry.variantPrice)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#C8651B] transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#C8651B] transition group-hover:translate-x-0.5" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export { menuIcon };
