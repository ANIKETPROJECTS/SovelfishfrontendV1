import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReelItem = {
  id: string;
  name: string;
  videoUrl: string;
  posterUrl: string;
};

const REELS: ReelItem[] = [
  {
    id: "super-size-pomfret",
    name: "Super Size Pomfret",
    videoUrl: "/reels/fresh-catch-1.mp4",
    posterUrl: "/reels/fresh-catch-1.jpg",
  },
  {
    id: "jumbo-crabs-offer",
    name: "Jumbo Crabs Offer",
    videoUrl: "/reels/fresh-catch-2.mp4",
    posterUrl: "/reels/fresh-catch-2.jpg",
  },
  {
    id: "sunday-special",
    name: "Sunday Special",
    videoUrl: "/reels/fresh-catch-3.mp4",
    posterUrl: "/reels/fresh-catch-3.jpg",
  },
  {
    id: "fresh-catch-offer",
    name: "Fresh Catch Offer",
    videoUrl: "/reels/fresh-catch-4.mp4",
    posterUrl: "/reels/fresh-catch-4.jpg",
  },
];

export function FreshCatchReels() {
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);

  return (
    <section
      aria-labelledby="fresh-catch-reels-title"
      className="relative mb-5 font-sans"
    >
      <h2
        id="fresh-catch-reels-title"
        className="mb-5 text-center font-display text-2xl font-bold tracking-[-0.03em] text-[#7B3A14] sm:mb-6 sm:text-3xl"
      >
        Today&apos;s Fresh Catch from FSX
      </h2>

      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {REELS.map((reel) => (
          <button
            key={reel.id}
            type="button"
            onClick={() => setActiveReel(reel)}
            aria-label={`Play ${reel.name} video`}
            className="group relative aspect-[9/16] min-w-0 overflow-hidden rounded-2xl border-2 border-[#7B3A14] bg-[#d8c1a8] text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a55e32] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <video
              src={reel.videoUrl}
              poster={reel.posterUrl}
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />

            <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
              {reel.name && (
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.02em] drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] sm:text-base">
                  {reel.name}
                </h3>
              )}
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
              {activeReel?.name ?? "Fresh Catch"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#795f4d]">
              Watch this Fresh Stock Xchange reel.
            </DialogDescription>
          </DialogHeader>

          <div className="mx-auto flex w-full max-w-[360px] justify-center overflow-hidden rounded-[1.25rem] bg-black shadow-[0_14px_30px_-18px_rgba(68,41,25,0.5)]">
            {activeReel && (
              <video
                key={activeReel.id}
                src={activeReel.videoUrl}
                poster={activeReel.posterUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="aspect-[9/16] h-[65dvh] max-h-[640px] w-auto max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default FreshCatchReels;
