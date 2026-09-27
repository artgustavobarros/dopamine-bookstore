import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Button> & {
  tone?: "yellow" | "surface" | "ink" | "green" | "red";
  shadowTone?: "line" | "red";
};

export function ActionButton({
  className,
  tone = "yellow",
  shadowTone = "line",
  ...props
}: Props) {
  const tones = {
    green: "bg-green text-ink hover:bg-green/90",
    ink: "bg-ink text-paper hover:bg-ink/90",
    red: "bg-red text-white hover:bg-red/90",
    surface: "bg-surface text-ink hover:bg-yellow hover:text-ink",
    yellow: "bg-yellow text-ink hover:bg-yellow/90",
  };

  return (
    <Button
      className={cn(
        "h-auto min-h-11 rounded-none border-[3px] border-line px-5 py-2.5 font-bold transition-[transform,box-shadow,background-color,color] duration-150 ease-out",
        shadowTone === "red"
          ? "shadow-[4px_4px_0_oklch(63.7%_0.237_25.331)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_oklch(63.7%_0.237_25.331)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_oklch(63.7%_0.237_25.331)]"
          : "shadow-[4px_4px_0_var(--line)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--line)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        tones[tone],
        className
      )}
      variant="ghost"
      {...props}
    />
  );
}
