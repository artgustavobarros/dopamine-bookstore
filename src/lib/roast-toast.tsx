import { toast } from "sonner";
import type { RoastPayload } from "./roast-fallbacks";

export function showRoastToast({ tag, roast }: RoastPayload) {
  toast.custom(
    (t) => (
      <div
        className="relative flex w-full max-w-md flex-col gap-2 border-[3px] border-line bg-yellow p-4 text-ink shadow-[5px_5px_0_var(--line)]"
        data-content
      >
        <div className="flex items-center justify-between gap-2">
          <span className="border border-line bg-ink px-2 py-0.5 font-accent text-sm text-yellow uppercase tracking-wider">
            {tag}
          </span>
          <button
            aria-label="Fechar"
            className="cursor-pointer font-bold font-data text-xs uppercase opacity-70 transition-opacity hover:opacity-100"
            onClick={() => toast.dismiss(t)}
            type="button"
          >
            ✕
          </button>
        </div>
        <p className="font-body font-medium text-sm leading-snug">{roast}</p>
      </div>
    ),
    { duration: 6500 }
  );
}
