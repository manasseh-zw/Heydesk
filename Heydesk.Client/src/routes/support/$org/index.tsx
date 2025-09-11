import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { getCurrentCustomer } from "@/lib/services/auth.service";
import { customerAuthActions } from "@/lib/state/customer.state";
import { storage, STORAGE_KEYS } from "@/lib/utils/storage";
import { PromptLanding } from "@/components/support/prompt-landing";

export const Route = createFileRoute("/support/$org/")({
  loader: async ({ params }) => {
    const orgSlug = params.org;

    // Persist attempted org for post-auth selection
    storage.set(STORAGE_KEYS.PENDING_SUPPORT_ORG_SLUG, orgSlug);

    // Check customer auth
    try {
      const customer = await getCurrentCustomer();
      console.log("customer", customer);
      customerAuthActions.setCustomer(customer);
      if (!customer.organizations || customer.organizations.length === 0) {
        console.log("no organizations");
        throw redirect({ to: "/onboarding/select-organization" });
      }
      return null;
    } catch (err) {
      if (isRedirect(err)) throw err;
      customerAuthActions.clearCustomer();
      throw redirect({ to: "/auth/support/signup" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <PromptLanding />
    </main>
  );
}
