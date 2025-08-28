import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { Logo } from "../logo";
import { Container } from "../container";
export function Header() {
  return (
    <header className="py-10">
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link to="/" className="flex flex-row gap-2 align-bottom" aria-label="Home">
              <Logo className="h-9 w-auto" />
              <span className="text-2xl font-light">Hey<span className="text-lime-500 font-light">desk</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            <Button>
              <span>
                Get started <span className="hidden lg:inline">today</span>
              </span>
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  );
}
