import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type DependencyList, type RefObject, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export { useGSAP } from "@gsap/react";
export { default as gsap } from "gsap";
export { ScrollTrigger } from "gsap/ScrollTrigger";

export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const POINTER_QUERY = `${MOTION_QUERY} and (hover: hover) and (pointer: fine)`;

export function withMotion(callback: () => undefined | (() => void)) {
  const media = gsap.matchMedia();
  media.add(MOTION_QUERY, callback);
  return () => media.revert();
}

export function useRouteEntrance<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () =>
      withMotion(() => {
        if (!scope.current?.isConnected) {
          return;
        }
        gsap.fromTo(
          scope.current,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            clearProps: "opacity,visibility,transform",
            duration: 0.4,
            ease: "back.out(1.15)",
            y: 0,
          }
        );
      }),
    { scope }
  );

  return scope;
}

export function useInsertedPanelMotion(
  scope: RefObject<HTMLElement | null>,
  dependencies: DependencyList
) {
  useGSAP(
    () =>
      withMotion(() => {
        const panels = scope.current?.querySelectorAll("[data-motion-panel]");
        if (!panels?.length) {
          return;
        }
        gsap.fromTo(
          panels,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            clearProps: "opacity,visibility,transform",
            duration: 0.35,
            ease: "back.out(1.15)",
            stagger: 0.05,
            y: 0,
          }
        );
      }),
    { dependencies: [...dependencies], revertOnUpdate: true, scope }
  );
}
