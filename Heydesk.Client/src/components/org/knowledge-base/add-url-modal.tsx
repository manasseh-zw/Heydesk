import { useId, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import normalizeUrl from "normalize-url";
import { ingestUrl } from "@/lib/services/documents.service";
import { authState } from "@/lib/state/auth.state";
import { useStore } from "@tanstack/react-store";
import ErrorAlert from "@/components/error-alert";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface AddUrlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUrlModal({ open, onOpenChange }: AddUrlModalProps) {
  const { organization } = useStore(authState);
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const urlId = useId();

  const form = useForm({
    defaultValues: { url: "" },
    validators: {
      onChange: ({ value }) => {
        const errors: { url?: string } = {};
        if (!value.url || value.url.trim().length === 0) {
          errors.url = "URL is required";
        }
        return {
          fields: {
            url: errors.url
              ? [{ type: "value", message: errors.url }]
              : undefined,
          },
        };
      },
    },
    onSubmit: async ({ value }) => {
      setServerErrors([]);
      if (!organization?.id) return;
      let normalized = value.url;
      try {
        normalized = normalizeUrl(value.url, {
          defaultProtocol: "https",
          forceHttps: true,
        });
      } catch {
        normalized = value.url;
      }
      mutate({ organizationId: organization.id, url: normalized });
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      organizationId,
      url,
    }: {
      organizationId: string;
      url: string;
    }) => ingestUrl(organizationId, { url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error & { errors?: string[] }) => {
      if (error.errors && Array.isArray(error.errors))
        setServerErrors(error.errors);
      else setServerErrors([error.message || "An unexpected error occurred"]);
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset();
      setServerErrors([]);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-h-[260px] m-0 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-xl mx-auto">
          <DialogHeader>
            <DialogTitle>Add URL</DialogTitle>
            <DialogDescription>
              Provide a webpage to ingest into your knowledge base.
            </DialogDescription>
            {serverErrors.length > 0 && (
              <div className="mt-3">
                <ErrorAlert errors={serverErrors} />
              </div>
            )}
          </DialogHeader>

          <form className="flex flex-col gap-5 mt-6">
            <div className="space-y-2">
              <form.Field name="url">
                {(field) => (
                  <>
                    <Input
                      id={urlId}
                      placeholder="https://example.com/article"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isPending}
                    />
                    {!field.state.meta.isValid &&
                      field.state.meta.isTouched && (
                        <p
                          className="text-destructive text-xs ml-4"
                          role="alert"
                          aria-live="polite"
                        >
                          {field.state.meta.errors
                            .map((e) => e!.message)
                            .join(", ")}
                        </p>
                      )}
                  </>
                )}
              </form.Field>
            </div>

            <DialogFooter className="mt-3">
              <Button
                type="button"
                size="normal"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="normal"
                disabled={isPending || !form.state.canSubmit}
                onClick={() => form.handleSubmit()}
              >
                {isPending ? (
                  <span>
                    Submitting <Spinner variant="ellipsis" />
                  </span>
                ) : (
                  "Add URL"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddUrlModal;
