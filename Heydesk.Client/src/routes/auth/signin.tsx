import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Google } from "@/components/icons";

export const Route = createFileRoute("/auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="h-screen w-full flex justify-center items-center">
      <div className="flex flex-col gap-8">
        <div className="flex gap-1 justify-center">
          <Link to="/" className="flex gap-1 items-center" aria-label="Home">
            <Logo className="h-8 w-auto" />
            <span className="text-2xl font-light tracking-wider">
              Hey<span className="text-lime-500 font-base">desk</span>
            </span>
          </Link>
        </div>

        <Card className="min-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-light">Sign in</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm ml-0.5" htmlFor="email-sign-in">Email</Label>
              <Input id="email-sign-in" type="email" placeholder="m@example.com" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm ml-0.5" htmlFor="password-sign-in">Password</Label>
              <Input id="password-sign-in" type="password" />
            </div>

            <Button className="w-full">Sign in</Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">Or</span>
              </div>
            </div>

            <div className="flex w-full">
              <Button className="w-full" variant="outline">
                <Google />
                Continue with Google
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-center text-sm w-full">
              Don't have an account? <Link to="/auth/signup" className="underline">Sign up</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
