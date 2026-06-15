import { redirect } from "next/navigation";

// Login is disabled for now — the app is a login-free unified B2B order screen.
export default function LoginPage() {
  redirect("/");
}
