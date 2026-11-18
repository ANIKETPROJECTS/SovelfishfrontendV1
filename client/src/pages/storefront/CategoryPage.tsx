import { useEffect } from "react";
import { useRoute, useLocation, useSearch } from "wouter";
import { SeoHead, CATEGORY_SEO } from "@/components/SeoHead";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "@/hooks/use-products";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { ProductCard } from "@/components/storefront/ProductCard";
import { DragScrollDiv } from "@/components/storefront/DragScrollDiv";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import type { Category } from "@shared/schema";
import {
  isNormalStorefrontProduct,
  isPreorderStorefrontProduct,
} from "@shared/productVisibility";
import { isStorefrontProductVisible } from "@/lib/storefrontProductVisibility";

import fishImg from "@assets/Gemini_Generated_Image_w6wqkkw6wqkkw6wq_(1)_1772713077919.png";
import prawnsImg from "@assets/Gemini_Generated_Image_5xy0sd5xy0sd5xy0_1772713090650.png";
import chickenImg from "@assets/Gemini_Generated_Image_g0ecb4g0ecb4g0ec_1772713219972.png";
import muttonImg from "@assets/Gemini_Generated_Image_8fq0338fq0338fq0_1772713565349.png";
import masalaImg from "@assets/Gemini_Generated_Image_4e60a64e60a64e60_1772713888468.png";

function getFallbackImage(category: string) {
  switch (category) {
    case "Prawns": return prawnsImg;
    case "Chicken": return chickenImg;
    case "Mutton": return muttonImg;
    case "Masalas": return masalaImg;
    default: return fishImg;
  }
}

