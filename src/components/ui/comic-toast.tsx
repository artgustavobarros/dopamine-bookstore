import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface ComicToastAction {
  label: string;
  onClick: () => void;
}

export interface ComicToastProps {
  id: string | number;
  isAlert?: boolean;
  message: string;
  onClose?: () => void;
  sfx: string;
}

// Active toast IDs for Esc dismiss
const activeToastIds: Array<string | number> = [];

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeToastIds.length > 0) {
      const topId = activeToastIds[activeToastIds.length - 1];
      if (topId !== undefined) {
        toast.dismiss(topId);
      }
    }
  });
}

function normalizeSfxForSpeech(sfx: string): string {
  // Normalize repeated screeching/screaming letters for screen readers (e.g., "BIIIP" -> "BIP")
  return sfx.replace(/(.)\1{2,}/g, "$1").replace(/[!?]+$/, "");
}

export function ComicToast({
  id,
  sfx,
  message,
  isAlert = false,
  onClose,
}: ComicToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    activeToastIds.push(id);
    return () => {
      const idx = activeToastIds.indexOf(id);
      if (idx !== -1) {
        activeToastIds.splice(idx, 1);
      }
    };
  }, [id]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
      toast.dismiss(id);
    }, 200);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Detect horizontal swipe-right
    if (deltaX > 70 && Math.abs(deltaY) < 50) {
      touchStartX.current = null;
      touchStartY.current = null;
      handleDismiss();
    }
  };

  const onTouchEnd = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const normalizedAria = normalizeSfxForSpeech(sfx);

  return (
    <div
      aria-atomic="true"
      aria-live={isAlert ? "assertive" : "polite"}
      className={`relative flex w-full max-w-[min(380px,calc(100vw-40px))] flex-col gap-1.5 rounded-[16px] border-[3px] border-line bg-card p-[14px_16px_16px] text-ink shadow-[6px_6px_0_var(--line)] transition-transform duration-200 [transform-origin:85%_110%] ${
        isExiting ? "animate-del-toast-exit" : "animate-del-pop"
      }`}
      data-comic-toast
      data-content
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      role={isAlert ? "alert" : "status"}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          aria-label={normalizedAria}
          className="inline-block animate-del-shake select-none font-accent text-2xl text-red uppercase leading-none tracking-[0.05em]"
        >
          {sfx}
        </span>
        <button
          aria-label="Fechar"
          className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center p-0 font-bold text-ink text-xl leading-none transition-transform duration-150 ease-out hover:scale-125 hover:text-red active:scale-95"
          onClick={handleDismiss}
          type="button"
        >
          ×
        </button>
      </div>

      <p className="m-0 text-pretty font-body font-semibold text-[16px] text-ink leading-[1.35]">
        {message}
      </p>

      {/* Speech bubble tail/beak at bottom right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[36px] -bottom-[12px] h-5 w-5 border-line border-r-[3px] border-b-[3px] bg-card"
        style={{ transform: "rotate(45deg) skew(12deg, 12deg)" }}
      />
    </div>
  );
}
