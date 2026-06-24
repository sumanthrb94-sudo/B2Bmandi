import { redirect } from "next/navigation";

// Registration is now handled by the FreshCart onboarding flow on /login.
export default function RegisterPage() {
  redirect("/login");
}
