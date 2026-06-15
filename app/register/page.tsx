import { redirect } from "next/navigation";

// Registration is disabled for now — the app is a login-free unified order screen.
export default function RegisterPage() {
  redirect("/");
}
