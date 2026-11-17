import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { FreshStockXchangeLogo } from "@/components/storefront/FreshStockXchangeLogo";

import phoneIcon from "@assets/telephone_1778180674008.png";
import mailIcon from "@assets/email_1778180701088.png";
import clockIcon from "@assets/clock_(1)_1778180727425.png";

const whiteFilter = { filter: "brightness(0) invert(1)" } as const;

function LazyMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full flex-1 overflow-hidden rounded-xl border border-white" style={{ minHeight: "150px" }}>
      {visible ? (
        <iframe
          title="Fresh Stock Xchange Location"
          src="https://www.google.com/maps?q=RH%2018%2C%20Sairaj%20Society%2C%20Plot%2022%2C%20Sector%206%2C%20Airoli%2C%20Navi%20Mumbai%2C%20Maharashtra%20400708&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: "150px", display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex w-full items-center justify-center bg-transparent" style={{ minHeight: "150px" }}>
          <span className="text-xs font-semibold text-white">Loading map…</span>
        </div>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer-wood-bg mt-10 overflow-hidden border-t-4 border-white text-white">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
        <div className="grid grid-cols-1 gap-x-6 gap-y-7 py-2 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-[1.2fr_0.85fr_1.25fr_1.4fr]">
          <section aria-labelledby="footer-brand-heading" className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-sm sm:h-16 sm:w-16 sm:p-1">
                <FreshStockXchangeLogo className="h-full w-full scale-[1.14]" />
              </div>
              <h2 id="footer-brand-heading" className="font-display text-xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-2xl">
                Fresh Stock Xchange
              </h2>
            </div>
            <p className="mt-4 font-display text-lg font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-xl">
              Fresh seafood, packed with care and delivered fresh.
            </p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white">
              Shop fresh fish, prawns, chicken, and mutton—cleaned, packed, and delivered to your doorstep.
            </p>

          </section>

          <nav aria-label="Customer support" className="min-w-0">
            <h3 className="mb-3 text-base font-bold uppercase tracking-[0.16em] text-white">
              Customer care
            </h3>
            <ul className="space-y-2">
              {[
                { label: "My Orders", to: "/profile" },
                { label: "My Profile", to: "/profile" },
                { label: "Terms & Conditions", to: "/terms" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Refund Policy", to: "/refund-policy" },
                { label: "FAQ", to: "/faq" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link href={to} className="text-[15px] font-semibold text-white transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-heading" className="min-w-0">
            <h3 id="footer-contact-heading" className="mb-3 text-base font-bold uppercase tracking-[0.16em] text-white">
              Get in touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <img src={phoneIcon} alt="" aria-hidden className="h-5 w-5 shrink-0" style={whiteFilter} />
                <a href="tel:+919619590694" className="break-all text-[15px] font-semibold text-white transition-colors hover:text-white">
                  +91 9619590694
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                <span className="text-[15px] font-semibold leading-relaxed text-white">
                  RH 18, Sairaj Society, Plot 22, Sector 6, Airoli, Navi Mumbai, Maharashtra 400708
                </span>
              </li>
              <li className="flex items-center gap-3">
                <img src={mailIcon} alt="" aria-hidden className="h-5 w-5 shrink-0" style={whiteFilter} />
                <a href="mailto:info@freshstockxchange.com" className="break-all text-[15px] font-semibold text-white transition-colors hover:text-white">
                  info@freshstockxchange.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <img src={clockIcon} alt="" aria-hidden className="mt-0.5 h-5 w-5 shrink-0" style={whiteFilter} />
                <span className="text-[15px] font-semibold leading-relaxed text-white">
                  Mon – Sun: 6:00 AM – 9:00 PM
                </span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="footer-location-heading" className="flex min-w-0 flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 id="footer-location-heading" className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                Find us
              </h3>
              <span className="text-xs font-semibold text-white">Airoli · Navi Mumbai</span>
            </div>
            <LazyMap />
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-white pt-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs font-semibold text-white sm:text-sm">
            © {new Date().getFullYear()} Fresh Stock Xchange. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-white sm:text-sm">
            Designed and Developed by{" "}
            <a
              href="https://www.airavatatechnologies.com/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-white transition-colors hover:text-white"
            >
              AIRAVATA TECHNOLOGIES
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
