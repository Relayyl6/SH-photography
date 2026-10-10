import { redirect } from "next/navigation";

// client_spec.md A4: "/pricing" is an alias so the client's named "pricing"
// section exists, pointed at the packages block on /services.
export default function PricingPage() {
  redirect("/services#packages");
}
