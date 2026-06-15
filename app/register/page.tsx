import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account — FreshKart",
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const defaultRole = searchParams.role === "seller" ? "SELLER" : "BUYER";

  return (
    <div className="px-5 py-7">
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">
        Fresh produce, farm-direct — in just a minute.
      </p>

      <div className="mt-6">
        <RegisterForm defaultRole={defaultRole} />
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
