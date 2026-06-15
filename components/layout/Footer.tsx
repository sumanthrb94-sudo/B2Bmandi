import Link from "next/link";
import { Sprout } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container-app py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
                <Sprout className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold text-gray-900">
                B2B<span className="text-brand-600">Mandi</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-gray-500">
              Wholesale fresh produce supply chain — connecting farms to
              businesses, minus the middlemen.
            </p>
          </div>

          <FooterCol
            title="Marketplace"
            links={[
              { label: "Browse products", href: "/products" },
              { label: "Vegetables", href: "/products?category=vegetables" },
              { label: "Fruits", href: "/products?category=fruits" },
              { label: "Staples & Grains", href: "/products?category=staples" },
            ]}
          />
          <FooterCol
            title="For Business"
            links={[
              { label: "Sell on B2B Mandi", href: "/register?role=seller" },
              { label: "Seller Hub", href: "/seller" },
              { label: "My Orders", href: "/orders" },
              { label: "My Account", href: "/account" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "/" },
              { label: "How it works", href: "/" },
              { label: "Contact", href: "/" },
              { label: "Help", href: "/" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} B2B Mandi. All rights reserved.</p>
          <p>Built for wholesale buyers &amp; sellers across India.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-gray-500 transition-colors hover:text-brand-600"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
