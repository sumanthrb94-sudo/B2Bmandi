import type { Metadata } from "next";
import Link from "next/link";
import { Sprout, CheckCircle2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — B2B Mandi",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; registered?: string };
}) {
  const callbackUrl = searchParams.callbackUrl;
  const registered = searchParams.registered === "1";

  return (
    <div className="container-app flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              B2B<span className="text-brand-600">Mandi</span>
            </span>
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Log in to order wholesale produce, farm-direct.
          </p>
        </div>

        {registered && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Account created! Please log in to continue.
          </div>
        )}

        <Card>
          <CardBody className="p-6 sm:p-8">
            <LoginForm callbackUrl={callbackUrl} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
