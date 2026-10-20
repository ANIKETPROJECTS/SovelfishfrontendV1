# Fresh Stock Xchange — SEO Brief

Use this document to generate a comprehensive SEO strategy (meta titles, descriptions, structured data, keywords, content plan) for Fresh Stock Xchange.

---

## 1. Business Overview

**Brand name:** Fresh Stock Xchange
**Tagline:** Freshly cut seafood & meat, hygienically packed and delivered to your doorstep  
**Business type:** Online fresh fish, seafood & meat retailer — mobile-first e-commerce  
**Geography served:** Mumbai (current hubs include Thane); expanding to more Mumbai locations  
**USP:** Same-day delivery / instant delivery (via Porter), hygienic handling, fresh catch daily, easy app-like ordering on mobile

---

## 2. Target Audience

- Urban households in Mumbai looking for fresh fish, seafood, chicken, mutton delivered at home
- Busy working professionals who want pre-cleaned, ready-to-cook cuts
- Families who want restaurant-quality fresh produce without visiting a market
- Health-conscious buyers seeking hygienic, traceable seafood

---

## 3. Pages & Content Inventory

### 3.1 Storefront (Customer-Facing)

| Page | URL Pattern | Purpose |
|------|-------------|---------|
| Home | `/` | Landing page — pincode entry → browse products |
| Category Page | `/category/:categoryName` | Filtered product listing per category |
| Product Detail | `/product/:id` | Single product detail, add to cart, coupons |
| Combos Page | `/combos` | Bundle/combo deals listing |
| Combo Detail | `/combo/:id` | Individual combo detail |
| Profile | `/profile` | Customer account, order history |
| Add Address | `/add-address` | Delivery address management |

### 3.2 Key Sections on Homepage

- **Pincode gate:** User enters pincode → hub is selected → products load
- **Carousel banners:** Rotating promotional banners (seasonal offers, fresh catch highlights)
- **Category strip:** Fish · Prawns · Chicken · Mutton · Masalas (+ more)
- **"Today's Fresh Catch" hero section**
- **Dynamic homepage sections:** Sections like "Weekend Specials", "Best Sellers", "Combo Deals" — driven by MongoDB, fully configurable from admin
- **Combos/Bundle Deals section**

### 3.3 Admin Panel (Not indexed — no SEO needed)

- `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/categories`, `/admin/carousel`, `/admin/sections`

---

## 4. Product Categories

| Category | Notes |
|----------|-------|
| Fish | Surmai, Pomfret, Rawas, Rohu, Bangda, Bombil, Mandeli, and more |
| Prawns | Medium, large, jumbo; cleaned & deveined |
| Crab | Available whole or cleaned |
| Lobster | Premium offering |
| Chicken | Whole, curry cut, boneless, keema |
| Mutton | Curry cut, keema, chops |
| Eggs | Farm fresh |
| Masalas | Wet masalas / marinades for fish, chicken, mutton |
| Combos | Bundled deals mixing fish/seafood/meat at a discounted price |

---

## 5. Key Features to Highlight in SEO Content

- **Delivery options:**
  - *Instant Delivery* via Porter (₹49 extra) — same-hour delivery
  - *Scheduled Delivery* — Morning / Midday / Afternoon / Evening slots
- **Freshness:** Daily sourced, cleaned and packed fresh
- **Hygiene:** Hygienically packed, no market handling
- **Online payment + COD via Razorpay**
- **Coupon codes** for repeat customers and community groups
- **Combo deals** — great value bundles

---

## 6. Target Keywords (Seed List — expand these)

### Primary
- fresh fish delivery Mumbai
- seafood delivery Mumbai
- buy fish online Mumbai
- fresh chicken delivery Thane
- mutton delivery Thane

### Long-tail
- fresh fish home delivery Thane Mumbai
- buy pomfret online Mumbai
- surmai fish delivery Mumbai
- cleaned prawns delivery Mumbai
- fresh seafood delivery same day Mumbai
- online meat delivery Thane
- fresh catch delivery Mumbai
- fresh seafood delivery Mumbai

### Brand
- fresh stock xchange
- fish tokri Mumbai
- fresh stock xchange online order

---

## 7. Structured Data Opportunities

- **LocalBusiness** schema (name, address, areaServed, telephone, openingHours)
- **Product** schema for individual product pages (name, image, price, availability)
- **ItemList** schema for category pages
- **BreadcrumbList** for navigation hierarchy
- **FAQPage** for a future FAQ page about freshness, delivery, payment

---

## 8. Technical SEO Notes

- **Framework:** React SPA (Vite + Wouter) — requires server-side rendering (SSR) or prerendering for Google to index product pages; currently no SSR
- **Google Analytics:** G-M8HKCKLPFF (already added)
- **Google Search Console:** Verified via meta tag (HYxrwn3rTLy5eHGtmVYyqUitZntYb2B_90-P9s_MRC0)
- **Sitemap:** Not yet generated — should be created for all category and product URLs
- **Robots.txt:** Not yet present — `/admin/` must be disallowed
- **Meta tags:** Currently minimal — need per-page title, description, og:image, og:title, og:description
- **Images:** Products use MongoDB-stored image URLs; fallback is a branded "Image Coming Soon" placeholder
- **Mobile-first:** App is fully responsive / mobile-optimised — good for Core Web Vitals

---

## 9. Suggested SEO Content to Create

1. **Homepage meta:** Title "Fresh Stock Xchange – Fresh Fish & Seafood Delivery in Mumbai" | Description about same-day delivery, fresh daily catch
2. **Category page metas:** Unique title+description per category (Fish, Prawns, Chicken, Mutton, Masalas)
3. **Blog / content section (future):** "How to pick the freshest Pomfret", "Best fish for curry in Mumbai", "Seafood nutrition guide" — supports long-tail keywords
4. **FAQ page:** Delivery timings, pincode coverage, payment options, freshness guarantee
5. **About page:** Brand story, sourcing, hygiene practices

---

## 10. Current Gaps to Fix for SEO

| Gap | Priority |
|-----|----------|
| No per-page `<title>` or `<meta description>` — all pages share the same blank title | High |
| No `og:image`, `og:title`, `og:description` for social sharing | High |
| SPA routing not crawlable by Google without SSR or prerendering | High |
| No `sitemap.xml` | Medium |
| No `robots.txt` | Medium |
| No canonical tags | Medium |
| No structured data (JSON-LD) | Medium |
| No alt text strategy for product images | Low |
