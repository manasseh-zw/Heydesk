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
import { useId, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Google } from "@/components/icons";
import { Mail, Eye, EyeOff, AtSign } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const variants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    hidden: { opacity: 0, y: 10, transition: { duration: 0.15 } },
  };

  return (
    <main className="h-screen w-full flex justify-center items-center">
      <div className={`flex flex-col gap-8 transition-[margin] duration-300 md:duration-500 ease-in-out ${!isFormVisible ? "-mt-8 md:-mt-16" : ""}`}>
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
                  {/* Username */}
                  <div className="relative">
                    <Label htmlFor={usernameId} className="sr-only">Username</Label>
                    <Input id={usernameId} placeholder="Username" className="peer pe-9" type="text" />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                      <AtSign size={16} aria-hidden="true" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Label htmlFor={emailId} className="sr-only">Email</Label>
                    <Input id={emailId} placeholder="Email" className="peer pe-9" type="email" />
                    <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                      <Mail size={16} aria-hidden="true" />
                    </div>
                  </div>

                  {/* Password */}
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
