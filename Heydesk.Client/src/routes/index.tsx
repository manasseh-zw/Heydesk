import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
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
