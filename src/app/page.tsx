import { redirect } from "next/navigation";

export default function HomePage() {
  // `proxy.ts` decides whether this becomes /dashboard or /signin.
  redirect("/signin");
}
