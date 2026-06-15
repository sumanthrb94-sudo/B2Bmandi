import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a date as e.g. "15 Jun 2026". */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** URL-friendly slug from a string. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate a human-friendly order number like ORD-20260615-AB12CD. */
export function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${ymd}-${rand}`;
}

/** Human label + tailwind classes for an order status badge. */
export const ORDER_STATUS_META: Record<
  string,
  { label: string; classes: string }
> = {
  PENDING: { label: "Pending", classes: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Confirmed", classes: "bg-blue-100 text-blue-800" },
  PACKED: { label: "Packed", classes: "bg-indigo-100 text-indigo-800" },
  SHIPPED: { label: "Shipped", classes: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Delivered", classes: "bg-brand-100 text-brand-800" },
  CANCELLED: { label: "Cancelled", classes: "bg-red-100 text-red-700" },
};
