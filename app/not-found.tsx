import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <SearchX className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-gray-900">Page not found</h2>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white active:scale-95"
      >
        Back to shop
      </Link>
    </div>
  );
}
