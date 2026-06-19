import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BUSINESS_TYPES, DELIVERY_AREAS } from "@/lib/otp";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome to FreshKart",
  description: "Sign up in under a minute to order wholesale fruits & vegetables.",
};

export default async function OnboardingPage() {
  // Already signed in? Skip onboarding.
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin" : "/");

  return (
    <OnboardingFlow
      businessTypes={[...BUSINESS_TYPES]}
      areas={DELIVERY_AREAS.map((a) => ({ id: a.id, label: a.label, city: a.city }))}
    />
  );
}
