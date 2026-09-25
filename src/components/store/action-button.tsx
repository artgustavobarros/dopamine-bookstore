import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Button> & {
  tone?: "yellow" | "surface" | "ink";
};

export function ActionButton({ className, tone = "yellow", ...props }: Props) {
  const tones = {
    ink: "bg-ink text-paper hover:bg-ink/80",
    surface: "bg-surface text-ink hover:bg-yellow hover:text-[#141210]",
    yellow: "bg-yellow text-[#141210] hover:bg-yellow/80",
  };
  return (
    <Button
      className={cn(
        "h-auto min-h-11 rounded-none border-[3px] border-line px-5 py-2.5 font-bold shadow-[4px_4px_0_var(--line)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        tones[tone],
        className
      )}
      variant="ghost"
      {...props}
    />
  );
}
