import { useState } from "react";
import { Fish, Play } from "lucide-react";
import type { Product } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FreshCatchReelsProps = {
  products: Product[];
};

type ReelItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  caption: string;
  placeholder: boolean;
};

const PLACEHOLDERS = [
  { name: "From the morning boats", caption: "A closer look at today's catch" },
  { name: "At the fish market", caption: "Fresh picks, ready for your table" },
  { name: "Cleaned with care", caption: "See how your order is prepared" },
  { name: "The day's best", caption: "Good seafood starts right here" },
];

const POSTER_TONES = [
  "from-[#6f3b21] via-[#bd7040] to-[#e4ad72]",
  "from-[#315e5b] via-[#6f9b88] to-[#d4c89d]",
  "from-[#8b5638] via-[#cb8e5c] to-[#e7c69a]",
  "from-[#31515c] via-[#688f91] to-[#c3c8a7]",
];

function makeReelItems(products: Product[]): ReelItem[] {
  const seafoodProducts = products.filter((product) =>
    /fish|seafood|prawn|shrimp/i.test(product.category || ""),
  );
  return Array.from({ length: 4 }, (_, index) => {
    const product = seafoodProducts[index] ?? products[index];
    const placeholder = PLACEHOLDERS[index];

    return product
      ? {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          caption: "Fresh from the market",
          placeholder: false,
        }
      : {
          id: `placeholder-${index}`,
          name: placeholder.name,
          imageUrl: null,
          caption: placeholder.caption,
          placeholder: true,
        };
  });
}

export function FreshCatchReels({ products }: FreshCatchReelsProps) {
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);
  const reels = makeReelItems(products);

  return (
    <section
      aria-labelledby="fresh-catch-reels-title"
      className="relative mb-8 font-sans"
    >
      <h2
        id="fresh-catch-reels-title"
        className="mb-5 text-center font-display text-2xl font-bold tracking-[-0.03em] text-[#4f3021] sm:mb-6 sm:text-3xl"
      >
        Today&apos;s Fresh Catch from FSX
      </h2>

      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {reels.map((reel, index) => (
          <button
            key={reel.id}
            type="button"
            onClick={() => setActiveReel(reel)}
            aria-label={`Open reel preview for ${reel.name}`}
          className="group relative aspect-[9/16] min-w-0 overflow-hidden bg-[#d8c1a8] text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a55e32] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            {reel.imageUrl ? (
              <img
                src={reel.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${POSTER_TONES[index]}`}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-3 rounded-[0.9rem] border border-white/25"
                />
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/45 bg-white/15 text-white/90 backdrop-blur-[2px]">
                  <Fish aria-hidden="true" className="h-9 w-9 stroke-[1.25]" />
                </div>
                <span className="absolute right-5 top-7 h-2 w-2 rounded-full bg-[#f4d7a8]/80" />
                <span className="absolute bottom-16 left-6 h-1.5 w-1.5 rounded-full bg-white/70" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#24170f]/85 via-[#24170f]/10 to-[#24170f]/10" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/30 bg-[#2e241c]/35 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-white backdrop-blur-sm sm:left-4 sm:top-4 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f1bd7b]" />
              {reel.placeholder ? "Coming soon" : "Market reel"}
            </div>

            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/20 text-white shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12"
            >
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            </span>

            <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
              <p className="mb-1 line-clamp-1 text-[10px] font-medium tracking-wide text-white/80 sm:text-[11px]">
                {reel.caption}
              </p>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.02em] sm:text-base">
                {reel.name}
              </h3>
              <span className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/90 sm:text-[11px]">
                Open preview
                <Play aria-hidden="true" className="h-3 w-3 fill-current" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog
        open={activeReel !== null}
        onOpenChange={(open) => {
          if (!open) setActiveReel(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-[1.5rem] border-[#ead9c7] bg-[#fffaf4] p-5 text-[#4f3021] sm:max-w-xl sm:p-7">
          <DialogHeader className="pr-8 text-left">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a16037]">
              Fresh Stock Xchange
            </p>
            <DialogTitle className="text-xl font-semibold tracking-[-0.04em] text-[#4f3021] sm:text-2xl">
              {activeReel?.name ?? "Market preview"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#795f4d]">
              This is a poster preview, not a playable video. The actual reel will be connected from the admin later.
            </DialogDescription>
          </DialogHeader>

          <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-[1.25rem] bg-[#ead9c7] shadow-[0_14px_30px_-18px_rgba(68,41,25,0.5)]">
            <div className="relative aspect-[9/14]">
              {activeReel?.imageUrl ? (
                <img
                  src={activeReel.imageUrl}
                  alt={`Poster preview for ${activeReel.name}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${POSTER_TONES[reels.findIndex((reel) => reel.id === activeReel?.id) % POSTER_TONES.length]}`}
                >
                  <Fish aria-hidden="true" className="h-16 w-16 stroke-[1.1] text-white/90" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#24170f]/65 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] font-medium tracking-wide text-white/80">
                  {activeReel?.caption}
                </p>
                <p className="mt-1 text-lg font-semibold leading-tight">{activeReel?.name}</p>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-[#8a715e]">
            Video content will appear here once added by the Fresh Stock Xchange team.
          </p>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default FreshCatchReels;
