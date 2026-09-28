"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import {
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactElement,
  type Ref,
  useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP, withMotion } from "@/lib/motion";

type SheetProps = ComponentProps<typeof BaseDialog.Root>;

function Sheet({ ...props }: SheetProps) {
  return <BaseDialog.Root data-slot="sheet" {...props} />;
}

interface SheetTriggerProps
  extends Omit<ComponentProps<typeof BaseDialog.Trigger>, "render"> {
  asChild?: boolean;
}

function SheetTrigger({ asChild, children, ...props }: SheetTriggerProps) {
  if (asChild && isValidElement(children)) {
    const isButton = children.type === "button";
    const childProps = children.props as Record<string, unknown>;
    const renderElement =
      !isButton && childProps.role === undefined
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
            role: undefined,
          })
        : children;
    return (
      <BaseDialog.Trigger
        data-slot="sheet-trigger"
        nativeButton={isButton}
        render={renderElement}
        {...props}
      />
    );
  }
  return (
    <BaseDialog.Trigger data-slot="sheet-trigger" {...props}>
      {children}
    </BaseDialog.Trigger>
  );
}

interface SheetCloseProps
  extends Omit<ComponentProps<typeof BaseDialog.Close>, "render"> {
  asChild?: boolean;
}

function SheetClose({ asChild, children, ...props }: SheetCloseProps) {
  if (asChild && isValidElement(children)) {
    const isButton = children.type === "button";
    const childProps = children.props as Record<string, unknown>;
    const renderElement =
      !isButton && childProps.role === undefined
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
            role: undefined,
          })
        : children;
    return (
      <BaseDialog.Close
        data-slot="sheet-close"
        nativeButton={isButton}
        render={renderElement}
        {...props}
      />
    );
  }
  return (
    <BaseDialog.Close data-slot="sheet-close" {...props}>
      {children}
    </BaseDialog.Close>
  );
}

function SheetPortal({ ...props }: ComponentProps<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal data-slot="sheet-portal" {...props} />;
}

interface SheetOverlayProps extends ComponentProps<typeof BaseDialog.Backdrop> {
  ref?: Ref<HTMLDivElement>;
}

function SheetOverlay({ className, ref, ...props }: SheetOverlayProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const overlayRef = (ref as React.RefObject<HTMLDivElement>) || localRef;

  useGSAP(
    () =>
      withMotion(() => {
        if (overlayRef.current?.isConnected) {
          gsap.fromTo(
            overlayRef.current,
            { opacity: 0 },
            {
              clearProps: "opacity",
              duration: 0.2,
              opacity: 1,
            }
          );
        }
      }),
    { scope: overlayRef }
  );

  return (
    <BaseDialog.Backdrop
      className={cn(
        "data-closed:fade-out-0 fixed inset-0 z-50 bg-black/10 duration-200 data-closed:animate-out supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      data-slot="sheet-overlay"
      ref={overlayRef}
      {...props}
    />
  );
}

interface SheetContentProps extends ComponentProps<typeof BaseDialog.Popup> {
  ref?: Ref<HTMLDivElement>;
  showCloseButton?: boolean;
  side?: "top" | "right" | "bottom" | "left";
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ref,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <BaseDialog.Popup
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-popover-foreground text-sm shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=top]:inset-x-0 data-[side=left]:inset-y-0 data-[side=right]:inset-y-0 data-[side=top]:top-0 data-[side=right]:right-0 data-[side=bottom]:bottom-0 data-[side=left]:left-0 data-[side=bottom]:h-auto data-[side=left]:h-full data-[side=right]:h-full data-[side=top]:h-auto data-[side=left]:w-3/4 data-[side=right]:w-3/4 data-closed:animate-out data-[side=bottom]:border-t data-[side=left]:border-r data-[side=top]:border-b data-[side=right]:border-l data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        data-side={side}
        data-slot="sheet-content"
        ref={ref}
        {...props}
      >
        {children}
        {showCloseButton === true && (
          <SheetClose asChild>
            <Button
              className="absolute top-3 right-3"
              size="icon-sm"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        )}
      </BaseDialog.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-0.5 p-4", className)}
      data-slot="sheet-header"
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      data-slot="sheet-footer"
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn(
        "font-heading font-medium text-base text-foreground",
        className
      )}
      data-slot="sheet-title"
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
