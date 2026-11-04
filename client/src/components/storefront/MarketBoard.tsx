import { useState } from "react";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { Product } from "@shared/schema";
import "./MarketBoard.css";

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
  changePercent: number | null;
  history: number[];
};

type MarketBoardProps = {
  products: Product[];
};

const MARKET_PRODUCT_ORDER = [
  "surmai",
  "paplet",
  "bangda",
  "rawas",
  "bombil",
  "kolambi",
  "halwa",
  "mandeli",
];

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

type MarketFilter = "all" | "dropped" | "rising";

function recordedHistory(product: MarketProduct, currentPrice: number): number[] {
  const points = (product.marketHistory ?? [])
    .map((entry) => Number(entry.price))
    .filter((price) => Number.isFinite(price) && price >= 0);
  if (points.length === 0) return [];
  if (points.length === 1) return [points[0], currentPrice];
  return points[points.length - 1] === currentPrice
    ? points
    : [...points, currentPrice].slice(-7);
}

function getMovementEmptyMessage(
  filter: MarketFilter,
  rows: MarketRow[],
): string {
  const knownComparisons = rows.filter((row) => row.changePercent != null);
  if (knownComparisons.length === 0) {
    return filter === "dropped"
      ? "No price drops to show yet. Trend details appear when a price change is recorded."
      : "No price rises to show yet. Trend details appear when a price change is recorded.";
  }

  const rising = knownComparisons.some((row) => row.direction === "up");
  const dropped = knownComparisons.some((row) => row.direction === "down");
  if (!rising && !dropped) return "Prices are unchanged from yesterday's close.";

  if (filter === "dropped") {
    return rising
      ? "No prices have dropped today. Some prices are rising."
      : "No price drops recorded today. Other prices are unchanged.";
  }
  return dropped
    ? "No prices are rising today. Some prices have dropped."
    : "No price rises recorded today. Other prices are unchanged.";
}

