import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — FreshKart",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; registered?: string };
}) {
  const callbackUrl = searchParams.callbackUrl;
  const registered = searchParams.registered === "1";

  return (
    <div className="px-5 py-7">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
      <p className="mt-1 text-sm text-gray-500">
        Log in to order fresh produce in bulk.
      </p>

      {registered && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Account created! Please log in to continue.
        </div>
      )}

      <div className="mt-6">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
