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
import { Mail, Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

export const Route = createFileRoute("/auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const emailId = useId();
  const passwordId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
            <div className="relative">
              <Label htmlFor={emailId} className="sr-only">Email</Label>
              <Input id={emailId} className="peer pe-9" placeholder="Email" type="email" />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                <Mail size={16} aria-hidden="true" />
              </div>
            </div>
            <div className="relative">
              <Label htmlFor={passwordId} className="sr-only">Password</Label>
              <Input
                id={passwordId}
                className="pe-9"
                placeholder="Password"
                type={isPasswordVisible ? "text" : "password"}
              />
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => setIsPasswordVisible((v) => !v)}
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                aria-pressed={isPasswordVisible}
                aria-controls={passwordId}
              >
                {isPasswordVisible ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
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
