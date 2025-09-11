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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Google } from "@/components/icons";
import { Mail, Eye, EyeOff, AtSign } from "lucide-react";

import { useForm } from "@tanstack/react-form";
import {
  customerSignUp,
  customerGoogleAuth,
} from "@/lib/services/auth.service";
import type { Customer } from "@/lib/types/auth";
import { customerAuthActions } from "@/lib/state/customer.state";
import { useMutation } from "@tanstack/react-query";
import { useGoogleLogin } from "@react-oauth/google";
import ErrorAlert from "@/components/error-alert";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { customerSignUpSchema } from "@/lib/validators/auth.validator";

export const Route = createFileRoute("/auth/support/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const variants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    hidden: { opacity: 0, y: 10, transition: { duration: 0.15 } },
  };

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: customerSignUpSchema,
    },
    onSubmit: async ({ value }) => {
      setServerErrors([]);
      emailSignUpMutation.mutate(value);
    },
  });

  const emailSignUpMutation = useMutation({
    mutationFn: (data: { email: string; password: string; username: string }) =>
      customerSignUp(data),
    onSuccess: (response: Customer) => {
      customerAuthActions.setCustomer(response);
      navigate({ to: "/onboarding/select-organization" });
    },
    onError: (error: Error & { errors?: string[] }) => {
      if (error.errors && Array.isArray(error.errors)) {
        setServerErrors(error.errors);
      } else {
        setServerErrors([error.message || "An unexpected error occurred"]);
      }
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: (accessToken: string) => customerGoogleAuth({ accessToken }),
    onSuccess: (response: Customer) => {
      customerAuthActions.setCustomer(response);
      navigate({ to: "/onboarding/select-organization" });
    },
    onError: (error: Error & { errors?: string[] }) => {
      if (error.errors && Array.isArray(error.errors)) {
        setServerErrors(error.errors);
      } else {
        setServerErrors([error.message || "An unexpected error occurred"]);
      }
    },
  });

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleAuthMutation.mutate(tokenResponse.access_token);
    },
    onError: () => {
      setServerErrors(["Google authentication failed"]);
    },
  });

  return (
    <main className="h-screen w-full flex justify-center items-center">
      <div
        className={`flex flex-col gap-8 transition-[margin] duration-300 md:duration-500 ease-in-out ${!isFormVisible ? "-mt-8 md:-mt-16" : ""}`}
      >
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
              Create a support account
            </CardTitle>
            <CardDescription>
              {isFormVisible
                ? "Enter your details to create your account"
                : "Choose how you want to sign up"}
            </CardDescription>
            {serverErrors.length > 0 && (
              <CardDescription className="mt-3">
                {<ErrorAlert errors={serverErrors} />}
              </CardDescription>
            )}
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
                  <div className="space-y-2">
                    <Label htmlFor={usernameId} className="sr-only">
                      Username
                    </Label>
                    <form.Field name="username">
                      {(field) => (
                        <>
                          <Input
                            id={usernameId}
                            placeholder="Username"
                            type="text"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={emailSignUpMutation.isPending}
                            endContent={<AtSign size={16} aria-hidden="true" />}
                          />
                          {!field.state.meta.isValid &&
                            field.state.meta.isTouched && (
                              <p
                                className="text-destructive text-xs ml-4"
                                role="alert"
                                aria-live="polite"
                              >
                                {field.state.meta.errors
                                  .map((error) => error!.message)
                                  .join(",")}
                              </p>
                            )}
                        </>
                      )}
                    </form.Field>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor={emailId} className="sr-only">
                      Email
                    </Label>
                    <form.Field name="email">
                      {(field) => (
                        <>
                          <Input
                            id={emailId}
                            placeholder="Email"
                            type="email"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={emailSignUpMutation.isPending}
                            endContent={<Mail size={16} aria-hidden="true" />}
                          />
                          {!field.state.meta.isValid &&
                            field.state.meta.isTouched && (
                              <p
                                className="text-destructive text-xs ml-4"
                                role="alert"
                                aria-live="polite"
                              >
                                {field.state.meta.errors
                                  .map((error) => error!.message)
                                  .join(",")}
                              </p>
                            )}
                        </>
                      )}
                    </form.Field>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor={passwordId} className="sr-only">
                      Password
                    </Label>
                    <form.Field name="password">
                      {(field) => (
                        <>
                          <Input
                            id={passwordId}
                            placeholder="Password"
                            type={isPasswordVisible ? "text" : "password"}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={emailSignUpMutation.isPending}
                            endContent={
                              <button
                                className="flex items-center justify-center hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 transition-colors outline-none focus:z-10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                onClick={() => setIsPasswordVisible((v) => !v)}
                                aria-label={
                                  isPasswordVisible
                                    ? "Hide password"
                                    : "Show password"
                                }
                                aria-pressed={isPasswordVisible}
                                aria-controls={passwordId}
                                disabled={emailSignUpMutation.isPending}
                              >
                                {isPasswordVisible ? (
                                  <EyeOff size={16} aria-hidden="true" />
                                ) : (
                                  <Eye size={16} aria-hidden="true" />
                                )}
                              </button>
                            }
                          />
                          {!field.state.meta.isValid &&
                            field.state.meta.isTouched && (
                              <p
                                className="text-destructive text-xs ml-4"
                                role="alert"
                                aria-live="polite"
                              >
                                {field.state.meta.errors
                                  .map((error) => error!.message)
                                  .join(",")}
                              </p>
                            )}
                        </>
                      )}
                    </form.Field>
                  </div>

                  <Button
                    className="w-full"
                    type="button"
                    disabled={
                      emailSignUpMutation.isPending || !form.state.canSubmit
                    }
                    onClick={() => {
                      form.handleSubmit();
                    }}
                  >
                    {emailSignUpMutation.isPending ? (
                      <span>
                        Creating account <Spinner variant="ellipsis" />
                      </span>
                    ) : (
                      "Create account"
                    )}
                  </Button>

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
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => googleLogin()}
                      disabled={googleAuthMutation.isPending}
                    >
                      <Google />
                      {googleAuthMutation.isPending
                        ? "Signing up..."
                        : "Continue with Google"}
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
                <Link to="/auth/support/signin" className="underline">
                  Sign in
                </Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
