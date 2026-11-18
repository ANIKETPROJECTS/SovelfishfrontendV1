import { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Category, Product } from "@shared/schema";
import { X } from "lucide-react";

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

function getProductOptionCount(product: Product) {
  return Math.max(product.weightVariants?.length ?? 0, 1);
}

function formatItemCount(count: number) {
  return `${count} item${count === 1 ? "" : "s"}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CategoryMenuDropdown({ open, onClose }: Props) {
  const [, navigate] = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const visibleCategories = categories.filter((c) => c.isActive);

  const storefrontProducts = allProducts.filter(
    (product) => !product.isArchived && !product.batchExpired && isNormalStorefrontProduct(product),
  );

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

  const handleCategoryClick = (catName: string) => {
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
              onClick={() => handleCategoryClick("All")}
              className="group flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#EAD3BB] bg-white px-2 py-2 text-center text-[#7B3A14] transition duration-200 hover:-translate-y-0.5 hover:border-[#C8651B] hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8651B] sm:min-h-[92px]"
              data-testid="menu-category-all"
            >
              <img
                src={bagIcon}
                alt=""
                className="h-8 w-8 object-contain"
              />
              <span className="text-xs font-semibold sm:text-sm">All</span>
              <span className="text-[10px] text-[#9D6B4A]">
                {formatItemCount(storefrontProducts.reduce((count, product) => count + getProductOptionCount(product), 0))}
              </span>
            </button>

            {visibleCategories.map((category) => {
              const image = category.imageUrl || getFallbackImage(category.name);
              const count = storefrontProducts
                .filter((product) => product.category === category.name)
                .reduce((total, product) => total + getProductOptionCount(product), 0);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category.name)}
                  className="group flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#EAD3BB] bg-white px-2 py-2 text-center text-[#7B3A14] transition duration-200 hover:-translate-y-0.5 hover:border-[#C8651B] hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8651B] sm:min-h-[92px]"
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
                  <span className="text-[10px] text-[#9D6B4A]">
                    {formatItemCount(count)}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
}

export { menuIcon };