function sparklinePath(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const points = values.map((value, index) => ({
    x: (index / Math.max(1, values.length - 1)) * 100,
    y: 30 - ((value - min) / span) * 22,
  }));
  const line = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} Q ${midpoint} ${previous.y} ${point.x} ${point.y}`;
  }, "");
  return {
    line,
    area: `${line} L 100 36 L 0 36 Z`,
  };
}

function Sparkline({ row, featured = false }: { row: MarketRow; featured?: boolean }) {
  if (row.history.length < 2) return null;

  const paths = sparklinePath(row.history);
  const gradientId = `market-gradient-${String(row.product.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const isDropped = row.direction === "down";

  return (
    <svg
      className={`market-sparkline${featured ? " market-sparkline-featured" : ""}`}
      viewBox="0 0 100 38"
      preserveAspectRatio="none"
      role="img"
      aria-label={`Recorded price history for ${row.name}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={isDropped ? "#59C39E" : "#e58a8a"} stopOpacity="0.28" />
          <stop offset="100%" stopColor={isDropped ? "#59C39E" : "#e58a8a"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={paths.area} fill={`url(#${gradientId})`} className="market-spark-area" />
      <path
        d={paths.line}
        fill="none"
        stroke={isDropped ? "#36a980" : "#d97b7b"}
        strokeWidth={featured ? "1.15" : "1.5"}
        vectorEffect="non-scaling-stroke"
        className="market-spark-line"
      />
    </svg>
  );
}

function TrendBadge({ row }: { row: MarketRow }) {
  const direction = row.direction ?? "steady";
  const isDropped = direction === "down";
  const isRising = direction === "up";
  const Icon = isDropped ? ArrowDown : isRising ? ArrowUp : Minus;
  const percent = row.changePercent == null ? "—" : `${Math.abs(row.changePercent).toFixed(1)}%`;

  return (
    <span
      className={`market-trend-badge ${isDropped ? "is-dropped" : isRising ? "is-rising" : "is-steady"}`}
      aria-label={
        isDropped
          ? `Price dropped ${percent}`
          : isRising
            ? `Price rising ${percent}`
            : "Price unchanged"
      }
    >
      <Icon aria-hidden="true" />
      <span>{percent}</span>
    </span>
  );
}

function MarketRangeBar({ row }: { row: MarketRow }) {
  const range = row.low != null && row.high != null && row.high > row.low;
  const position = range
    ? Math.max(0, Math.min(100, ((row.price - row.low!) / (row.high! - row.low!)) * 100))
    : 50;

  return (
    <div className="market-range" aria-label={`Today's price range for ${row.name}`}>
      <div className="market-range-labels">
        <span>LOW <strong>{row.low != null ? formatPrice(row.low) : "—"}</strong></span>
        <span>HIGH <strong>{row.high != null ? formatPrice(row.high) : "—"}</strong></span>
      </div>
      <div className="market-range-track" aria-hidden="true">
        <span className="market-range-fill" />
        <span className="market-range-dot" style={{ left: `${position}%` }} />
      </div>
    </div>
  );
}

export function MarketBoard({ products }: MarketBoardProps) {
  const [filter, setFilter] = useState<MarketFilter>("all");
  const eligibleProducts = (products as MarketProduct[]).filter((product) =>
    product.price != null &&
    !product.isArchived &&
    !product.batchExpired &&
    product.status !== "expired" &&
    product.status !== "unavailable" &&
    product.status !== "archived"
  );
  const marketProducts = MARKET_PRODUCT_ORDER
    .map((name) => eligibleProducts.find((product) => product.name.trim().toLowerCase() === name))
    .filter((product): product is MarketProduct => product != null);
  const marketRows: MarketRow[] = marketProducts.map((product) => {
    const changePercent = product.marketMovement?.changePercent ?? null;
    const price = product.price!;
    return {
      product,
      name: product.name,
      price,
      low: product.marketRange?.low ?? null,
      high: product.marketRange?.high ?? null,
      weight: product.unit?.trim() || formatWeight(product.netWeight) || formatWeight(product.grossWeight),
      direction: product.marketMovement?.direction ?? null,
      changePercent,
      history: recordedHistory(product, price),
    };
  });
  const filteredRows = marketRows.filter((row) =>
    filter === "all" ||
    (filter === "dropped" && row.direction === "down") ||
    (filter === "rising" && row.direction === "up")
  );
  const featuredRow = filteredRows.reduce<MarketRow | null>((top, row) =>
    !top || Math.abs(row.changePercent ?? 0) > Math.abs(top.changePercent ?? 0) ? row : top,
  null);
  const remainingRows = featuredRow
    ? filteredRows.filter((row) => row.product.id !== featuredRow.product.id)
    : [];
  const filters: Array<{ value: MarketFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "dropped", label: "Dropped" },
    { value: "rising", label: "Rising" },
  ];

  return (
    <section
      aria-labelledby="market-board-title"
      className="market-board-v2 relative mb-5 overflow-hidden rounded-2xl border border-[#e4ece8] bg-white text-[#1B324D] shadow-[0_14px_38px_-30px_rgba(27,50,77,0.38)]"
    >
      <div className="market-board-inner">
        <header className="market-board-header">
          <div>
            <p className="market-eyebrow"><span className="market-live-dot" /> LIVE MARKET</p>
            <h1 id="market-board-title">Today&apos;s Fresh Catch Rates</h1>
            <p className="market-updated">Yesterday&apos;s close · today&apos;s saved updates</p>
          </div>
          <div className="market-filter" role="group" aria-label="Filter fish by price movement">
            {filters.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={filter === option.value ? "is-active" : ""}
                data-testid={`market-filter-${option.value}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        {marketRows.length > 0 && (
          <div className="market-ticker" aria-label="Live fish prices">
            <div className="market-ticker-track">
              {[0, 1].map((copy) => (
                <div className="market-ticker-group" key={copy} aria-hidden={copy === 1}>
                  {marketRows.map((row) => (
                    <span className={`market-ticker-item ${row.direction === "down" ? "is-dropped" : row.direction === "up" ? "is-rising" : ""}`} key={`${copy}-${row.product.id}`}>
                      <span>{row.name}</span>
                      <strong>{formatPrice(row.price)}</strong>
                      {row.direction === "down" ? <ArrowDown aria-hidden="true" /> : row.direction === "up" ? <ArrowUp aria-hidden="true" /> : <Minus aria-hidden="true" />}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {featuredRow ? (
          <div className="market-bento" key={filter}>
            <article
              className={`market-featured ${featuredRow.direction === "down" ? "is-dropped" : featuredRow.direction === "up" ? "is-rising" : "is-steady"}`}
              style={{ "--market-delay": "0ms" } as CSSProperties}
            >
              <div className="market-featured-top">
                <span className="market-feature-label">
                  {featuredRow.direction === "up" || featuredRow.direction === "down"
                    ? "TOP PRICE MOVEMENT"
                    : "CURRENT MARKET RATE"}
                </span>
              </div>
              <div className="market-featured-name">
                <h2>{featuredRow.name}</h2>
              </div>
              <div className="market-featured-metrics">
                <span className="market-weight-chip">{featuredRow.weight ?? "Fresh catch"}</span>
                <div className="market-featured-price">
                  <span aria-hidden="true">₹</span>
                  <span
                    className="market-price-count"
                    style={{ "--market-target": Math.round(featuredRow.price) } as CSSProperties & { "--market-target": number }}
                    aria-label={formatPrice(featuredRow.price)}
                  />
                </div>
                <TrendBadge row={featuredRow} />
              </div>
              <p className="market-featured-caption">Today&apos;s market price</p>
              <Sparkline row={featuredRow} featured />
              <MarketRangeBar row={featuredRow} />
            </article>

            <div className="market-grid" aria-label="Other fresh fish rates">
              {remainingRows.map((row, index) => (
                <article
                  className={`market-mini-card ${row.direction === "down" ? "is-dropped" : row.direction === "up" ? "is-rising" : "is-steady"}`}
                  key={row.product.id}
                  style={{ "--market-delay": `${(index + 1) * 55}ms` } as CSSProperties}
                >
                  <div className="market-mini-top">
                    <h3>{row.name}</h3>
                  </div>
                  <div className="market-mini-price-row">
                    <span className="market-weight-chip">{row.weight ?? "Fresh catch"}</span>
                    <div className="market-mini-price">
                      <span aria-hidden="true">₹</span>
                      <span
                        className="market-price-count"
                        style={{ "--market-target": Math.round(row.price) } as CSSProperties & { "--market-target": number }}
                        aria-label={formatPrice(row.price)}
                      />
                    </div>
                    <TrendBadge row={row} />
                  </div>
                  <Sparkline row={row} />
                  <MarketRangeBar row={row} />
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="market-empty">
            {marketRows.length === 0
              ? "No current catalog prices are available right now."
              : getMovementEmptyMessage(filter, marketRows)}
          </div>
        )}
      </div>
    </section>
  );
}

export default MarketBoard;
