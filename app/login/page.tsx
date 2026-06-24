import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { OnboardingFlow } from "@/components/auth/OnboardingFlow";

export const metadata: Metadata = {
  title: "Welcome to FreshCart",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Already logged-in users skip the onboarding entirely.
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin" : "/");

  return <OnboardingFlow />;
}
