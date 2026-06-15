"use client";

import * as React from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * next/image with a graceful fallback: if the remote image fails to load
 * (e.g. a stale CDN URL in production), render a branded placeholder instead
 * of a broken-image icon.
 */
export function SafeImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
}: SafeImageProps) {
  const [errored, setErrored] = React.useState(false);

  if (errored) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-brand-50",
          fill && "absolute inset-0",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <Leaf className="h-1/4 w-1/4 max-h-10 max-w-10 text-brand-300" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
