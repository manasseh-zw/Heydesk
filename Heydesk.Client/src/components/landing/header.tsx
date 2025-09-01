import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { Logo } from "../logo";
import { Container } from "../container";
import { useStore } from "@tanstack/react-store";
import { authState } from "@/lib/state/auth.state";
export function Header() {
  const auth = useStore(authState);

  return (
    <header className="py-10">
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link
              to="/"
              className="flex flex-row gap-2 align-bottom"
              aria-label="Home"
            >
              <Logo className="h-8 w-auto md:h-10" />
              <span className="text-2xl md:text-3xl font-light">
                Hey<span className="text-lime-500 font-light">desk</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            <Button
              className="h-9 px-5 py-2.5 rounded-md text-sm md:h-12 md:px-8 md:py-4 md:rounded-full sm:text-base"
              asChild
            >
              {auth.isAuthenticated ? (
                <Link to="/$org" params={{ org: "pirollc" }}>
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link to="/auth/signup">
                  <span>Get started</span>
                </Link>
              )}
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  );
}
