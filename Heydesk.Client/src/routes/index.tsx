import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { getCurrentUser } from "@/lib/services/auth.service";
import { authActions } from "@/lib/state/auth.state";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const user = await getCurrentUser();
      authActions.setUser(user);
    } catch (error) {
      authActions.clearUser();
    }
  },
  component: App,
});

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
    </>
  );
}
