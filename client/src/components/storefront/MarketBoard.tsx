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
  maximumFractionDigits: 0,
});

function formatPrice(value: number) {
  return currency.format(value);
}

function formatWeight(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" && Number.isFinite(value)) return `${value} g`;
  return null;
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
  const tone = isUp ? "text-[#16A34A]" : "text-[#DC2626]";

  return (
    <Triangle
      className={`h-5 w-5 fill-current stroke-current ${tone} ${isUp ? "" : "rotate-180"}`}
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
      weight: preview?.weight ?? formatWeight(product.netWeight) ?? formatWeight(product.grossWeight),
      direction: preview?.direction ?? product.marketMovement?.direction ?? null,
    };
  });

  return (
    <section
      aria-labelledby="market-board-title"
      className="relative mb-4 overflow-hidden bg-transparent text-[#1B324D] sm:rounded-xl sm:border sm:border-[#e1e9e6] sm:bg-white sm:shadow-[0_12px_30px_-22px_rgba(27,50,77,0.28)]"
    >
      <div className="relative px-0 py-1 sm:px-4 sm:py-3">
        <div className="mb-1 flex items-center border-b border-[#e4ebe8] pb-1 sm:mb-2 sm:pb-2">
          <h1 id="market-board-title" className="font-display text-[10px] font-semibold leading-tight tracking-tight sm:text-sm">
            Fresh market prices
          </h1>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div
            className="min-w-full sm:min-w-[680px]"
            role="table"
            aria-label="Fresh market product prices and daily changes"
          >
            <div
              className="grid grid-cols-[minmax(48px,1.3fr)_minmax(38px,0.8fr)_minmax(38px,0.8fr)_minmax(42px,1fr)_minmax(31px,0.8fr)_minmax(30px,0.6fr)] gap-0.5 bg-white px-1 py-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#1B324D] sm:hidden"
              role="row"
            >
              <span role="columnheader">Product</span>
              <span className="text-center" role="columnheader">Low</span>
              <span className="text-center" role="columnheader">High</span>
              <span className="text-center" role="columnheader">Price</span>
              <span className="text-center" role="columnheader">Weight</span>
              <span className="text-center" role="columnheader">Trend</span>
            </div>

            <div
              className="hidden grid-cols-[minmax(180px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(110px,1.1fr)_minmax(90px,0.9fr)_minmax(70px,0.7fr)] gap-2 bg-white px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1B324D] sm:grid"
              role="row"
            >
              <span role="columnheader">Product</span>
              <span className="text-center" role="columnheader">Low</span>
              <span className="text-center" role="columnheader">High</span>
              <span className="text-center" role="columnheader">Price</span>
              <span className="text-center" role="columnheader">Weight</span>
              <span className="text-center" role="columnheader">Trends</span>
            </div>

            {marketRows.length > 0 ? (
              <div>
                {marketRows.map((row) => {
                  return (
                    <div key={row.product.id} className="contents">
                      <div
                        className="grid min-h-[38px] grid-cols-[minmax(48px,1.3fr)_minmax(38px,0.8fr)_minmax(38px,0.8fr)_minmax(42px,1fr)_minmax(31px,0.8fr)_minmax(30px,0.6fr)] items-center gap-0.5 border-b border-[#e8eeec] bg-white px-1 last:border-b-0 sm:hidden"
                        role="row"
                      >
                        <span className="truncate text-[10px] font-semibold text-[#1B324D]" role="cell">
                          {row.name}
                        </span>
                        <span className="whitespace-nowrap text-center text-[10px] tabular-nums text-[#435967]" role="cell">
                          {row.low != null ? formatPrice(row.low) : "—"}
                        </span>
                        <span className="whitespace-nowrap text-center text-[10px] tabular-nums text-[#435967]" role="cell">
                          {row.high != null ? formatPrice(row.high) : "—"}
                        </span>
                        <span className="whitespace-nowrap text-center text-[10px] font-semibold tabular-nums text-[#1B324D]" role="cell">
                          {currency.format(row.price)}
                        </span>
                        <span className="whitespace-nowrap text-center text-[10px] text-[#667774]" role="cell">
                          {row.weight ?? "—"}
                        </span>
                        <div className="flex justify-center" role="cell">
                          <MarketMovementCell direction={row.direction} />
                        </div>
                      </div>

                      <div
                        className="hidden min-h-[42px] grid-cols-[minmax(180px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(110px,1.1fr)_minmax(90px,0.9fr)_minmax(70px,0.7fr)] items-center gap-2 border-b border-[#e8eeec] bg-white px-3 last:border-b-0 sm:grid"
                        role="row"
                      >
                      <span className="truncate text-sm font-semibold text-[#1B324D]" role="cell">
                        {row.name}
                      </span>

                      <span className="whitespace-nowrap text-center text-sm tabular-nums text-[#435967]" role="cell">
                        {row.low != null ? formatPrice(row.low) : "—"}
                      </span>

                      <span className="whitespace-nowrap text-center text-sm tabular-nums text-[#435967]" role="cell">
                        {row.high != null ? formatPrice(row.high) : "—"}
                      </span>

                      <span className="whitespace-nowrap text-center text-sm font-semibold tabular-nums text-[#1B324D]" role="cell">
                        {currency.format(row.price)}
                      </span>

                      <span className="whitespace-nowrap text-center text-sm text-[#667774]" role="cell">
                        {row.weight ?? "—"}
                      </span>

                      <div className="flex justify-center" role="cell">
                        <MarketMovementCell direction={row.direction} />
                      </div>
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
