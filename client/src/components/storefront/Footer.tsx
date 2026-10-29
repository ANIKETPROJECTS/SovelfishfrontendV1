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
    <footer className="bg-[#364F9F] text-white mt-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.85fr_0.85fr_1.15fr_1.4fr] gap-x-5 gap-y-8 mb-8">

          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="inline-flex rounded-md bg-white p-2 mb-4">
              <FreshStockXchangeLogo className="h-auto w-full max-w-[320px]" />
            </div>
            <p className="text-white text-sm leading-relaxed">
              Fresh fish, seafood & meat, cleaned, packed, and delivered straight to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Shop Fish", href: "/category/Fish" },
                { label: "Shop Prawns", href: "/category/Prawns" },
                { label: "Shop Chicken", href: "/category/Chicken" },
                { label: "Shop Mutton", href: "/category/Mutton" },
                { label: "Combo Deals", href: "/combos" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white text-sm hover:opacity-75 transition-opacity">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-widest mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "My Orders", to: "/profile" },
                { label: "My Profile", to: "/profile" },
                { label: "Terms & Conditions", to: "/terms" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Refund Policy", to: "/refund-policy" },
                { label: "FAQ", to: "/faq" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link href={to} className="text-white text-sm hover:opacity-75 transition-opacity">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-widest mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <img src={phoneIcon} alt="" aria-hidden className="w-4 h-4 shrink-0" style={whiteFilter} />
                <a href="tel:+919619590694" className="text-white text-sm hover:opacity-75 transition-opacity">
                  +91 9619590694
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin aria-hidden className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-white text-sm leading-snug">
                  RH 18, Sairaj Society, Plot 22, Sector 6, Airoli, Navi Mumbai, Maharashtra 400708
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <img src={mailIcon} alt="" aria-hidden className="w-4 h-4 shrink-0" style={whiteFilter} />
                <a href="mailto:info@freshstockxchange.com" className="text-white text-sm hover:opacity-75 transition-opacity">
                  info@freshstockxchange.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <img src={clockIcon} alt="" aria-hidden className="w-4 h-4 shrink-0 mt-0.5" style={whiteFilter} />
                <span className="text-white text-sm leading-snug">
                  Mon – Sun: 6:00 AM – 9:00 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Map Column — lazy loaded */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-white text-sm uppercase tracking-widest mb-4 opacity-0 select-none hidden lg:block">
              Map
            </h4>
            <LazyMap />
          </div>

        </div>

        {/* Divider + bottom bar */}
        <div className="border-t border-white/20 pt-5 flex flex-col sm:grid sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-0">
          <p className="text-white text-sm text-center sm:text-left order-2 sm:order-1">
            © {new Date().getFullYear()} Fresh Stock Xchange. All rights reserved.
          </p>
          <p className="text-white text-sm font-normal text-center order-1 sm:order-2">
            Designed and Developed by{" "}
            <a
              href="https://www.airavatatechnologies.com/"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:opacity-75 transition-opacity font-medium"
              style={{ textDecoration: "none" }}
            >
              AIRAVATA TECHNOLOGIES
            </a>
          </p>
          <div className="hidden sm:block order-3" />
        </div>

      </div>
    </footer>
  );
}
