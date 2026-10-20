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

type MarketRow = {
  product: MarketProduct;
  price: number;
  low: number | null;
  high: number | null;
  weight: string | null;
  direction: MarketMovement["direction"] | null;
  changePercent: number | null;
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
  { price: 445, low: 410, high: 470, weight: "500 g", direction: "up", changePercent: 4.7 },
  { price: 620, low: 610, high: 675, weight: "1 kg", direction: "down", changePercent: 2.1 },
  { price: 385, low: 360, high: 405, weight: "500 g", direction: "up", changePercent: 3.8 },
  { price: 175, low: 165, high: 190, weight: "500 ml", direction: "down", changePercent: 1.6 },
  { price: 540, low: 520, high: 585, weight: "1 kg", direction: "up", changePercent: 5.2 },
  { price: 295, low: 280, high: 320, weight: "500 g", direction: "down", changePercent: 1.3 },
  { price: 510, low: 490, high: 560, weight: "1 kg", direction: "up", changePercent: 2.9 },
  { price: 335, low: 325, high: 360, weight: "500 g", direction: "steady", changePercent: 0 },
] satisfies Array<{
  price: number;
  low: number;
  high: number;
  weight: string;
  direction: MarketMovement["direction"];
  changePercent: number;
}>;

function MarketMovementCell({ direction, changePercent }: Pick<MarketRow, "direction" | "changePercent">) {
  if (!direction || changePercent == null) {
    return <span className="text-white/45">—</span>;
  }

  const isUp = direction === "up";
  const isDown = direction === "down";
  const tone = isUp ? "text-[#73ddb5]" : isDown ? "text-[#ff9d8f]" : "text-white/65";
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
  const sign = isUp ? "+" : isDown ? "−" : "";

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold tabular-nums ${tone}`} aria-label={`${direction} ${Math.abs(changePercent).toFixed(1)} percent`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {sign}{Math.abs(changePercent).toFixed(1)}%
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
  const marketRows: MarketRow[] = marketProducts.map((product, index) => {
    const preview = import.meta.env.DEV ? PREVIEW_MARKET_VALUES[index] : undefined;
    return {
      product,
      price: preview?.price ?? product.price!,
      low: preview?.low ?? product.marketRange?.low ?? null,
      high: preview?.high ?? product.marketRange?.high ?? null,
      weight: preview?.weight ?? product.netWeight?.trim() ?? product.grossWeight?.trim() ?? null,
      direction: preview?.direction ?? product.marketMovement?.direction ?? null,
      changePercent: preview?.changePercent ?? product.marketMovement?.changePercent ?? null,
    };
  });

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
              className="grid grid-cols-[minmax(180px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(130px,1.25fr)_minmax(100px,0.9fr)] gap-2 bg-[#2c5a85] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:text-[10px]"
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
                      className="grid min-h-[38px] grid-cols-[minmax(180px,2fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(130px,1.25fr)_minmax(100px,0.9fr)] items-center gap-2 border-b border-white/10 px-3 transition-colors odd:bg-[#234d76] even:bg-[#1B324D] hover:bg-[#315f87] last:border-b-0"
                      role="row"
                    >
                      <span className="truncate text-xs font-semibold text-white sm:text-sm" role="cell">
                        {row.product.name}
                      </span>

                      <span className="whitespace-nowrap text-[11px] tabular-nums text-white/75" role="cell">
                        {row.low != null ? formatPrice(row.low) : "—"}
                      </span>

                      <span className="whitespace-nowrap text-[11px] tabular-nums text-white/75" role="cell">
                        {row.high != null ? formatPrice(row.high) : "—"}
                      </span>

                      <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-white sm:text-sm" role="cell">
                        {currency.format(row.price)}
                        {row.weight && (
                          <span className="ml-1 text-[9px] font-normal text-white/55">
                            · {row.weight}
                          </span>
                        )}
                      </span>

                      <div role="cell">
                        <MarketMovementCell direction={row.direction} changePercent={row.changePercent} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-t border-white/10 px-3 py-4 text-center">
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
