import * as React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "brand",
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
  accent?: "brand" | "accent" | "red" | "gray";
  className?: string;
}) {
  const accentClasses: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    accent: "bg-accent-50 text-accent-600",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <Card className={className}>
      <CardBody className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          {hint && <p className="mt-0.5 text-[11px] text-gray-400">{hint}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              accentClasses[accent],
            )}
          >
            {icon}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
