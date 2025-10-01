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
import { Google } from "@/components/icons";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useGoogleLogin } from "@react-oauth/google";
import { emailSignIn, googleAuth } from "@/lib/services/auth.service";
import type { User } from "@/lib/types/auth";
import { authActions } from "@/lib/state/auth.state";
import ErrorAlert from "@/components/error-alert";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

const getRedirectPath = (user: User): string => {
  // If onboarding is not completed, redirect to onboarding
  if (user.onboarding) {
    return "/onboarding";
  }

  // If onboarding is completed and user has an organization, redirect to org dashboard
  if (user.organization?.slug) {
    return `/${user.organization.slug}`;
  }

  // Fallback to onboarding if no organization is found
  return "/onboarding";
};

export const Route = createFileRoute("/auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      userIdentifier: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setServerErrors([]);
      emailSignInMutation.mutate(value);
    },
  });

  const emailSignInMutation = useMutation({
    mutationFn: (data: { userIdentifier: string; password: string }) =>
      emailSignIn(data),
    onSuccess: (response: User) => {
      authActions.setUser(response);
      navigate({ to: getRedirectPath(response) });
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
    mutationFn: (accessToken: string) => googleAuth({ accessToken }),
    onSuccess: (response: User) => {
      authActions.setUser(response);
      navigate({ to: getRedirectPath(response) });
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
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
            {serverErrors.length > 0 && (
              <CardDescription className="mt-3">
                <ErrorAlert errors={serverErrors} />
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              {/* Email/Username */}
              <div className="space-y-2">
                <Label htmlFor={emailId} className="sr-only">
                  Email or Username
                </Label>
                <form.Field
                  name="userIdentifier"
                  validators={{
                    onChange: ({ value }) =>
                      !value ? "Email or username is required" : undefined,
                  }}
                >
                  {(field) => (
                    <>
                      <Input
                        id={emailId}
                        placeholder="Email or Username"
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={emailSignInMutation.isPending}
                        endContent={<Mail size={16} aria-hidden="true" />}
                      />
                      {!field.state.meta.isValid &&
                        field.state.meta.isTouched && (
                          <p
                            className="text-destructive text-xs ml-4"
                            role="alert"
                            aria-live="polite"
                          >
                            {field.state.meta.errors[0]}
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
                <form.Field
                  name="password"
                  validators={{
                    onChange: ({ value }) =>
                      !value ? "Password is required" : undefined,
                  }}
                >
                  {(field) => (
                    <>
                      <Input
                        id={passwordId}
                        placeholder="Password"
                        type={isPasswordVisible ? "text" : "password"}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={emailSignInMutation.isPending}
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
                            disabled={emailSignInMutation.isPending}
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
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                    </>
                  )}
                </form.Field>
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={
                  emailSignInMutation.isPending || !form.state.canSubmit
                }
              >
                {emailSignInMutation.isPending ? (
                  <span>
                    Signing in <Spinner variant="ellipsis" />
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">Or</span>
              </div>
            </div>

            <div className="flex w-full">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => googleLogin()}
                disabled={googleAuthMutation.isPending}
              >
                <Google />
                {googleAuthMutation.isPending
                  ? "Signing in..."
                  : "Continue with Google"}
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-center text-sm w-full">
              Don't have an account?{" "}
              <Link to="/auth/signup" className="underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
