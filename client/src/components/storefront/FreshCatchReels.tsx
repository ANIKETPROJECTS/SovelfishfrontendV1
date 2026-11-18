import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReelItem = {
  id: string;
  title: string;
  videoUrl: string;
  posterUrl?: string;
};

export function FreshCatchReels() {
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);
  const {
    data: reels = [],
    isError,
    isLoading,
  } = useQuery<ReelItem[]>({
    queryKey: ["/api/banner-videos"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!activeReel) return;
    const latestReel = reels.find((reel) => reel.id === activeReel.id);
    if (!latestReel) {
      setActiveReel(null);
      return;
    }
    if (latestReel.videoUrl !== activeReel.videoUrl || latestReel.posterUrl !== activeReel.posterUrl) {
      setActiveReel(latestReel);
    }
  }, [activeReel, reels]);

  if (isLoading || (!isError && reels.length === 0)) return null;

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

      {isError ? (
        <p className="rounded-xl border border-[#7B3A14]/20 bg-white/70 px-4 py-6 text-center text-sm font-medium text-[#7B3A14]">
          Fresh catch videos are temporarily unavailable.
        </p>
      ) : (
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {reels.map((reel) => (
            <button
              key={reel.id}
              type="button"
              onClick={() => setActiveReel(reel)}
              aria-label={`Play ${reel.title} video`}
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
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.02em] drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] sm:text-base">
                  {reel.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      )}

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
              {activeReel?.title ?? "Fresh Catch"}
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
