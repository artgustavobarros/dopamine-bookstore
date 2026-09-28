import { toast } from "sonner";
import { ComicToast } from "@/components/ui/comic-toast";
import type { EvaluatedRoast } from "./roasts";

export { ComicToast } from "@/components/ui/comic-toast";

export interface ComicToastOptions {
  duration?: number;
  isAlert?: boolean;
  message: string;
  onClose?: () => void;
  sfx: string;
}

export function calculateToastDuration(
  message: string,
  baseSeconds = 6
): number {
  const extraChars = Math.max(0, message.length - 80);
  const extraMs = extraChars * 40;
  return Math.min(12_000, baseSeconds * 1000 + extraMs);
}

export function showComicToast({
  sfx,
  message,
  isAlert = false,
  duration,
  onClose,
}: ComicToastOptions) {
  const finalDuration = duration ?? calculateToastDuration(message);

  return toast.custom(
    (t) => (
      <ComicToast
        id={t}
        isAlert={isAlert}
        message={message}
        onClose={onClose}
        sfx={sfx}
      />
    ),
    {
      className: "comic-toast-wrapper",
      duration: finalDuration,
    }
  );
}

export function showRoastToast(
  roast: { roast: string; tag: string } | EvaluatedRoast,
  _actionCallback?: () => void
) {
  if ("ruleId" in roast) {
    const isP1Error =
      roast.priority === 1 &&
      (roast.event === "card-declined" || roast.event === "pix-expired");

    return showComicToast({
      duration: calculateToastDuration(roast.msg),
      isAlert: isP1Error,
      message: roast.msg,
      sfx: roast.sfx,
    });
  }

  // Fallback for simple payload
  return showComicToast({
    duration: calculateToastDuration(roast.roast),
    message: roast.roast,
    sfx: roast.tag || "OPA!",
  });
}
