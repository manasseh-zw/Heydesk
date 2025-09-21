import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { getCurrentCustomer } from "@/lib/services/auth.service";
import { customerAuthActions } from "@/lib/state/customer.state";
import { storage, STORAGE_KEYS } from "@/lib/utils/storage";
import { ChatPage } from "@/components/support/chat-page";

export const Route = createFileRoute("/support/$org/c/$chatId")({
  loader: async ({ params }) => {
    const orgSlug = params.org;
    const chatId = params.chatId;

    // Persist attempted org for post-auth selection
    storage.set(STORAGE_KEYS.PENDING_SUPPORT_ORG_SLUG, orgSlug);

    // Check customer auth
    try {
      const customer = await getCurrentCustomer();
      customerAuthActions.setCustomer(customer);
      if (!customer.organizations || customer.organizations.length === 0) {
        throw redirect({ to: "/onboarding/select-organization" });
      }

      // Set the current organization from the URL
      customerAuthActions.setCurrentOrganization(orgSlug);

      // Find the current organization to get its ID
      const currentOrganization = customer.organizations.find(
        (org) => org.slug === orgSlug
      );

      if (!currentOrganization) {
        throw redirect({ to: "/onboarding/select-organization" });
      }

      return {
        chatId,
        orgSlug,
        organizationId: currentOrganization.id,
      };
    } catch (err) {
      if (isRedirect(err)) throw err;
      customerAuthActions.clearCustomer();
      throw redirect({ to: "/auth/support/signup" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { chatId, orgSlug, organizationId } = Route.useLoaderData();

  return (
    <main className="h-screen-minus-sidebar flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col mx-auto w-full px-4">
        <ChatPage
          chatId={chatId}
          orgSlug={orgSlug}
          organizationId={organizationId}
        />
      </div>
    </main>
  );
}
