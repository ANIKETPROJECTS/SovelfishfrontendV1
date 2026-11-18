import { useLocation } from "wouter";
import { CalendarDays, Fish } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { isPreorderStorefrontProduct } from "@shared/productVisibility";
import { isStorefrontProductVisible } from "@/lib/storefrontProductVisibility";

export default function PreorderPage() {
  const [, setLocation] = useLocation();
  const { data: products = [], isLoading, isError } = useProducts();
  const preorderProducts = products.filter((product) =>
    !product.isArchived &&
    !product.batchExpired &&
    product.status !== "unavailable" &&
    isPreorderStorefrontProduct(product) &&
    isStorefrontProductVisible(product),
  );

  return (
    <div className="home-storefront-page min-h-screen flex flex-col font-sans">
      <Header onSearchSubmit={(query) => setLocation(query ? `/?q=${encodeURIComponent(query)}` : "/")} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-7 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#7B3A14] text-white shadow-sm">
            <Fish className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#7B3A14] sm:text-4xl">
            Preorder Fresh Catch
          </h1>
          <p className="mx-auto mt-2 flex max-w-2xl items-center justify-center gap-2 text-sm font-medium text-[#704526] sm:text-base">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
            Choose an eligible future delivery date for your selected items.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-[#d6ad8b] bg-white/90 p-6 text-center text-[#7B3A14]" role="alert">
            We couldn&apos;t load preorder products. Please refresh and try again.
          </div>
        ) : preorderProducts.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {preorderProducts.map((product) => (
              <ProductCard key={product.id} product={product} preorderContext brandText />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d6ad8b] bg-white/90 px-6 py-12 text-center text-[#7B3A14]">
            <Fish className="mx-auto mb-3 h-8 w-8" aria-hidden="true" />
            <h2 className="text-xl font-bold">No preorder items right now</h2>
            <p className="mt-2 text-sm font-medium text-[#704526]">
              Check back soon for fresh items available to reserve.
            </p>
          </div>
        )}
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
}