export default function CategoryPage() {
  const [, params] = useRoute("/category/:categoryName");
  const search = useSearch();
  const [, navigate] = useLocation();
  const { data: products, isLoading } = useProducts();
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const categoryName = params?.categoryName
    ? decodeURIComponent(params.categoryName)
    : "";

  const isAll = categoryName === "All";

  const searchParams = new URLSearchParams(search);
  const subFilter = searchParams.get("sub");
  const activeSub = subFilter ? decodeURIComponent(subFilter) : "All";

  const categoryProducts = isAll
    ? (products?.filter((p) => !p.isArchived && !p.batchExpired && isNormalStorefrontProduct(p) && isStorefrontProductVisible(p)) || [])
    : (products?.filter((p) => !p.isArchived && !p.batchExpired && isNormalStorefrontProduct(p) && isStorefrontProductVisible(p) && p.category === categoryName) || []);

  // Keep preorder inventory out of the normal category product grid, but
  // surface it first in its own section for the selected category.
  const preorderProducts = isAll
    ? (products?.filter((p) => !p.isArchived && !p.batchExpired && isPreorderStorefrontProduct(p) && isStorefrontProductVisible(p)) || [])
    : (products?.filter((p) => !p.isArchived && !p.batchExpired && isPreorderStorefrontProduct(p) && isStorefrontProductVisible(p) && p.category === categoryName) || []);

  const currentCategory = categories.find((c) => c.name === categoryName);
  const subCategories = currentCategory?.subCategories ?? [];

  // Build the sub-categories that have at least one product (so we don't show empty ones)
  const subsWithProducts = subCategories.filter((sc) =>
    categoryProducts.some(
      (p) => p.subCategory?.toLowerCase() === sc.name.toLowerCase()
    )
  );

  const displayProducts =
    activeSub !== "All" && !isAll
      ? categoryProducts.filter(
          (p) => p.subCategory?.toLowerCase() === activeSub.toLowerCase()
        )
      : categoryProducts;
  const displayItemCount = displayProducts.reduce(
    (count, product) => count + Math.max(product.weightVariants?.length ?? 0, 1),
    0,
  );

  // Clear stale ?sub= when its product no longer exists
  useEffect(() => {
    if (isAll || !subFilter || isLoading) return;
    if (subsWithProducts.length === 0) return;
    const exists = subsWithProducts.some(
      (sc) => sc.name.toLowerCase() === activeSub.toLowerCase()
    );
    if (!exists) {
      navigate(`/category/${encodeURIComponent(categoryName)}`, { replace: true });
    }
  }, [activeSub, subFilter, subsWithProducts, isAll, isLoading, categoryName, navigate]);

  const heroImage = getFallbackImage(categoryName);

  const handleSubClick = (subName: string) => {
    if (subName === "All") {
      navigate(`/category/${encodeURIComponent(categoryName)}`);
    } else {
      navigate(
        `/category/${encodeURIComponent(categoryName)}?sub=${encodeURIComponent(subName)}`
      );
    }
  };

  const catSeo = CATEGORY_SEO[categoryName] ?? null;

  return (
    <div className="home-storefront-page min-h-screen flex flex-col font-sans">
      <SeoHead
        title={catSeo ? catSeo.title : `${categoryName} Online in Mumbai | Fresh & Hygienically Cut`}
        description={catSeo ? catSeo.description : `Buy fresh ${categoryName.toLowerCase()} online in Mumbai. Hygienically cleaned, cut & delivered same-day. Order now on Fresh Stock Xchange.`}
        canonical={`/category/${encodeURIComponent(categoryName)}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fishtokri.com/" },
            { "@type": "ListItem", "position": 2, "name": categoryName, "item": `https://fishtokri.com/category/${encodeURIComponent(categoryName)}` },
          ],
        }}
      />
      <Header onSearch={() => {}} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0 rounded-full border border-[#7B3A14]/15 bg-white text-[#7B3A14] shadow-sm hover:bg-[#fff5e9] hover:text-[#542813]"
            data-testid="button-back-category"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight text-[#7B3A14] sm:text-3xl">
              {isAll ? "All Products" : categoryName}
            </h1>
            {!isLoading && (
              <p className="text-sm font-semibold text-[#7B3A14]/80" data-testid="text-category-count">
                {displayItemCount} item{displayItemCount !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
        </div>

        {preorderProducts.length > 0 && (
          <section className="mb-7" data-testid="section-category-preorder">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-[#7B3A14] sm:text-2xl">
                  Preorder
                </h2>
                <p className="mt-1 text-xs font-medium text-[#7B3A14]/75 sm:text-sm">
                  Reserve these items for a future delivery date
                </p>
              </div>
            </div>
            <DragScrollDiv className="flex overflow-x-auto gap-4 sm:gap-6 scrollbar-hide">
              {preorderProducts.map((product) => (
                <div key={product.id} className="w-[240px] sm:w-[280px] flex-none">
                  <ProductCard product={product} preorderContext brandText />
                </div>
              ))}
            </DragScrollDiv>
          </section>
        )}

        {/* Sub-category scrollable strip */}
        {!isAll && subsWithProducts.length > 0 && (
          <div className="mb-6 -mx-4 sm:mx-0">
            <div
              className="flex overflow-x-auto gap-6 sm:gap-7 scrollbar-hide snap-x px-4 sm:px-2 py-2"
              data-testid="strip-subcategories"
            >
              {/* "All" pill */}
              <button
                onClick={() => handleSubClick("All")}
                className="flex-none flex flex-col items-center gap-2 snap-start group min-w-[88px]"
                data-testid="subcategory-all"
              >
                <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#fff8ee] flex items-center justify-center transition-all duration-200 ${
                    activeSub === "All"
                      ? "ring-[3px] ring-[#C8651B] ring-offset-2 ring-offset-[#f5dfc4]"
                      : "ring-1 ring-[#7B3A14]/20 group-hover:ring-[#C8651B]"
                  }`}
                >
                  <img
                    src={heroImage}
                    alt="All"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                    className={`text-sm sm:text-base whitespace-nowrap transition-colors ${
                    activeSub === "All"
                      ? "font-bold text-[#7B3A14]"
                      : "font-semibold text-[#7B3A14]/80 group-hover:text-[#542813]"
                  }`}
                >
                  All
                </span>
              </button>

              {subsWithProducts.map((sc) => {
                const isActive = activeSub.toLowerCase() === sc.name.toLowerCase();
                const img = sc.imageUrl || heroImage;
                return (
                  <button
                    key={sc.name}
                    onClick={() => handleSubClick(sc.name)}
                    className="flex-none flex flex-col items-center gap-2 snap-start group min-w-[100px]"
                    data-testid={`subcategory-${sc.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#fff8ee] flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? "ring-[3px] ring-[#C8651B] ring-offset-2 ring-offset-[#f5dfc4]"
                          : "ring-1 ring-[#7B3A14]/20 group-hover:ring-[#C8651B]"
                      }`}
                    >
                      <img
                        src={img}
                        alt={sc.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`text-sm sm:text-base whitespace-nowrap text-center transition-colors max-w-[120px] truncate ${
                        isActive
                          ? "font-bold text-[#7B3A14]"
                          : "font-semibold text-[#7B3A14]/80 group-hover:text-[#542813]"
                      }`}
                    >
                      {sc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-white/35" />
              ))
            : displayProducts.length > 0
            ? displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} brandText />
              ))
            : (
                <div className="col-span-full rounded-2xl border border-[#7B3A14]/15 bg-white/85 px-6 py-16 text-center font-semibold text-[#7B3A14]">
                  No products found in this category.
                </div>
              )}
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
