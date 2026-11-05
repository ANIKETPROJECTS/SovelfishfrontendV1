import { Plus, Minus, Info, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";
import {
  asVariantCartProduct,
  formatProductWeight,
  formatStorePrice,
  getProductVariantKey,
} from "@/lib/productVariants";
import noImageImg from "@/assets/coming-soon.png";

type ProductCardProps = {
  product: Product;
  preorderContext?: boolean;
  disableNavigation?: boolean;
  onProductClick?: () => void;
  detailVariantKey?: string;
};

const DUMMY_DETAILS: Record<string, { pieces: string; serves: string }> = {
  Fish:    { pieces: "2-3 Pieces", serves: "Serves 3" },
  Prawns:  { pieces: "20-25 Pieces", serves: "Serves 3" },
  Chicken: { pieces: "2-4 Pieces", serves: "Serves 4" },
  Mutton:  { pieces: "6-8 Pieces", serves: "Serves 4" },
  Masalas: { pieces: "1 Pack", serves: "Serves 6" },
};

export function ProductCard(props: ProductCardProps) {
  const variants = props.product.weightVariants ?? [];
  if (variants.length === 0) return <SingleProductCard {...props} />;

  return (
    <>
      {variants.map((variant, index) => (
        <SingleProductCard
          key={variant.batchId ?? `${variant.weightKg}-${variant.minWeightKg ?? ""}-${variant.maxWeightKg ?? ""}-${index}`}
          {...props}
          product={asVariantCartProduct(props.product, variant)}
          detailVariantKey={getProductVariantKey(variant)}
        />
      ))}
    </>
  );
}

function SingleProductCard({
  product,
  preorderContext = false,
  disableNavigation = false,
  onProductClick,
  detailVariantKey,
}: ProductCardProps) {
  const { addToCart, removeFromCart, updateQuantity, items, computeMaxQty } = useCart();
  const [, setLocation] = useLocation();
  const cartProduct = product;
  const originalProductId = (product as Product & { originalId?: string }).originalId ?? product.id;
  const isSaleVariantCard = Boolean((product as Product & { originalId?: string }).originalId);
  const isUnavailable = product.status === "unavailable";

  const cartItem = items.find(i => String(i.id) === String(cartProduct.id));
  const qty = cartItem?.quantity ?? 0;

  const getFallbackImage = (_category: string) => noImageImg;

  const dummyFallback = DUMMY_DETAILS[product.category] ?? DUMMY_DETAILS["Fish"];
  const piecesText = product.pieces || null;
  const servesText = product.serves || null;
  const displayPrice = product.price;
  const hasDiscount = product.originalPrice != null && product.price != null && product.originalPrice > product.price;
  const discountPct = hasDiscount ? Math.round((product.originalPrice! - product.price!) / product.originalPrice! * 100) : null;
  const strikePrice = hasDiscount ? product.originalPrice : null;

  const maxQty = computeMaxQty(
    (cartItem ?? { ...cartProduct, quantity: 0 }) as any,
  );
  const getProductDetailPath = () => {
    const query = new URLSearchParams();
    if (preorderContext) query.set("preorder", "1");
    if (detailVariantKey) query.set("saleOption", detailVariantKey);
    const search = query.toString();
    return `/product/${originalProductId}${search ? `?${search}` : ""}`;
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ ...cartProduct, isPreorderCheckout: preorderContext } as any);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ ...cartProduct, isPreorderCheckout: preorderContext } as any);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qty <= 1) {
      removeFromCart(cartProduct.id);
    } else {
      updateQuantity(cartProduct.id, qty - 1);
    }
  };

  return (
    <div
      className={`group relative bg-card flex flex-col h-full transition-all duration-300 ${
        onProductClick || !disableNavigation ? "cursor-pointer" : ""
      }`}
      onClick={onProductClick ?? (disableNavigation ? undefined : () => setLocation(getProductDetailPath()))}
    >
      <div className="relative aspect-square w-full bg-muted/30 overflow-hidden mb-3 border border-border/20 rounded-xl">
        <img
          src={product.imageUrl || getFallbackImage(product.category)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isUnavailable ? "grayscale opacity-60" : "group-hover:scale-110"
          }`}
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.status === "limited" && (
            <Badge variant="outline" className="bg-amber-500/90 backdrop-blur text-white border-none shadow-sm py-0.5 text-[10px] h-5">
              Limited
            </Badge>
          )}
          {product.status === "unavailable" && (
            <Badge variant="outline" className="bg-red-500/90 backdrop-blur text-white border-none shadow-sm py-0.5 text-[10px] h-5">
              Sold Out
            </Badge>
          )}
        </div>

        {product.status === "limited" && product.limitedStockNote && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/60 backdrop-blur rounded px-2 py-1 text-[10px] font-medium text-white shadow-sm flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{product.limitedStockNote}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-1">
        <h3 className="font-sans font-medium text-base sm:text-lg text-foreground leading-snug mb-1.5 line-clamp-2">
          {product.name}
        </h3>

        {isSaleVariantCard && product.unit && (
          <p className="mb-2 text-sm leading-snug text-muted-foreground">
            {product.unit}
          </p>
        )}

        {!isSaleVariantCard && (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground mb-2.5 font-normal">
            {product.grossWeight && (
              <>
                <span className="font-medium text-foreground/80 whitespace-nowrap">{formatProductWeight(product.grossWeight, "gross")}</span>
                <span className="text-muted-foreground/50">|</span>
              </>
            )}
            {product.netWeight && (
              <>
                <span className="font-medium text-foreground/80 whitespace-nowrap">{formatProductWeight(product.netWeight, "net")}</span>
                {piecesText && <span className="text-muted-foreground/50">|</span>}
              </>
            )}
            {piecesText && (
              <span className="font-medium text-foreground/80 whitespace-nowrap">{piecesText}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg sm:text-xl font-semibold text-foreground">₹{formatStorePrice(displayPrice)}</span>
            {!isSaleVariantCard && <span className="text-xs text-muted-foreground">{product.unit}</span>}
            {strikePrice && <span className="text-sm text-muted-foreground line-through">₹{strikePrice}</span>}
            {discountPct && <span className="text-sm font-semibold text-green-600">{discountPct}% off</span>}
          </div>

          {isUnavailable ? (
            <Button
              disabled
              className="rounded-full w-9 h-9 p-0 text-white shadow-md flex items-center justify-center shrink-0 bg-muted"
              size="icon"
            >
              <span className="text-[10px]">Out</span>
            </Button>
          ) : qty === 0 ? (
            <Button
              onClick={handleAdd}
              disabled={maxQty <= 0}
              aria-label="Add to cart"
              data-testid={`button-add-product-${cartProduct.id}`}
              className="rounded-full w-9 h-9 p-0 text-white shadow-md flex items-center justify-center shrink-0 bg-primary hover:bg-[#F05B4E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              size="icon"
            >
              <ShoppingBasket aria-hidden className="w-5 h-5 text-white" />
            </Button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-0 rounded-full bg-primary shadow-md overflow-hidden shrink-0"
              data-testid={`stepper-product-${cartProduct.id}`}
            >
              <button
                onClick={handleDecrease}
                data-testid={`button-decrease-product-${cartProduct.id}`}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-white font-semibold text-xs min-w-[24px] text-center select-none">
                {qty}
              </span>
              <button
                onClick={handleIncrease}
                disabled={qty >= maxQty}
                data-testid={`button-increase-product-${cartProduct.id}`}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
