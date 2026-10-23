import "./_group.css";
import "./MarketBoardPreview.css";

const rates = [
  ["Surmai", "₹410", "₹470", "₹445", "500 g", "up"],
  ["Paplet", "₹610", "₹675", "₹620", "1 kg", "down"],
  ["Bangda", "₹360", "₹405", "₹385", "500 g", "up"],
  ["Rawas", "₹165", "₹190", "₹175", "500 ml", "down"],
  ["Bombil", "₹520", "₹585", "₹540", "1 kg", "up"],
  ["Kolambi", "₹280", "₹320", "₹295", "500 g", "down"],
  ["Halwa", "₹490", "₹560", "₹510", "1 kg", "up"],
  ["Mandeli", "₹325", "₹360", "₹335", "500 g", "down"],
];

export function Current() {
  return (
    <section className="market-current">
      <h1>Fresh market prices</h1>
      <div className="market-current-head">
        <span>Product</span><span>Low</span><span>High</span><span>Price</span><span>Weight</span><span>Trends</span>
      </div>
      {rates.map(([name, low, high, price, weight, direction]) => (
        <div className="market-current-row" key={name}>
          <strong>{name}</strong><span>{low}</span><span>{high}</span><b>{price}</b><span>{weight}</span>
          <span className={`market-current-trend ${direction}`} aria-label={`${direction} trend`}>
            {direction === "up" ? "▲" : "▼"}
          </span>
        </div>
      ))}
    </section>
  );
}
