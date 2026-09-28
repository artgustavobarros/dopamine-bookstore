import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useRef } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { gsap, useGSAP, withMotion } from "@/lib/motion";

function animateAddedToasts(
  node: HTMLElement,
  animateToast: (toast: HTMLElement) => void
) {
  const toast = node.matches("[data-sonner-toast]")
    ? node
    : node.closest<HTMLElement>("[data-sonner-toast]");
  if (toast) {
    animateToast(toast);
  }
  node
    .querySelectorAll<HTMLElement>("[data-sonner-toast]")
    .forEach(animateToast);
}

const Toaster = ({ theme = "system", ...props }: ToasterProps) => {
  const host = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) =>
      withMotion(() => {
        if (!(contextSafe && host.current?.isConnected)) {
          return;
        }
        const seen = new WeakSet<Element>();
        const animateToast = contextSafe((toast: HTMLElement) => {
          const content = toast.querySelector<HTMLElement>("[data-content]");
          if (!content || seen.has(content)) {
            return;
          }
          seen.add(content);
          content.dataset.motionPlayed = "true";
          gsap.fromTo(
            content,
            {
              autoAlpha: 0,
              rotation: -4,
              scale: 0.6,
              transformOrigin: "85% 110%",
            },
            {
              autoAlpha: 1,
              clearProps: "opacity,visibility,transform,transformOrigin",
              duration: 0.4,
              ease: "back.out(1.8)",
              rotation: 0,
              scale: 1,
            }
          );
        });
        const observer = new MutationObserver((records) => {
          for (const record of records) {
            for (const node of record.addedNodes) {
              if (!(node instanceof HTMLElement)) {
                continue;
              }
              animateAddedToasts(node, animateToast);
            }
          }
        });
        observer.observe(host.current, { childList: true, subtree: true });
        return () => observer.disconnect();
      }),
    { scope: host }
  );

  return (
    <div ref={host}>
      <Sonner
        className="toaster group"
        gap={20}
        icons={{
          error: <OctagonXIcon className="size-4" />,
          info: <InfoIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
          success: <CircleCheckIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
        }}
        position="bottom-right"
        style={
          {
            "--border-radius": "18px",
            "--normal-bg": "transparent",
            "--normal-border": "transparent",
            "--normal-text": "var(--ink)",
          } as React.CSSProperties
        }
        theme={theme as ToasterProps["theme"]}
        toastOptions={{
          classNames: {
            toast: "cn-toast",
          },
        }}
        visibleToasts={3}
        {...props}
      />
    </div>
  );
};

export { Toaster };
