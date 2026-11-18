import { useRoute, useLocation, useSearch } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { useProductCoupons } from "@/hooks/use-coupons";
import { useCart } from "@/context/CartContext";
import { useCityArea } from "@/context/CityAreaContext";
import { useCustomer } from "@/context/CustomerContext";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CuttingMethodSelector } from "@/components/storefront/CuttingMethodSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft, Plus, Minus, Copy, Check, ChefHat, ShoppingBasket,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { isNormalStorefrontProduct } from "@shared/productVisibility";
import { isStorefrontProductVisible } from "@/lib/storefrontProductVisibility";
import { isValidCuttingMethodSelection } from "@shared/cuttingMethods";
import {
  asVariantCartProduct,
  formatProductMetadataValue,
  formatProductWeight,
  getLegacyProductVariantKey,
  formatStorePrice,
  getProductVariantKey,
} from "@/lib/productVariants";
import { getCartLineId } from "@shared/cuttingMethods";

import weighScaleIcon from "@assets/weight-scale_1774801344716.png";
import piecesIcon from "@assets/cutlery_1774801395283.png";
import servesIcon from "@assets/hot-food_1774801420499.png";
import iconTimeImg from "@assets/time_1776949603776.png";
import giftCardIconImg from "@/assets/gift-card.png";
import tagIconImg from "@/assets/tag.png";
import noImageImg from "@/assets/coming-soon.png";
import { SeoHead } from "@/components/SeoHead";

function getFallbackImage(_category: string) {
  return noImageImg;
}

const EMPTY_CUTTING_METHODS: string[] = [];

