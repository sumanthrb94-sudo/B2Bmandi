import { Sprout } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-500 px-4 py-3 text-white">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Sprout className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-tight">FreshKart</p>
          <p className="text-[10px] text-white/80">Wholesale B2B orders</p>
        </div>
      </div>
      <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
        Fruits &amp; Veggies
      </span>
    </header>
  );
}
