import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

import { ORDER_STATUS_META } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = ORDER_STATUS_META[status] ?? {
    label: status,
    classes: "bg-gray-100 text-gray-700",
  };
  return <Badge className={meta.classes}>{meta.label}</Badge>;
}
