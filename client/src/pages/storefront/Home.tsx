import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/storefront/Header";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { Footer } from "@/components/storefront/Footer";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useLocation } from "wouter";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Category, Section, Combo } from "@shared/schema";
import noImageImg from "@assets/Gemini_Generated_Image_z60vyrz60vyrz60v_1782896627484.png";
import { SeoHead } from "@/components/SeoHead";
import { isNormalStorefrontProduct, isPreorderStorefrontProduct } from "@shared/productVisibility";
import { isStorefrontProductVisible } from "@/lib/storefrontProductVisibility";
import { DemoCatalogPreview } from "@/components/storefront/DemoCatalogPreview";
import { MarketBoard } from "@/components/storefront/MarketBoard";

function getFallbackImage(_category: string): string {
  return noImageImg;
}

function ComboImages({ images, imageUrl }: { images: string[]; imageUrl?: string | null }) {
  if (imageUrl?.trim()) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <img src={imageUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
      </div>
    );
  }
  const n = images.length;
  const slotPct = 100 / n;
  const widthPct = n === 1 ? 100 : slotPct + slotPct * 0.45;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0"
          style={{
            left: `${i * slotPct}%`,
            width: `${widthPct}%`,
            zIndex: i,
          }}
        >
          <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          {i < n - 1 && (
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-black/10" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { data: products, isLoading, isSuccess: productsLoaded } = useProducts();
  const { data: categories = [], isSuccess: categoriesLoaded } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: sections = [], isSuccess: sectionsLoaded } = useQuery<Section[]>({ queryKey: ["/api/sections"] });
  const { data: combos = [], isSuccess: combosLoaded } = useQuery<Combo[]>({ queryKey: ["/api/combos"] });
  const { addToCart, removeFromCart, updateQuantity, items: cartItems, computeMaxQty } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [view, setView] = useState<"home" | "category">("home");
  const initialQ = (() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  })();
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [, navigate] = useLocation();
  const demoPreview =
    import.meta.env.DEV &&
    productsLoaded && products?.length === 0 &&
    categoriesLoaded && categories.length === 0 &&
    sectionsLoaded && sections.length === 0 &&
    combosLoaded && combos.length === 0;

  useEffect(() => {
    if (initialQ) setView("category");
  }, [initialQ]);


  const handleCategoryClick = (catName: string) => {
    navigate(`/category/${encodeURIComponent(catName)}`);
  };

  const filteredProducts = products?.filter((p) => {
    if (p.isArchived || p.batchExpired || !isNormalStorefrontProduct(p) || !isStorefrontProductVisible(p)) return false;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === "All") return matchesSearch;
    return p.category === activeCategory && matchesSearch;
  }) || [];

  const productMap = Object.fromEntries((products ?? []).map(p => [p.id, p]));

  const filteredCombos = searchQuery
    ? combos.filter(combo =>
        combo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (combo.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      ).filter(combo =>
        combo.includes.every(inc => {
          const p = productMap[inc.productId];
          return !p || (!p.batchExpired && p.status !== "unavailable");
        })
      )
    : [];

  const getSectionProducts = (sectionId: string, unlimited = false) => {
    const filtered = products?.filter(p => {
      if (p.isArchived || p.batchExpired || !isNormalStorefrontProduct(p) || !isStorefrontProductVisible(p)) return false;
      if (Array.isArray(p.sectionId)) return p.sectionId.includes(sectionId);
      return p.sectionId === sectionId;
    }) || [];
    return unlimited ? filtered : filtered.slice(0, 10);
  };

  const preorderProducts = (products ?? []).filter(
    (p) => !p.isArchived && !p.batchExpired && isPreorderStorefrontProduct(p) && isStorefrontProductVisible(p),
  );

  const renderPreorderSection = (key: string, title: string) => {
    if (preorderProducts.length === 0) return null;
    return (
      <section key={key} className="mb-7" data-testid="section-preorder">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-medium text-foreground uppercase tracking-wide">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Reserve these items for a future delivery date
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {preorderProducts.map((product) => (
            <div key={product.id} className="min-w-0">
              <ProductCard product={product} preorderContext />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const handleLogoClick = () => {
    setView("home");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogoClickHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (view === "category") {
    const hasResults = filteredProducts.length > 0 || filteredCombos.length > 0;
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header onSearch={(q) => { setSearchQuery(q); if (!q) setView("home"); }} onLogoClick={handleLogoClick} initialSearchValue={searchQuery} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setView("home")} className="rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h2 className="text-2xl sm:text-3xl font-medium text-foreground">{activeCategory} Selection</h2>
            </div>
          </div>

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div className="mb-8">
              {filteredCombos.length > 0 && (
                <h3 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wide">Products</h3>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {isLoading
                  ? [1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />)
                  : filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
                }
              </div>
            </div>
          )}

          {/* Combos */}
          {filteredCombos.length > 0 && (
            <div className="mb-8">
              {filteredProducts.length > 0 && (
                <h3 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wide">Combo Deals</h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCombos.map(combo => {
                  const comboImages = combo.includes
                    .map(inc => {
                      const product = productMap[inc.productId];
                      return product?.imageUrl || (product ? getFallbackImage(product.category) : null);
                    })
                    .filter(Boolean) as string[];
                  const computedPct = combo.originalPrice > 0
                    ? Math.round(((combo.originalPrice - combo.discountedPrice) / combo.originalPrice) * 100)
                    : 0;
                  const showPct = combo.discount && combo.discount > 0 ? combo.discount : computedPct;
                  const comboCartId = -Math.abs(parseInt(combo.id.slice(-6), 16) || 9999);
                  const comboCartItem = cartItems.find(i => i.id === comboCartId);
                  const comboQty = comboCartItem?.quantity ?? 0;
                  const buildComboPayload = () => {
                    const comboCategories = combo.includes.slice(0, 3).map(inc => productMap[inc.productId]?.category ?? "Fish");
                    const qtysWithLimits = combo.includes.map(inc => productMap[inc.productId]?.availableQty).filter((q): q is number => q != null);
                    const comboAvailableQty = qtysWithLimits.length > 0 ? Math.min(...qtysWithLimits) : null;
                    return { id: comboCartId, originalId: combo.id, name: combo.name, price: combo.discountedPrice, category: "Combo", status: "available", unit: combo.weight, imageUrl: combo.imageUrl ?? null, isArchived: false, updatedAt: new Date(), limitedStockNote: null, sectionId: null, isCombo: true, comboImages, comboCategories, availableQty: comboAvailableQty, comboIncludes: combo.includes.map(inc => ({ productId: inc.productId, quantity: inc.quantity ?? 1, availableQty: productMap[inc.productId]?.availableQty ?? null })) } as any;
                  };
                  const comboMaxQty = computeMaxQty(comboCartItem ?? buildComboPayload());
                  return (
                    <div key={combo.id} className="group relative bg-card flex flex-col transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden border border-border/20">
                      <Link href={`/combo/${combo.id}`}>
                        <div className="relative aspect-[10/7] w-full bg-muted/30 overflow-hidden">
                                  <ComboImages images={comboImages} imageUrl={combo.imageUrl} />
                          <div className="absolute top-0 left-0 z-10">
                            <div className="relative bg-accent text-white pl-3 pr-5 py-2 shadow-md rounded-tl-xl">
                              <div className="text-[11px] font-bold leading-tight uppercase tracking-wide">Combo</div>
                              <div className="text-[11px] font-bold leading-tight uppercase tracking-wide">Saver</div>
                              <div className="absolute top-0 right-0 h-full w-3" style={{ background: "hsl(var(--accent))", clipPath: "polygon(0 0, 100% 50%, 0 100%)", transform: "translateX(100%)" }} />
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="flex-1 flex flex-col p-3">
                        <Link href={`/combo/${combo.id}`}>
                          <h3 className="font-medium text-base text-foreground leading-snug mb-1 line-clamp-2 hover:text-primary transition-colors">{combo.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{combo.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-semibold text-foreground">₹{combo.discountedPrice}</span>
                            {combo.originalPrice > combo.discountedPrice && <span className="text-sm text-muted-foreground line-through">₹{combo.originalPrice}</span>}
                            {showPct > 0 && <span className="text-sm font-semibold text-green-600">{showPct}% off</span>}
                          </div>
                          {comboQty === 0 ? (
                           <Button onClick={(e) => { e.stopPropagation(); addToCart(buildComboPayload()); }} disabled={comboMaxQty <= 0} className="rounded-full w-9 h-9 p-0 text-white shadow-md flex items-center justify-center shrink-0 bg-primary hover:bg-[#F05B4E] transition-colors disabled:opacity-40" size="icon">
                              <Plus className="w-5 h-5 text-white" />
                            </Button>
                          ) : (
                            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-0 rounded-full bg-primary shadow-md overflow-hidden shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); if (comboQty <= 1) { removeFromCart(comboCartId); } else { updateQuantity(comboCartId, comboQty - 1); } }} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><Minus className="w-3 h-3" /></button>
                              <span className="text-white font-semibold text-xs min-w-[16px] text-center select-none">{comboQty}</span>
                              <button onClick={(e) => { e.stopPropagation(); addToCart(buildComboPayload()); }} disabled={comboQty >= comboMaxQty} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-40"><Plus className="w-3 h-3" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="py-20 text-center text-muted-foreground">No products or combos found matching your search.</div>
          )}
          {isLoading && filteredProducts.length === 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />)}
            </div>
          )}
        </main>
        <CartDrawer />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SeoHead
        title="Fresh Fish, Seafood, Chicken & Mutton Online in Mumbai"
        description="Order 100% fresh fish, seafood, chicken & mutton online in Mumbai. Hygienically cut, cleaned & delivered to your doorstep. 60+ varieties. Free delivery above ₹500. Order now on Fresh Stock Xchange."
        canonical="/"
      />
      <Header onSearch={demoPreview ? undefined : (q) => {
        setSearchQuery(q);
        if (q) setView("category");
      }} onLogoClick={handleLogoClickHome} initialSearchValue={searchQuery} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        {demoPreview ? (
          <DemoCatalogPreview />
        ) : (
          <>
        <MarketBoard products={products ?? []} />

        {/* Keep the homepage category grid focused while catalog content is being finalized. */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-[#edf1ef] bg-white p-2 text-center transition-shadow hover:shadow-md sm:p-3"
                data-testid={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#f7faf8]">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🐟
                    </div>
                  )}
                </div>
                <span className="w-full break-words text-xs font-medium text-foreground sm:text-sm">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preserve the existing preorder placement for hubs that have not
            configured a ranked preorder section yet. */}
        {!sections.some((section) => section.type === "preorder") &&
          renderPreorderSection("preorder-default", "Preorder")}

        {/* Dynamic Sections from DB — products, combos, and preorder */}
        {sections.map((section) => {
          if (section.type === "preorder") {
            return renderPreorderSection(section.id, section.title);
          }

          if (section.type === "combos") {
            // Filter combos: hide if any included product is unavailable due to expired batches
            const availableCombos = combos.filter(combo =>
              combo.includes.every(inc => {
                const p = productMap[inc.productId];
                return !p || (!p.batchExpired && p.status !== "unavailable");
              })
            );
            return (
              <section key={section.id} className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl sm:text-2xl font-medium text-foreground uppercase tracking-wide">
                    {section.title}
                  </h2>
                </div>
                {availableCombos.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No combos available yet.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                      {availableCombos.map(combo => {
                        const comboImages = combo.includes
                          .map(inc => {
                            const product = productMap[inc.productId];
                            return product?.imageUrl || (product ? getFallbackImage(product.category) : null);
                          })
                          .filter(Boolean) as string[];
                        const computedPct = combo.originalPrice > 0
                          ? Math.round(((combo.originalPrice - combo.discountedPrice) / combo.originalPrice) * 100)
                          : 0;
                        const showPct = combo.discount && combo.discount > 0 ? combo.discount : computedPct;
                        return (
                          <div key={combo.id} className="min-w-0">
                            <div className="group relative bg-card flex flex-col h-full transition-all duration-300 cursor-pointer">
                              <Link href={`/combo/${combo.id}`}>
                                <div className="relative aspect-[10/7] w-full bg-muted/30 overflow-hidden mb-3 border border-border/20 rounded-xl">
                          <ComboImages images={comboImages} imageUrl={combo.imageUrl} />
                                  <div className="absolute top-0 left-0 z-10">
                                    <div className="relative bg-accent text-white pl-3 pr-5 py-2 shadow-md rounded-tl-xl">
                                      <div className="text-[11px] sm:text-xs font-bold leading-tight uppercase tracking-wide">Combo</div>
                                      <div className="text-[11px] sm:text-xs font-bold leading-tight uppercase tracking-wide">Saver</div>
                                      <div
                                        className="absolute top-0 right-0 h-full w-3"
                                        style={{ background: "hsl(var(--accent))", clipPath: "polygon(0 0, 100% 50%, 0 100%)", transform: "translateX(100%)" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Link>
                              <div className="flex-1 flex flex-col px-1">
                                <Link href={`/combo/${combo.id}`}>
                                  <h3 className="font-sans font-medium text-base sm:text-lg text-foreground leading-snug mb-1.5 line-clamp-2 hover:text-primary transition-colors">
                                    {combo.name}
                                  </h3>
                                </Link>
                                <p className="text-sm text-muted-foreground mb-2.5 font-normal line-clamp-2">{combo.description}</p>
                                <div className="flex items-center justify-between mt-auto pt-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-lg sm:text-xl font-semibold text-foreground">₹{combo.discountedPrice}</span>
                                    {combo.originalPrice > combo.discountedPrice && (
                                      <span className="text-sm text-muted-foreground line-through">₹{combo.originalPrice}</span>
                                    )}
                                    {showPct > 0 && (
                                      <span className="text-sm font-semibold text-green-600" data-testid={`text-combo-discount-${combo.id}`}>{showPct}% off</span>
                                    )}
                                  </div>
                                  {(() => {
                                    const comboCartId = -Math.abs(parseInt(combo.id.slice(-6), 16) || 9999);
                                    const comboCartItem = cartItems.find(i => i.id === comboCartId);
                                    const comboQty = comboCartItem?.quantity ?? 0;
                                    const buildComboPayload = () => {
                                      const comboCategories = combo.includes
                                        .slice(0, 3)
                                        .map(inc => productMap[inc.productId]?.category ?? "Fish");
                                      const qtysWithLimits = combo.includes
                                        .map(inc => productMap[inc.productId]?.availableQty)
                                        .filter((q): q is number => q != null);
                                      const comboAvailableQty = qtysWithLimits.length > 0
                                        ? Math.min(...qtysWithLimits) : null;
                                      return {
                                        id: comboCartId,
                                        originalId: combo.id,
                                        name: combo.name, price: combo.discountedPrice,
                                        category: "Combo", status: "available",
                                        unit: combo.weight, imageUrl: combo.imageUrl ?? null,
                                        isArchived: false, updatedAt: new Date(),
                                        limitedStockNote: null, sectionId: null, isCombo: true,
                                        comboImages,
                                        comboCategories,
                                        availableQty: comboAvailableQty,
                                        comboIncludes: combo.includes.map(inc => ({
                                          productId: inc.productId,
                                          quantity: inc.quantity ?? 1,
                                          availableQty: productMap[inc.productId]?.availableQty ?? null,
                                        })),
                                      } as any;
                                    };
                                    const comboMaxQty = computeMaxQty(comboCartItem ?? buildComboPayload());

                                    if (comboQty === 0) {
                                      return (
                                        <Button
                                          onClick={(e) => { e.stopPropagation(); addToCart(buildComboPayload()); }}
                                          disabled={comboMaxQty <= 0}
                                          className="rounded-full w-9 h-9 p-0 text-white shadow-md flex items-center justify-center shrink-0 bg-primary hover:bg-[#F05B4E] transition-colors disabled:opacity-40"
                                          size="icon"
                                          data-testid={`button-add-combo-${combo.id}`}
                                        >
                                          <Plus className="w-5 h-5 text-white" />
                                        </Button>
                                      );
                                    }
                                    return (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-0 rounded-full bg-primary shadow-md overflow-hidden shrink-0"
                                        data-testid={`stepper-combo-${combo.id}`}
                                      >
                                        <button
                                          onClick={(e) => { e.stopPropagation(); if (comboQty <= 1) { removeFromCart(comboCartId); } else { updateQuantity(comboCartId, comboQty - 1); } }}
                                          className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-white font-semibold text-xs min-w-[16px] text-center select-none">
                                          {comboQty}
                                        </span>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); addToCart(buildComboPayload()); }}
                                          disabled={comboQty >= comboMaxQty}
                                          className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-40"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>
            );
          }

          // "products" type section
          const normalizedTitle = section.title.trim().toLowerCase().replace(/[^a-z]/g, "");
          const isAllProducts = normalizedTitle === "allproducts";
          const sectionProducts = getSectionProducts(section.id, isAllProducts);
          return (
            <section key={section.id} className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl sm:text-2xl font-medium text-foreground uppercase tracking-wide">
                  {section.title}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {isLoading
                  ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />)
                  : sectionProducts.length > 0
                    ? sectionProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))
                    : (
                        <p className="col-span-2 py-4 text-sm text-muted-foreground">No products in this section yet.</p>
                      )
                }
              </div>
            </section>
          );
        })}
          </>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
