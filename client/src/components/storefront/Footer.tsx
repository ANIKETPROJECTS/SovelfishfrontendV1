import { Link } from "wouter";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { FreshStockXchangeLogo } from "@/components/storefront/FreshStockXchangeLogo";


export function Footer() {
  return (
    <footer className="mt-8 border-t-4 border-[#69D84F] bg-[linear-gradient(118deg,#000035_0%,#071743_52%,#12432f_100%)] text-white">
      <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="inline-flex w-fit rounded-md bg-white px-2 py-1.5">
              <FreshStockXchangeLogo className="h-auto w-full max-w-[220px]" />
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-white/70">
              Fresh fish, seafood &amp; meat, delivered to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-white/80 xl:flex xl:flex-wrap xl:justify-end">
            <a href="tel:+919619590694" className="inline-flex items-center gap-1.5 hover:text-[#69D84F]">
              <Phone aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#69D84F]" />
              +91 9619590694
            </a>
            <a href="mailto:info@freshstockxchange.com" className="inline-flex min-w-0 items-center gap-1.5 hover:text-[#69D84F]">
              <Mail aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#69D84F]" />
              <span className="break-all">info@freshstockxchange.com</span>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=RH%2018%2C%20Sairaj%20Society%2C%20Plot%2022%2C%20Sector%206%2C%20Airoli%2C%20Navi%20Mumbai%2C%20Maharashtra%20400708"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 inline-flex items-start gap-1.5 hover:text-[#69D84F] xl:col-span-1"
            >
              <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#69D84F]" />
              <span>RH 18, Sairaj Society, Plot 22, Sector 6, Airoli, Navi Mumbai, Maharashtra 400708</span>
            </a>
            <span className="col-span-2 inline-flex items-center gap-1.5 xl:col-span-1">
              <Clock3 aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#69D84F]" />
              Mon – Sun: 6:00 AM – 9:00 PM
            </span>
            <a href="https://wa.me/919619590694" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#69D84F]">
              <MessageCircle aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#69D84F]" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-white/15 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-white/75">
            {[
              { label: "Home", href: "/" },
              { label: "Fish", href: "/category/Fish" },
              { label: "Prawns", href: "/category/Prawns" },
              { label: "Chicken", href: "/category/Chicken" },
              { label: "Mutton", href: "/category/Mutton" },
              { label: "Combos", href: "/combos" },
              { label: "My Orders", href: "/profile" },
              { label: "FAQ", href: "/faq" },
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "Refunds", href: "/refund-policy" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="transition-colors hover:text-[#69D84F]">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-1 border-t border-white/15 pt-3 text-[11px] text-white/60 sm:shrink-0 sm:border-0 sm:pt-0 sm:text-right">
            <span>© {new Date().getFullYear()} Fresh Stock Xchange.</span>
            <span>
              By{" "}
              <a
                href="https://www.airavatatechnologies.com/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-white/80 transition-colors hover:text-[#69D84F]"
              >
                AIRAVATA TECHNOLOGIES
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
