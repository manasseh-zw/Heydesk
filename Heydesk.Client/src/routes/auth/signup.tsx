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
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Google } from "@/components/icons";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const variants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    hidden: { opacity: 0, y: 10, transition: { duration: 0.15 } },
  };

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
            <CardTitle className="text-2xl font-light">
              Create an account
            </CardTitle>
            <CardDescription>
              {isFormVisible
                ? "Enter your details to create your account"
                : "Choose how you want to sign up"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait" initial={false}>
              {isFormVisible ? (
                <motion.div
                  key="email-form"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={variants}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm ml-0.5" htmlFor="username-create-account">Username</Label>
                    <Input id="username-create-account" type="text" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm ml-0.5" htmlFor="email-create-account">Email</Label>
                    <Input
                      id="email-create-account"
                      type="email"
                      placeholder="m@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm ml-0.5" htmlFor="password-create-account">Password</Label>
                    <Input id="password-create-account" type="password" />
                  </div>

                  <Button className="w-full">Create account</Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card text-muted-foreground px-2">
                        Or
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setIsFormVisible(false)}
                  >
                    Other sign up options
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="options"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={variants}
                  className="flex flex-col gap-4"
                >
                  <Button
                    className="w-full"
                    onClick={() => setIsFormVisible(true)}
                  >
                    <Mail />
                    Continue with Email
                  </Button>
                  <div className="flex w-full">
                    <Button className="w-full" variant="outline">
                      <Google />
                      Continue with Google
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter>
            {!isFormVisible && (
              <p className="text-center text-sm w-full">
                Already have an account?{" "}
                <Link to="/auth/signin" className="underline">Sign in</Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
