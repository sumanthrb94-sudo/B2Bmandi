import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-300 shadow-sm",
  secondary:
    "bg-accent-500 text-fresh-ink2 hover:bg-accent-600 focus-visible:ring-accent-300 shadow-sm",
  outline:
    "border border-fresh-border bg-white text-fresh-ink hover:bg-fresh-field focus-visible:ring-brand-100",
  ghost: "text-fresh-muted hover:bg-fresh-field focus-visible:ring-brand-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