function CouponCard({ code, description }: { code: string; description: string; color?: string; onApply?: () => void; isApplied?: boolean }) {
  return (
    <div className="flex items-center px-4 py-3 bg-white transition-colors hover:bg-[#fffaf4]">
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span
          aria-hidden
          className="w-6 h-6 shrink-0 inline-block mt-0.5"
          style={{
            backgroundColor: "#C8651B",
            WebkitMaskImage: `url(${tagIconImg})`,
            maskImage: `url(${tagIconImg})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
        <div className="min-w-0 flex-1">
          <span
            className="font-mono inline-block rounded-full px-3 py-1 text-sm font-bold tracking-wider text-white"
            style={{ backgroundColor: "#8B3A0F", color: "#FFFFFF" }}
          >
            {code}
          </span>
          <p className="mt-1 whitespace-normal break-words text-sm leading-snug text-[#80634e]">{description}</p>
        </div>
      </div>
    </div>
  );
}

function RecipeCard({
  recipe, category, index, onViewRecipe,
}: {
  recipe: { name: string; description: string; image: string; totalTime: string; difficulty: string };
  category: string;
  index: number;
  onViewRecipe: (category: string, index: number) => void;
}) {
  return (
    <div
      className="min-w-[260px] snap-start overflow-hidden rounded-2xl border border-[#9e5424] bg-[#7B3A14] shadow-[0_6px_20px_rgba(82,39,15,.14)] transition-all hover:-translate-y-1 hover:shadow-xl sm:min-w-[280px] flex flex-col cursor-pointer"
      onClick={() => onViewRecipe(category, index)}
    >
      <div className="relative w-full h-44 overflow-hidden bg-[#542813]">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {recipe.difficulty && (
          <span className="absolute top-2 right-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#7B3A14] shadow-sm">
            {recipe.difficulty}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-[#7B3A14] p-4">
        <h4 className="line-clamp-2 text-lg font-bold leading-snug text-white">{recipe.name}</h4>
        <p className="line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-white/75">{recipe.description}</p>
        <div className="mt-1 flex items-center gap-3 text-sm text-white/80">
          <span className="inline-flex items-center gap-1">
            <span
              aria-hidden
              className="w-3.5 h-3.5 inline-block shrink-0"
              style={{
                backgroundColor: "#F0A458",
                WebkitMaskImage: `url(${iconTimeImg})`,
                maskImage: `url(${iconTimeImg})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
            {recipe.totalTime}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onViewRecipe(category, index); }}
          className="mt-1 w-full rounded-full border border-white bg-white px-3 py-2.5 text-base font-bold text-[#7B3A14] transition-colors hover:bg-[#fff1df]"
        >
          View Recipe
        </button>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: products, isLoading } = useProducts();
  const search = useSearch();
  const { addToCart, updateQuantity, appliedCoupon, setAppliedCoupon, items: cartItems, computeMaxQty } = useCart();
  const { selectedCityArea } = useCityArea();
  const { customer, openLoginModal } = useCustomer();
  const [qty, setQty] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedCuttingMethods, setSelectedCuttingMethods] = useState<string[]>([]);
  const recipeScrollRef = useRef<HTMLDivElement>(null);

  const productId = params?.id;
  const requestedSaleOption = new URLSearchParams(search).get("saleOption");
  const showOptions = new URLSearchParams(search).get("showOptions") === "1";
  const variantOptionsRef = useRef<HTMLDivElement>(null);
  const product = products?.find((p) => p.id === productId && !p.batchExpired && isStorefrontProductVisible(p));
  const variants = product?.weightVariants ?? [];
  const selectedVariant = variants[selectedVariantIndex] ?? variants[0];
  const cartProduct = product && selectedVariant
    ? asVariantCartProduct(product, selectedVariant)
    : product;
  const availableCuttingMethods = product?.cuttingMethods ?? EMPTY_CUTTING_METHODS;
  const optionScopedProduct = selectedVariant?.saleType === "whole_fish" ||
    selectedVariant?.saleType === "bulk_portion" ||
    product?.fishInventoryMode === "whole_fish" ||
    product?.fishInventoryMode === "bulk_portions" ||
    product?.wholeFishInventory === true;
  const displayPieces = formatProductMetadataValue(
    optionScopedProduct ? selectedVariant?.pieces : cartProduct?.pieces,
    "Pieces",
  );
  const displayServes = formatProductMetadataValue(
    optionScopedProduct ? selectedVariant?.serves : cartProduct?.serves,
    "Serves",
  );
  const cuttingMethodSelected = isValidCuttingMethodSelection(
    selectedCuttingMethods,
    availableCuttingMethods,
  );
  const isUnavailable = product?.status === "unavailable";

  // Auto-redirect to home when the product disappears from the list (went out of stock
  // after ordering or due to a background stock poll). Show a toast so the user knows why.
  useEffect(() => {
    if (!isLoading && products !== undefined && !product && productId) {
      toast({
        title: "This item is no longer available",
        description: "You've been redirected to the home screen.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isLoading, products, product, productId, setLocation, toast]);

  // Inventory cap — same logic as home screen and ComboDetail
  const cartLineId = cartProduct
    ? getCartLineId(cartProduct.id, selectedCuttingMethods, {
        pieces: cartProduct.pieces,
        serves: cartProduct.serves,
      })
    : null;
  const cartItem = cartItems.find(i => String(i.id) === cartLineId);
  const currentCartQty = cartItem?.quantity ?? 0;
  const stockCandidate = cartItem ?? (cartProduct ? { ...cartProduct, quantity: 0 } as any : null);
  const totalMax = stockCandidate ? computeMaxQty(stockCandidate) : 0;
  const [offersExpanded, setOffersExpanded] = useState(false);

  // Reset local qty when navigating to a different product
  useEffect(() => {
    setQty(1);
    setSelectedVariantIndex(0);
    setSelectedCuttingMethods([]);
  }, [productId]);

  useEffect(() => {
    setSelectedCuttingMethods((current) =>
      current.filter((method) => availableCuttingMethods.includes(method)),
    );
  }, [availableCuttingMethods, selectedVariantIndex]);

  useEffect(() => {
    if (!requestedSaleOption || variants.length === 0) return;
    const index = variants.findIndex((variant) =>
      getProductVariantKey(variant) === requestedSaleOption ||
      getLegacyProductVariantKey(variant) === requestedSaleOption,
    );
    if (index >= 0) setSelectedVariantIndex(index);
  }, [productId, requestedSaleOption, variants]);

  useEffect(() => {
    if (!showOptions || isLoading || variants.length === 0) return;
    const timer = window.setTimeout(() => {
      variantOptionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [productId, showOptions, isLoading, variants.length]);

  useEffect(() => {
    if (!cartItem) {
      setQty((current) => Math.min(current, Math.max(1, totalMax)));
    }
  }, [cartItem, totalMax]);

  const { coupons: rawProductCoupons } = useProductCoupons(productId, product?.couponIds ?? []);
  const { data: userCouponUsage = {} } = useQuery<Record<string, { usedCount: number; limit: number; isExhausted: boolean; message: string }>>({
    queryKey: ["/api/coupons/user-usage"],
    enabled: !!customer,
    staleTime: 0,
  });
  const liveCoupons = rawProductCoupons.filter(c => c.visibleOnWebsite !== false && !(!!customer && userCouponUsage[c.code]?.isExhausted));

  const areaCharge = selectedCityArea?.charge ?? 0;
  const displayPrice = (selectedVariant?.price ?? product?.price ?? 0) + areaCharge;
  const hasDiscount = !selectedVariant && product?.originalPrice != null && product?.price != null && product.originalPrice > product.price;
  const effectiveDiscountPct = hasDiscount
    ? Math.round((product!.originalPrice! - product!.price!) / product!.originalPrice! * 100)
    : 0;
  const strikePrice = hasDiscount ? product!.originalPrice! + areaCharge : null;

  const availableProducts = products?.filter((p) => !p.isArchived && p.id !== productId && isNormalStorefrontProduct(p) && isStorefrontProductVisible(p)) ?? [];
  const sameCategory = availableProducts.filter((p) => p.category === product?.category);
  const otherCategory = availableProducts.filter((p) => p.category !== product?.category);
  const recommended = [...sameCategory, ...otherCategory].slice(0, 10);
  const recommendedCards = recommended.flatMap((recommendedProduct) => {
    const weightVariants = recommendedProduct.weightVariants ?? [];
    if (weightVariants.length === 0) {
      return [{
        key: recommendedProduct.id,
        product: recommendedProduct,
        detailVariantKey: undefined,
      }];
    }

    return weightVariants.map((variant, index) => {
      const detailVariantKey = getProductVariantKey(variant);
      const variantProduct = asVariantCartProduct(recommendedProduct, variant);
      return {
        key: `${recommendedProduct.id}-${detailVariantKey}-${index}`,
        product: { ...variantProduct, weightVariants: [] },
        detailVariantKey,
      };
    });
  });

  if (isLoading) {
    return (
      <div className="min-h-screen home-storefront-page">
        <Header
          onSearchSubmit={(q) => setLocation(q ? `/?q=${encodeURIComponent(q)}` : "/")}
          collapsibleMobileSearch
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        <CartDrawer />
      </div>
    );
  }

  if (!product) {
    // The useEffect above will redirect to home. Render a blank screen in the
    // interim so there's no jarring "Product not found." flash behind the cart drawer.
    return <div className="min-h-screen home-storefront-page" />;
  }

  const catKeyword = product.category?.toLowerCase() ?? "seafood";
  const normalizedProductName = product.name.trim().toLowerCase();
  const showCategoryLabel = Boolean(
    product.category?.trim() && product.category.trim().toLowerCase() !== normalizedProductName,
  );
  const showSubCategoryLabel = Boolean(
    product.subCategory?.trim() && product.subCategory.trim().toLowerCase() !== normalizedProductName,
  );
  return (
    <div className="min-h-screen home-storefront-page font-sans">
      <SeoHead
        title={`Buy ${product.name} Online in Mumbai | Fresh & Hygienically Cut`}
        description={`Order ${product.name} online in Mumbai. 100% fresh ${catKeyword}, hygienically cleaned & cut, delivered same-day to your doorstep. Free delivery above ₹500. Order now on Fresh Stock Xchange.`}
        canonical={`/product/${productId}`}
        ogImage={product.imageUrl ?? undefined}
        ogType="product"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fishtokri.com/" },
              { "@type": "ListItem", "position": 2, "name": product.category, "item": `https://fishtokri.com/category/${encodeURIComponent(product.category)}` },
              { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://fishtokri.com/product/${productId}` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.imageUrl ?? "https://fishtokri.com/og-default.png",
            "description": `Fresh ${product.name}, hygienically cleaned and cut, delivered same-day across Mumbai.`,
            "category": product.category,
              "brand": { "@type": "Brand", "name": "Fresh Stock Xchange" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR",
              "price": String(product.price ?? 0),
              "availability": product.status === "unavailable" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              "url": `https://fishtokri.com/product/${productId}`,
            },
          },
        ]}
      />
      <Header
        onSearchSubmit={(q) => setLocation(q ? `/?q=${encodeURIComponent(q)}` : "/")}
        collapsibleMobileSearch
      />

      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* Back */}
        <button
          onClick={() => setLocation("/")}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[#e6c7a9] bg-white/95 px-4 py-2 text-sm font-semibold text-[#7B3A14] shadow-sm transition-colors hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4" /> Back to store
        </button>

        {/* ── Main Grid: Image | Details ── */}
        <div className="mb-12 grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-8 2xl:gap-10">

          {/* LEFT – Image */}
          <div className="relative lg:sticky lg:top-24">
            <div className="aspect-square overflow-hidden rounded-3xl border border-[#9e5424] bg-white p-2 shadow-[0_10px_30px_rgba(82,39,15,.18)] sm:p-3">
              <img
                src={product.imageUrl || getFallbackImage(product.category)}
                alt={product.name}
                className="h-full w-full rounded-[1.25rem] object-cover"
              />
            </div>
            {product.status === "limited" && (
              <Badge className="absolute left-5 top-5 rounded-full border border-white bg-white px-3 py-1 font-bold text-[#7B3A14] shadow-md">Limited Stock</Badge>
            )}
            {product.status === "unavailable" && (
              <Badge className="absolute left-5 top-5 rounded-full border border-white bg-white px-3 py-1 font-bold text-[#7B3A14] shadow-md">Sold Out</Badge>
            )}
          </div>

          {/* RIGHT – Details */}
          <div className="flex min-w-0 flex-col gap-4 rounded-3xl border border-[#9e5424] bg-[#7B3A14] p-4 text-white shadow-[0_10px_30px_rgba(82,39,15,.18)] sm:gap-5 sm:p-6 lg:p-7">

            {/* Name + category / subcategory */}
            <div>
              {(showCategoryLabel || showSubCategoryLabel) && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {showCategoryLabel && (
                    <span
                      className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wide text-[#7B3A14]"
                      data-testid={`badge-category-${product.category}`}
                    >
                      {product.category}
                    </span>
                  )}
                  {showSubCategoryLabel && (
                    <span className="inline-block rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                      {product.subCategory}
                    </span>
                  )}
                </div>
              )}
              <h1 className="break-words font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">{product.name}</h1>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-base font-medium leading-relaxed text-white/85 sm:text-lg">{product.description}</p>
            )}

            {/* Pieces / Serves / Weight — wraps gracefully when text is long */}
            {(displayPieces || displayServes || product.grossWeight || product.netWeight) && (
            <div className="grid grid-cols-1 gap-2 rounded-2xl border border-white/15 bg-white/5 p-3 text-white sm:grid-cols-2">
              {/* Pieces */}
              {displayPieces && <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <span
                  aria-hidden
                  className="inline-block h-6 w-6 shrink-0 bg-white sm:h-7 sm:w-7"
                  style={{
                    WebkitMaskImage: `url(${piecesIcon})`,
                    maskImage: `url(${piecesIcon})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
                <span className="text-base font-semibold leading-tight sm:text-lg">
                  Pieces: {displayPieces}
                </span>
              </div>}

              {/* Serves */}
              {displayServes && <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <span
                  aria-hidden
                  className="inline-block h-6 w-6 shrink-0 bg-white sm:h-7 sm:w-7"
                  style={{
                    WebkitMaskImage: `url(${servesIcon})`,
                    maskImage: `url(${servesIcon})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
                <span className="text-base font-semibold leading-tight sm:text-lg">
                  Serves: {displayServes}
                </span>
              </div>}

              {/* Weight */}
              {(product.grossWeight || product.netWeight) && (
                <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <span
                    aria-hidden
                    className="inline-block h-6 w-6 shrink-0 bg-white sm:h-7 sm:w-7"
                    style={{
                      WebkitMaskImage: `url(${weighScaleIcon})`,
                      maskImage: `url(${weighScaleIcon})`,
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                  />
                  <div className="flex min-w-0 flex-row flex-wrap items-baseline gap-x-1 leading-tight text-base font-semibold sm:text-lg">
                    {product.grossWeight && (
                      <span className="whitespace-nowrap">
                        {formatProductWeight(product.grossWeight, "gross")}
                      </span>
                    )}
                    {product.grossWeight && product.netWeight && (
                      <span className="font-normal opacity-50">/</span>
                    )}
                    {product.netWeight && (
                      <span className="whitespace-nowrap">
                        {formatProductWeight(product.netWeight, "net")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}

            {variants.length > 0 && (
              <div ref={variantOptionsRef} id="product-variants" className="scroll-mt-24">
                <p className="mb-4 text-lg font-bold text-white sm:text-xl">Choose an option</p>
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                  {variants.map((variant, index) => (
                    <button
                      key={variant.batchId ?? `${variant.weightKg}-${variant.minWeightKg ?? ""}-${variant.maxWeightKg ?? ""}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIndex(index);
                        setQty(1);
                      }}
                      aria-pressed={index === selectedVariantIndex}
                      className="flex min-h-12 w-full min-w-0 items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-bold leading-snug transition-colors hover:-translate-y-0.5 sm:text-base"
                      style={index === selectedVariantIndex
                        ? { borderColor: "#FFFFFF", backgroundColor: "#FFFFFF", color: "#7B3A14" }
                        : { borderColor: "rgba(255,255,255,.45)", backgroundColor: "rgba(255,255,255,.08)", color: "#FFFFFF" }}
                    >
                        <span>
                          {variant.label}
                          {variant.averageWeightLabel ? ` (avg ${variant.averageWeightLabel})` : ""}
                          {" · ₹"}{formatStorePrice(variant.price + areaCharge)}
                        </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <CuttingMethodSelector
              methods={availableCuttingMethods}
              selectedMethods={selectedCuttingMethods}
              onChange={setSelectedCuttingMethods}
              variant="product"
            />

            {/* Price */}
            <div className="rounded-2xl border border-white/25 bg-white px-5 py-4 shadow-sm">
              <div className="mb-1 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-4xl font-extrabold leading-none text-[#7B3A14] sm:text-5xl">₹{formatStorePrice(displayPrice)}</span>
                {strikePrice && <span className="mb-0.5 text-lg font-medium text-[#80634e] line-through">₹{strikePrice}</span>}
                {effectiveDiscountPct > 0 && <span className="mb-0.5 rounded-full bg-[#fff1df] px-3 py-1.5 text-sm font-bold text-[#a84d12]">{effectiveDiscountPct}% off</span>}
              </div>
              <p className="text-sm font-semibold text-[#80634e] sm:text-base">
                {selectedVariant?.label ?? product.unit ?? "Inclusive of all taxes."}
                {(selectedVariant || product.unit) ? " · Inclusive of all taxes." : ""}
              </p>
            </div>

            {/* Qty + Add to Cart */}
            {(() => {
              const isInCart = currentCartQty > 0;
              // When in cart, the displayed qty IS the cart qty (real-time synced).
              // When not in cart, use local qty state.
              const displayQty = isInCart ? currentCartQty : qty;

              return (
                <div className="flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center sm:gap-4">
                  <div className="flex w-full max-w-[148px] shrink-0 items-center justify-between overflow-hidden rounded-full border border-white/60 bg-white text-[#7B3A14] shadow-sm">
                    <button
                      onClick={() => {
                        if (isInCart) {
                          updateQuantity(cartItem!.id, currentCartQty - 1);
                        } else {
                          setQty(q => Math.max(1, q - 1));
                        }
                      }}
                      aria-label="Decrease quantity"
                      className="flex h-11 w-10 items-center justify-center transition-colors hover:bg-[#fff1df]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-9 text-center text-base font-bold">{displayQty}</span>
                    <button
                      onClick={() => {
                        if (isInCart) {
                          updateQuantity(cartItem!.id, currentCartQty + 1);
                        } else {
                          setQty(q => Math.min(q + 1, totalMax));
                        }
                      }}
                      disabled={displayQty >= totalMax}
                      aria-label="Increase quantity"
                      className="flex h-11 w-10 items-center justify-center transition-colors hover:bg-[#fff1df] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    onClick={() => {
                      if (!customer) { openLoginModal(); return; }
                      if (!cuttingMethodSelected) {
                        toast({
                          title: "Choose a cutting method",
                          description: "Select one option before adding this product to your cart.",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (!isInCart) {
                         addToCart(
                            {
                              ...cartProduct!,
                             selectedCuttingMethods,
                             isPreorderCheckout:
                               new URLSearchParams(search).get("preorder") === "1" ||
                               product.preorderMode === "preorder_only",
                           } as any,
                           qty,
                           true,
                         );
                      }
                    }}
                    disabled={isUnavailable || totalMax <= 0 || (!isInCart && !cuttingMethodSelected)}
                    className="h-auto min-h-12 w-full min-w-0 flex-1 whitespace-normal rounded-full bg-white px-4 py-2.5 text-center text-base font-bold leading-tight text-[#7B3A14] shadow-md transition hover:bg-[#fff1df] sm:text-lg"
                  >
                    {isUnavailable
                      ? "Out of Stock"
                      : isInCart
                       ? `In Cart — ₹${formatStorePrice(displayPrice * currentCartQty)}`
                       : `Add ${qty} to Cart — ₹${formatStorePrice(displayPrice * qty)}`}
                  </Button>
                </div>
              );
            })()}

            {/* Available Offers — collapsible (matches Order Summary styling) */}
            {liveCoupons.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[#e6c7a9] bg-white shadow-sm">
                <div
                  className="flex w-full items-center gap-2.5 bg-[#fff5e9] px-4 py-3.5"
                  data-testid="header-offers"
                >
                  <span
                    aria-hidden
                    className="w-5 h-5 shrink-0 inline-block"
                    style={{
                      backgroundColor: "#C8651B",
                      WebkitMaskImage: `url(${giftCardIconImg})`,
                      maskImage: `url(${giftCardIconImg})`,
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-base font-bold text-[#542813]">
                      Offers Available
                    </span>
                  </div>
                </div>

                <div className="flex flex-col divide-y divide-[#f0dfcf] border-t border-[#f0dfcf]">
                  {(showAllCoupons ? liveCoupons : liveCoupons.slice(0, 3)).map((c) => (
                    <CouponCard
                      key={c.id}
                      code={c.code}
                      description={c.description}
                      color={c.color}
                      isApplied={appliedCoupon?.code === c.code}
                      onApply={() => setAppliedCoupon(appliedCoupon?.code === c.code ? null : c)}
                    />
                  ))}
                  {liveCoupons.length > 3 && (
                    <button
                      onClick={() => setShowAllCoupons(v => !v)}
                      className="w-full py-3 text-sm font-bold text-center text-[#a84d12] transition-colors hover:bg-[#fffaf4]"
                    >
                      {showAllCoupons ? "View Less" : `View ${liveCoupons.length - 3} More Offer${liveCoupons.length - 3 > 1 ? "s" : ""}`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Explore New Recipes — only shown when the admin has added recipes to this product ── */}
        {product.recipes && product.recipes.length > 0 && (
          <section className="mb-12">
            <div className="mb-5 flex justify-center">
              <div className="inline-flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#7B3A14] text-white shadow-sm">
                  <ChefHat className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl font-bold text-[#542813] sm:text-3xl">Explore New Recipes</h2>
              </div>
            </div>
            <div className="relative">
              <div ref={recipeScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {product.recipes.map((r, idx) => (
                  <div
                    key={idx}
                    className="min-w-[260px] snap-start overflow-hidden rounded-2xl border border-[#9e5424] bg-[#7B3A14] shadow-[0_6px_20px_rgba(82,39,15,.14)] transition-all hover:-translate-y-1 hover:shadow-xl sm:min-w-[280px] flex flex-col cursor-pointer"
                    onClick={() => setLocation(`/recipe/product/${product.id}/${idx}`)}
                  >
                    <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-[#542813]">
                      {r.image ? (
                        <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/40">
                          <ChefHat className="w-10 h-10" />
                        </div>
                      )}
                      {r.difficulty && (
                        <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#7B3A14] shadow-sm">
                          {r.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 bg-[#7B3A14] p-4">
                      <h4 className="line-clamp-2 text-lg font-bold leading-snug text-white">{r.title}</h4>
                      <p className="line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-white/75">{r.description}</p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-white/80">
                        {r.totalTime && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              aria-hidden
                              className="w-3.5 h-3.5 inline-block shrink-0"
                              style={{
                                backgroundColor: "#F0A458",
                                WebkitMaskImage: `url(${iconTimeImg})`,
                                maskImage: `url(${iconTimeImg})`,
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                WebkitMaskPosition: "center",
                                maskPosition: "center",
                              }}
                            />
                            {r.totalTime}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setLocation(`/recipe/product/${product.id}/${idx}`); }}
                        className="mt-1 w-full rounded-full border border-white bg-white px-3 py-2.5 text-base font-bold text-[#7B3A14] transition-colors hover:bg-[#fff1df]"
                      >
                        View Recipe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Similar Products ── */}
        {recommended.length > 0 && (
          <section className="mb-12">
            <div className="mb-5 flex justify-center">
              <h2 className="font-display text-center text-2xl font-bold text-[#542813] sm:text-3xl">Fresh Picks for You</h2>
            </div>
            <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {recommendedCards.map((card) => (
                <div key={card.key} className="min-w-0">
                  <ProductCard
                    product={card.product}
                    detailVariantKey={card.detailVariantKey}
                    brandText
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <CartDrawer />
      <Footer />
    </div>
  );
}
