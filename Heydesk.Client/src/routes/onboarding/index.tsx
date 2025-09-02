import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Building2, AtSign, Globe } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createOrganization } from "@/lib/services/organization.service";
import { authActions } from "@/lib/state/auth.state";
import type { Organization } from "@/lib/types/organization";
import ErrorAlert from "@/components/error-alert";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { createOrgSchema } from "@/lib/validators/organization.validator";

export const Route = createFileRoute("/onboarding/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const nameId = useId();
  const slugId = useId();
  const websiteId = useId();
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      url: "",
    },
    validators: {
      onChange: createOrgSchema,
    },
    onSubmit: async ({ value }) => {
      setServerErrors([]);
      // Ensure URL has protocol
      const formattedUrl = value.url.startsWith("http")
        ? value.url
        : `https://${value.url}`;

      createOrgMutation.mutate({
        ...value,
        url: formattedUrl,
      });
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; url: string }) =>
      createOrganization(data),
    onSuccess: (organization: Organization) => {
      authActions.setOrganization(organization);
      navigate({
        to: "/$org",
        params: { org: organization.slug },
      });
    },
    onError: (error: Error & { errors?: string[] }) => {
      if (error.errors && Array.isArray(error.errors)) {
        setServerErrors(error.errors);
      } else {
        setServerErrors([error.message || "An unexpected error occurred"]);
      }
    },
  });

  return (
    <main className="h-screen w-full flex justify-center items-center">
      <div className="flex flex-col gap-8 -mt-6 md:-mt-10">
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
              Create your organization
            </CardTitle>
            <CardDescription>
              Set up your workspace to get started
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
              {/* Organization Name */}
              <div className="space-y-2">
                <Label htmlFor={nameId} className="sr-only">
                  Organization name
                </Label>
                <form.Field name="name">
                  {(field) => (
                    <>
                      <Input
                        id={nameId}
                        placeholder="Organization name"
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={createOrgMutation.isPending}
                        endContent={<Building2 size={16} aria-hidden="true" />}
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
                              .join(", ")}
                          </p>
                        )}
                    </>
                  )}
                </form.Field>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor={slugId} className="sr-only">
                  Organization slug
                </Label>
                <form.Field name="slug">
                  {(field) => (
                    <>
                      <Input
                        id={slugId}
                        placeholder="your-company"
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={createOrgMutation.isPending}
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
                              .join(", ")}
                          </p>
                        )}
                    </>
                  )}
                </form.Field>
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <Label htmlFor={websiteId} className="sr-only">
                  Website URL
                </Label>
                <form.Field name="url">
                  {(field) => (
                    <>
                      <Input
                        id={websiteId}
                        placeholder="your-website.com"
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={createOrgMutation.isPending}
                        startContent={
                          <span className="text-muted-foreground text-sm">
                            https://
                          </span>
                        }
                        endContent={<Globe size={16} aria-hidden="true" />}
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
                              .join(", ")}
                          </p>
                        )}
                    </>
                  )}
                </form.Field>
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={createOrgMutation.isPending || !form.state.canSubmit}
              >
                {createOrgMutation.isPending ? (
                  <span>
                    Creating organization <Spinner variant="ellipsis" />
                  </span>
                ) : (
                  "Create organization"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
