import { Minus, Triangle } from "lucide-react";
import type { Product } from "@shared/schema";

type MarketMovement = {
  direction: "up" | "down" | "steady";
  changeAmount: number;
  changePercent: number;
  referencePrice: number;
  comparisonLabel: string;
};

type MarketRange = {
  low: number;
  high: number;
};

type MarketProduct = Product & {
  marketMovement?: MarketMovement | null;
  marketRange?: MarketRange | null;
};

type MarketRow = {
  product: MarketProduct;
  name: string;
  price: number;
  low: number | null;
  high: number | null;
  weight: string | null;
  direction: MarketMovement["direction"] | null;
};

type MarketBoardProps = {
  products: Product[];
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatPrice(value: number) {
  return currency.format(value);
}

const PREVIEW_MARKET_VALUES = [
  { name: "Surmai", price: 445, low: 410, high: 470, weight: "500 g", direction: "up" },
  { name: "Paplet", price: 620, low: 610, high: 675, weight: "1 kg", direction: "down" },
  { name: "Bangda", price: 385, low: 360, high: 405, weight: "500 g", direction: "up" },
  { name: "Rawas", price: 175, low: 165, high: 190, weight: "500 ml", direction: "down" },
  { name: "Bombil", price: 540, low: 520, high: 585, weight: "1 kg", direction: "up" },
  { name: "Kolambi", price: 295, low: 280, high: 320, weight: "500 g", direction: "down" },
  { name: "Halwa", price: 510, low: 490, high: 560, weight: "1 kg", direction: "up" },
  { name: "Mandeli", price: 335, low: 325, high: 360, weight: "500 g", direction: "down" },
] satisfies Array<{
  price: number;
  low: number;
  high: number;
  weight: string;
  direction: MarketMovement["direction"];
}>;

function MarketMovementCell({ direction }: Pick<MarketRow, "direction">) {
  if (!direction || direction === "steady") {
    return (
      <span className="text-sm text-[#6b7a78]" aria-label="No price movement">
        <Minus className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  const isUp = direction === "up";
  const tone = isUp ? "text-[#16834f]" : "text-[#d13e3e]";

  return (
    <Triangle
      className={`h-4 w-4 fill-current stroke-current ${tone} ${isUp ? "" : "rotate-180"}`}
      aria-label={isUp ? "Price trending up" : "Price trending down"}
      role="img"
    />
  );
}

export function MarketBoard({ products }: MarketBoardProps) {
  const marketProducts = (products as MarketProduct[]).filter((product) =>
    product.price != null &&
    !product.isArchived &&
    !product.batchExpired &&
    product.status !== "expired" &&
    product.status !== "unavailable" &&
    product.status !== "archived"
  ).slice(0, 8);
  const marketRows: MarketRow[] = marketProducts.map((product, index) => {
    const preview = import.meta.env.DEV ? PREVIEW_MARKET_VALUES[index] : undefined;
    return {
      product,
      name: preview?.name ?? product.name,
      price: preview?.price ?? product.price!,
      low: preview?.low ?? product.marketRange?.low ?? null,
      high: preview?.high ?? product.marketRange?.high ?? null,
      weight: preview?.weight ?? (product.netWeight?.trim() || product.grossWeight?.trim() || null),
      direction: preview?.direction ?? product.marketMovement?.direction ?? null,
    };
  });

  return (
    <section
      aria-labelledby="market-board-title"
      className="relative mb-4 overflow-hidden rounded-xl border border-[#e1e9e6] bg-white text-[#1B324D] shadow-[0_12px_30px_-22px_rgba(27,50,77,0.28)]"
    >
      <div className="relative px-3 py-2 sm:px-4 sm:py-3">
        <div className="mb-2 flex items-center border-b border-[#e4ebe8] pb-2">
          <h1 id="market-board-title" className="font-display text-sm font-semibold leading-tight tracking-tight">
            Fresh market prices
          </h1>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div
            className="min-w-[600px]"
            role="table"
            aria-label="Fresh market product prices and daily changes"
          >
            <div
              className="grid grid-cols-[minmax(180px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(130px,1.25fr)_minmax(100px,0.9fr)] gap-2 bg-[#edf3f1] px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1B324D]"
              role="row"
            >
              <span role="columnheader">Product</span>
              <span role="columnheader">Low</span>
              <span role="columnheader">High</span>
              <span role="columnheader">Price</span>
              <span role="columnheader">Trends</span>
            </div>

            {marketRows.length > 0 ? (
              <div>
                {marketRows.map((row) => {
                  return (
                    <div
                      key={row.product.id}
                      className="grid min-h-[42px] grid-cols-[minmax(180px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(130px,1.25fr)_minmax(100px,0.9fr)] items-center gap-2 border-b border-[#e8eeec] px-3 transition-colors odd:bg-white even:bg-[#f6f9f8] hover:bg-[#edf7f2] last:border-b-0"
                      role="row"
                    >
                      <span className="truncate text-sm font-semibold text-[#1B324D]" role="cell">
                        {row.name}
                      </span>

                      <span className="whitespace-nowrap text-sm tabular-nums text-[#435967]" role="cell">
                        {row.low != null ? formatPrice(row.low) : "—"}
                      </span>

                      <span className="whitespace-nowrap text-sm tabular-nums text-[#435967]" role="cell">
                        {row.high != null ? formatPrice(row.high) : "—"}
                      </span>

                      <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-[#1B324D]" role="cell">
                        {currency.format(row.price)}
                        {row.weight && (
                          <span className="ml-1 text-sm font-normal text-[#667774]">
                            · {row.weight}
                          </span>
                        )}
                      </span>

                      <div role="cell">
                        <MarketMovementCell direction={row.direction} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-t border-[#e4ebe8] px-3 py-4 text-center">
                <p className="text-sm font-medium text-[#52666b]">No current prices</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

export default MarketBoard;
