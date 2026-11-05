import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";
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
    <div ref={ref} className="rounded-xl overflow-hidden border border-white/20 w-full flex-1" style={{ minHeight: "200px" }}>
      {visible ? (
        <iframe
          title="Fresh Stock Xchange Location"
          src="https://www.google.com/maps?q=RH%2018%2C%20Sairaj%20Society%2C%20Plot%2022%2C%20Sector%206%2C%20Airoli%2C%20Navi%20Mumbai%2C%20Maharashtra%20400708&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: "200px", display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="w-full bg-white/10 flex items-center justify-center" style={{ minHeight: "200px" }}>
          <span className="text-white/50 text-xs">Loading map…</span>
        </div>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 overflow-hidden border-t-4 border-[#69D84F] bg-[linear-gradient(118deg,#000035_0%,#071743_52%,#12432f_100%)] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-10 sm:px-8 sm:pt-14">
        <section className="grid gap-7 border-b border-white/15 pb-9 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10 lg:pb-11">
          <div>
            <div className="inline-flex max-w-full rounded-lg bg-white px-3 py-2.5">
              <FreshStockXchangeLogo className="h-auto w-full max-w-[300px]" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Fresh catch. Fair prices.{" "}
              <span className="text-[#69D84F]">Delivered to your door.</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Fresh fish, seafood &amp; meat, cleaned, packed, and delivered straight to your doorstep.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="tel:+919619590694"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#69D84F] px-5 py-2.5 text-sm font-semibold text-[#000035] transition hover:bg-[#7ce865] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Phone aria-hidden className="h-4 w-4" />
              Call +91 9619590694
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/919619590694"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 text-sm font-medium text-white transition hover:border-[#69D84F] hover:text-[#69D84F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69D84F]"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              WhatsApp us
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-x-7 gap-y-10 py-9 sm:gap-x-10 sm:py-11 lg:grid-cols-[0.8fr_0.9fr_1.2fr_1.35fr]">
          <nav aria-label="Explore" className="min-w-0">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#69D84F]">
              Explore
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Shop Fish", href: "/category/Fish" },
                { label: "Shop Prawns", href: "/category/Prawns" },
                { label: "Shop Chicken", href: "/category/Chicken" },
                { label: "Shop Mutton", href: "/category/Mutton" },
                { label: "Combo Deals", href: "/combos" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/80 transition-colors hover:text-[#69D84F]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Customer support" className="min-w-0">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#69D84F]">
              Customer care
            </h3>
            <ul className="space-y-3">
              {[
                { label: "My Orders", to: "/profile" },
                { label: "My Profile", to: "/profile" },
                { label: "Terms & Conditions", to: "/terms" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Refund Policy", to: "/refund-policy" },
                { label: "FAQ", to: "/faq" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link href={to} className="text-sm text-white/80 transition-colors hover:text-[#69D84F]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-heading" className="col-span-2 min-w-0 sm:col-span-1">
            <h3 id="footer-contact-heading" className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#69D84F]">
              Get in touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <img src={phoneIcon} alt="" aria-hidden className="h-4 w-4 shrink-0" style={whiteFilter} />
                <a href="tel:+919619590694" className="break-all text-sm text-white/85 transition-colors hover:text-[#69D84F]">
                  +91 9619590694
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#69D84F]" />
                <span className="text-sm leading-relaxed text-white/85">
                  RH 18, Sairaj Society, Plot 22, Sector 6, Airoli, Navi Mumbai, Maharashtra 400708
                </span>
              </li>
              <li className="flex items-center gap-3">
                <img src={mailIcon} alt="" aria-hidden className="h-4 w-4 shrink-0" style={whiteFilter} />
                <a href="mailto:info@freshstockxchange.com" className="break-all text-sm text-white/85 transition-colors hover:text-[#69D84F]">
                  info@freshstockxchange.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <img src={clockIcon} alt="" aria-hidden className="mt-0.5 h-4 w-4 shrink-0" style={whiteFilter} />
                <span className="text-sm leading-relaxed text-white/85">
                  Mon – Sun: 6:00 AM – 9:00 PM
                </span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="footer-location-heading" className="col-span-2 flex min-w-0 flex-col sm:col-span-1">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 id="footer-location-heading" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#69D84F]">
                Find us
              </h3>
              <span className="text-xs text-white/60">Airoli · Navi Mumbai</span>
            </div>
            <LazyMap />
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/15 pt-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-white/65 sm:text-sm">
            © {new Date().getFullYear()} Fresh Stock Xchange. All rights reserved.
          </p>
          <p className="text-xs text-white/65 sm:text-sm">
            Designed and Developed by{" "}
            <a
              href="https://www.airavatatechnologies.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-white transition-colors hover:text-[#69D84F]"
            >
              AIRAVATA TECHNOLOGIES
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
