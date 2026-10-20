import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
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

function MarketMovementCell({ product }: { product: MarketProduct }) {
  const movement = product.marketMovement;

  if (!movement) {
    return <span className="text-white/45">—</span>;
  }

  const isUp = movement.direction === "up";
  const isDown = movement.direction === "down";
  const tone = isUp ? "text-[#73ddb5]" : isDown ? "text-[#ff9d8f]" : "text-white/65";
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
  const sign = isUp ? "+" : isDown ? "−" : "";

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold tabular-nums ${tone}`} aria-label={`${movement.direction} ${Math.abs(movement.changePercent).toFixed(1)} percent`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {sign}{Math.abs(movement.changePercent).toFixed(1)}%
    </span>
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

  return (
    <section
      aria-labelledby="market-board-title"
      className="relative mb-4 overflow-hidden rounded-xl bg-[#1B324D] text-white shadow-[0_12px_30px_-22px_rgba(27,50,77,0.7)]"
    >
      <div className="relative px-3 py-2 sm:px-4 sm:py-3">
        <div className="mb-2 flex items-center border-b border-white/10 pb-2">
          <h1 id="market-board-title" className="font-display text-lg font-semibold leading-tight tracking-tight sm:text-xl">
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
              className="grid grid-cols-[minmax(180px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(130px,1.25fr)_minmax(100px,0.9fr)] gap-2 rounded-t-md bg-[#2c5a85] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:text-[10px]"
              role="row"
            >
              <span role="columnheader">Product</span>
              <span role="columnheader">Low</span>
              <span role="columnheader">High</span>
              <span role="columnheader">Price</span>
              <span role="columnheader">Trends</span>
            </div>

            {marketProducts.length > 0 ? (
              <div className="overflow-hidden rounded-b-md border border-t-0 border-white/10">
                {marketProducts.map((product) => {
                  const movement = product.marketMovement;
                  const range = product.marketRange;
                  return (
                    <div
                      key={product.id}
                      className="grid min-h-[38px] grid-cols-[minmax(180px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(130px,1.25fr)_minmax(100px,0.9fr)] items-center gap-2 border-b border-white/10 px-3 transition-colors odd:bg-[#234d76] even:bg-[#1B324D] hover:bg-[#315f87] last:border-b-0"
                      role="row"
                    >
                      <span className="truncate text-xs font-semibold text-white sm:text-sm" role="cell">
                        {product.name}
                      </span>

                      <span className="whitespace-nowrap text-[11px] tabular-nums text-white/75" role="cell">
                        {range ? formatPrice(range.low) : "—"}
                      </span>

                      <span className="whitespace-nowrap text-[11px] tabular-nums text-white/75" role="cell">
                        {range ? formatPrice(range.high) : "—"}
                      </span>

                      <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-white sm:text-sm" role="cell">
                        {currency.format(product.price!)}
                        {product.unit && (
                          <span className="ml-1 text-[9px] font-normal text-white/55">
                            / {product.unit.replace(/^per\s+/i, "")}
                          </span>
                        )}
                      </span>

                      <div role="cell">
                        <MarketMovementCell product={product} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-b-md border border-t-0 border-white/15 px-4 py-5 text-center">
                <p className="text-xs font-medium text-white/70">No current prices</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

export default MarketBoard;
