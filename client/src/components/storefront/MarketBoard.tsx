import { ArrowDownRight, ArrowUpRight, Minus, Waves } from "lucide-react";
import type { Product } from "@shared/schema";

type MarketMovement = {
  direction: "up" | "down" | "steady";
  changeAmount: number;
  changePercent: number;
  referencePrice: number;
  comparisonLabel: string;
};

type MarketProduct = Product & {
  marketMovement?: MarketMovement | null;
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
    return (
      <>
        <span className="text-sm text-white/40">—</span>
        <span className="text-xs text-white/45">Not tracked yet</span>
      </>
    );
  }

  const isUp = movement.direction === "up";
  const isDown = movement.direction === "down";
  const tone = isUp ? "text-[#73ddb5]" : isDown ? "text-[#ff9d8f]" : "text-white/65";
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
  const sign = isUp ? "+" : isDown ? "−" : "";

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold tabular-nums ${tone}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {sign}{formatPrice(Math.abs(movement.changeAmount))}
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
  const trackedProducts = marketProducts.filter((product) => product.marketMovement);
  const risingCount = trackedProducts.filter((product) => product.marketMovement?.direction === "up").length;
  const fallingCount = trackedProducts.filter((product) => product.marketMovement?.direction === "down").length;
  const steadyCount = trackedProducts.filter((product) => product.marketMovement?.direction === "steady").length;

  return (
    <section
      aria-labelledby="market-board-title"
      className="relative mb-6 overflow-hidden rounded-2xl bg-[#1B324D] text-white shadow-[0_18px_44px_-28px_rgba(27,50,77,0.7)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/[0.07]" />
        <div className="absolute -right-8 -top-20 h-56 w-56 rounded-full border border-[#59C39E]/20" />
        <div className="absolute bottom-0 left-[38%] h-px w-64 bg-gradient-to-r from-transparent via-[#59C39E]/40 to-transparent" />
      </div>

      <div className="relative px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#8ee0be]">
              <Waves className="h-4 w-4" aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">
                Fresh Stock Xchange · Market Watch
              </span>
            </div>
            <h1 id="market-board-title" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Fresh market prices
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/65 sm:text-sm">
              First price update of the day compares with yesterday’s close. Later updates compare with today’s first price.
            </p>
          </div>

          <dl className="grid grid-cols-4 gap-2 sm:flex sm:gap-5">
            <div className="min-w-14 border-l-2 border-[#59C39E] pl-2.5 sm:min-w-16">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">Listed</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{marketProducts.length}</dd>
            </div>
            <div className="min-w-14 border-l-2 border-[#73ddb5] pl-2.5 sm:min-w-16">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">Rising</dt>
              <dd className="mt-0.5 text-lg font-semibold text-[#73ddb5] tabular-nums">{risingCount}</dd>
            </div>
            <div className="min-w-14 border-l-2 border-[#ff9d8f] pl-2.5 sm:min-w-16">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">Falling</dt>
              <dd className="mt-0.5 text-lg font-semibold text-[#ff9d8f] tabular-nums">{fallingCount}</dd>
            </div>
            <div className="min-w-14 border-l-2 border-white/30 pl-2.5 sm:min-w-16">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">Steady</dt>
              <dd className="mt-0.5 text-lg font-semibold text-white/75 tabular-nums">{steadyCount}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 overflow-x-auto scrollbar-hide">
          <div
            className="min-w-[800px]"
            role="table"
            aria-label="Fresh market product prices and daily changes"
          >
            <div
              className="grid grid-cols-[minmax(220px,1.7fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(95px,0.6fr)_minmax(190px,1.2fr)] gap-4 px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/45"
              role="row"
            >
              <span role="columnheader">Product</span>
              <span role="columnheader">Current price</span>
              <span role="columnheader">Net change</span>
              <span role="columnheader">Change %</span>
              <span role="columnheader">Compared with</span>
            </div>

            {marketProducts.length > 0 ? (
              <div className="divide-y divide-white/[0.08]">
                {marketProducts.map((product) => {
                  const movement = product.marketMovement;
                  return (
                    <div
                      key={product.id}
                      className="grid min-h-[68px] grid-cols-[minmax(220px,1.7fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(95px,0.6fr)_minmax(190px,1.2fr)] items-center gap-4 rounded-lg px-3 transition-colors hover:bg-white/[0.045]"
                      role="row"
                    >
                      <div className="min-w-0" role="cell">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                          <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.12em] text-white/45">
                            {product.category}{product.unit ? ` · ${product.unit}` : ""}
                          </p>
                        </div>
                      </div>

                      <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-white" role="cell">
                        {currency.format(product.price!)}
                      </span>

                      <div className="flex flex-col gap-0.5" role="cell">
                        <MarketMovementCell product={product} />
                      </div>

                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          movement?.direction === "up"
                            ? "text-[#73ddb5]"
                            : movement?.direction === "down"
                              ? "text-[#ff9d8f]"
                              : "text-white/55"
                        }`}
                        role="cell"
                      >
                        {movement
                          ? `${movement.direction === "up" ? "+" : movement.direction === "down" ? "−" : ""}${Math.abs(movement.changePercent).toFixed(1)}%`
                          : "—"}
                      </span>

                      <div className="min-w-0" role="cell">
                        {movement ? (
                          <>
                            <p className="truncate text-xs font-medium text-white/85">{movement.comparisonLabel}</p>
                            <p className="mt-0.5 text-[10px] tabular-nums text-white/45">
                              Reference {currency.format(movement.referencePrice)}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-white/45">Awaiting first price update</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/15 px-4 py-10 text-center">
                <p className="text-sm font-medium text-white/85">No current market prices</p>
                <p className="mt-1 text-xs text-white/50">Available product prices will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-[10px] text-white/40">
          Price movements reflect product price changes saved by the admin. Comparisons use India Standard Time.
        </p>
      </div>
    </section>
  );
}

export default MarketBoard;
