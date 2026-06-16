// Legacy seller route — kept only as a redirect to the unified app.
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/");
}
