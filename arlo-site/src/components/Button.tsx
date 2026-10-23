import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-navy text-white hover:bg-navy/90",
        secondary: "border border-steel bg-white text-navy hover:bg-mist",
        ghost: "text-navy hover:bg-mist",
        onDark: "bg-white text-navy hover:bg-mist",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type Variants = VariantProps<typeof buttonVariants>;

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: Variants & { className?: string; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
}: Variants & { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
