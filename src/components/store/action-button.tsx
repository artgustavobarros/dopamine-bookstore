import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Button> & {
  shadowTone?: "line" | "red";
  tone?: "yellow" | "surface" | "ink" | "green" | "red";
};

export function ActionButton({
  className,
  tone = "yellow",
  shadowTone = "line",
  ...props
}: Props) {
  const tones = {
    green: "bg-green text-ink hover:text-ink hover:bg-green",
    ink: "bg-ink text-paper hover:text-paper hover:bg-ink",
    red: "bg-red text-white hover:text-white hover:bg-red",
    surface: "bg-surface text-ink hover:text-ink hover:bg-surface",
    yellow: "bg-yellow text-ink hover:text-ink hover:bg-yellow",
  };

  return (
    <Button
      className={cn(
        "!font-bold h-auto min-h-11 rounded-none border-[3px] border-line px-5 py-2.5 whitespace-normal transition-[transform,box-shadow] duration-150 ease-out",
        shadowTone === "red"
          ? "btn-auth-submit shadow-[4px_4px_0_oklch(63.7%_0.237_25.331)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_oklch(63.7%_0.237_25.331)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_oklch(63.7%_0.237_25.331)]"
          : "btn-tactile shadow-[4px_4px_0_var(--line)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--line)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        tones[tone],
        className
      )}
      variant="unstyled"
      {...props}
    />
  );
}
