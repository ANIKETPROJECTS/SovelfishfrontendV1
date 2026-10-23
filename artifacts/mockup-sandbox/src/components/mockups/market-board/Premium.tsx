import { useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import "./_group.css";
import "./MarketBoardPreview.css";

const rates = [
  { name: "Surmai", price: 445, low: 410, high: 470, weight: "500 g", direction: "up", change: 4.7, points: [410, 422, 418, 435, 427, 440, 445] },
  { name: "Paplet", price: 620, low: 610, high: 675, weight: "1 kg", direction: "down", change: -2.1, points: [655, 646, 652, 638, 640, 628, 620] },
  { name: "Bangda", price: 385, low: 360, high: 405, weight: "500 g", direction: "up", change: 3.8, points: [364, 369, 371, 379, 376, 382, 385] },
  { name: "Rawas", price: 175, low: 165, high: 190, weight: "500 ml", direction: "down", change: -1.6, points: [184, 181, 183, 179, 178, 177, 175] },
  { name: "Bombil", price: 540, low: 520, high: 585, weight: "1 kg", direction: "up", change: 5.2, points: [505, 511, 520, 517, 531, 535, 540] },
  { name: "Kolambi", price: 295, low: 280, high: 320, weight: "500 g", direction: "down", change: -1.3, points: [309, 306, 310, 304, 301, 299, 295] },
  { name: "Halwa", price: 510, low: 490, high: 560, weight: "1 kg", direction: "up", change: 2.9, points: [490, 496, 499, 502, 500, 507, 510] },
  { name: "Mandeli", price: 335, low: 325, high: 360, weight: "500 g", direction: "down", change: -0.8, points: [349, 345, 347, 342, 341, 338, 335] },
];

type Rate = typeof rates[number];
type Filter = "all" | "dropped" | "rising";

function Trend({ row }: { row: Rate }) {
  const Icon = row.direction === "down" ? ArrowDown : row.direction === "up" ? ArrowUp : Minus;
  return (
    <span className={`market-trend ${row.direction}`}>
      <Icon size={13} strokeWidth={2.8} />
      {Math.abs(row.change).toFixed(1)}%
    </span>
  );
}

function Chart({ row, big = false }: { row: Rate; big?: boolean }) {
  const min = Math.min(...row.points);
  const max = Math.max(...row.points);
  const points = row.points.map((value, i) => `${(i / 6) * 100},${30 - ((value - min) / Math.max(1, max - min)) * 21}`);
  const line = points.map((point, i) => `${i ? "L" : "M"} ${point}`).join(" ");
  const dropped = row.direction === "down";
  return (
    <svg className={`market-chart ${big ? "big" : ""}`} viewBox="0 0 100 38" preserveAspectRatio="none" aria-label={`${row.name} seven-day price trend`}>
      <defs>
        <linearGradient id={`fill-${row.name}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dropped ? "#59c39e" : "#d9868a"} stopOpacity=".32" />
          <stop offset="1" stopColor={dropped ? "#59c39e" : "#d9868a"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L 100 38 L 0 38 Z`} fill={`url(#fill-${row.name})`} className="market-chart-fill" />
      <path d={line} fill="none" stroke={dropped ? "#37a17b" : "#d17b81"} strokeWidth="1.35" vectorEffect="non-scaling-stroke" className="market-chart-line" />
    </svg>
  );
}

function Range({ row }: { row: Rate }) {
  const position = Math.max(0, Math.min(100, ((row.price - row.low) / (row.high - row.low)) * 100));
  return (
    <div className="market-range-preview">
      <div><span>LOW <b>₹{row.low}</b></span><span>HIGH <b>₹{row.high}</b></span></div>
      <i><span style={{ left: `${position}%` }} /></i>
    </div>
  );
}

export function Premium() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = rates.filter((row) => filter === "all" || (filter === "dropped" ? row.direction === "down" : row.direction === "up"));
  const featured = visible.reduce((top, row) => !top || Math.abs(row.change) > Math.abs(top.change) ? row : top, null as Rate | null);
  const otherRows = visible.filter((row) => row !== featured);
  const options: Array<{ id: Filter; label: string }> = [{ id: "all", label: "All" }, { id: "dropped", label: "Dropped" }, { id: "rising", label: "Rising" }];
  const tickerRows = [...rates, ...rates];

  return (
    <main className="market-premium">
      <header className="market-premium-header">
        <div>
          <div className="market-live"><i /> LIVE MARKET</div>
          <h1>Today&apos;s Fresh Catch Rates</h1>
          <p>Updated just now</p>
        </div>
        <nav className="market-filters" aria-label="Filter price movement">
          {options.map(({ id, label }) => (
            <button className={filter === id ? "selected" : ""} onClick={() => setFilter(id)} aria-pressed={filter === id} key={id}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <div className="market-ticker-preview" aria-label="Live prices">
        <div className="market-ticker-content">
          {tickerRows.map((row, i) => (
            <span className={row.direction} key={`${row.name}-${i}`}>
              {row.name}<b>₹{row.price}</b>{row.direction === "down" ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
            </span>
          ))}
        </div>
      </div>
      {featured ? (
        <div className="market-bento-preview" key={filter}>
          <article className={`market-feature-preview ${featured.direction}`}>
            <div className="market-feature-meta"><span>TOP DEAL TODAY</span><label>{featured.direction === "down" ? "Price Dropped" : "Price Rising"}</label></div>
            <div className="market-feature-title"><div><h2>{featured.name}</h2><small>{featured.weight}</small></div><Trend row={featured} /></div>
            <div className="market-feature-price"><span>₹{featured.price}</span><small>Today&apos;s market price</small></div>
            <Chart row={featured} big />
            <Range row={featured} />
          </article>
          <div className="market-stock-grid">
            {otherRows.map((row, i) => (
              <article className={`market-stock-card ${row.direction}`} style={{ animationDelay: `${i * 50}ms` }} key={row.name}>
                <div className="market-stock-head"><h3>{row.name}</h3><small>{row.weight}</small></div>
                <div className="market-stock-price"><b>₹{row.price}</b><Trend row={row} /></div>
                <label>{row.direction === "down" ? "Price Dropped" : "Price Rising"}</label>
                <Chart row={row} />
                <Range row={row} />
              </article>
            ))}
          </div>
        </div>
      ) : <div className="market-preview-empty">No prices in this group yet.</div>}
    </main>
  );
}
