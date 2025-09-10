import { useId, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import ErrorAlert from "@/components/error-alert";
import { ingestText } from "@/lib/services/documents.service";
import { authState } from "@/lib/state/auth.state";

interface AddTextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTextModal({ open, onOpenChange }: AddTextModalProps) {
  const { organization } = useStore(authState);
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const nameId = useId();
  const contentId = useId();

  const form = useForm({
    defaultValues: { name: "", content: "" },
    validators: {
      onChange: ({ value }) => {
        const fieldErrors: Record<string, string | undefined> = {};
        if (!value.name.trim()) fieldErrors.name = "Name is required";
        if (!value.content.trim()) fieldErrors.content = "Content is required";
        return {
          fields: {
            name: fieldErrors.name
              ? [{ type: "value", message: fieldErrors.name }]
              : undefined,
            content: fieldErrors.content
              ? [{ type: "value", message: fieldErrors.content }]
              : undefined,
          },
        };
      },
    },
    onSubmit: async ({ value }) => {
      setServerErrors([]);
      if (!organization?.id) return;
      mutate({
        organizationId: organization.id,
        name: value.name,
        content: value.content,
      });
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      organizationId,
      name,
      content,
    }: {
      organizationId: string;
      name: string;
      content: string;
    }) => ingestText(organizationId, { name, content }),
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
      <DialogContent className="min-h-[360px] m-0 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle>Create Text</DialogTitle>
            <DialogDescription>
              Paste text to ingest as a document.
            </DialogDescription>
            {serverErrors.length > 0 && (
              <div className="mt-3">
                <ErrorAlert errors={serverErrors} />
              </div>
            )}
          </DialogHeader>

          <form className="flex flex-col gap-5 mt-6">
            <div className="space-y-2">
              <form.Field name="name">
                {(field) => (
                  <>
                    <Input
                      id={nameId}
                      placeholder="Name"
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

            <div className="space-y-2">
              <form.Field name="content">
                {(field) => (
                  <>
                    <Textarea
                      id={contentId}
                      placeholder="Paste content here..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isPending}
                      rows={10}
                      className="min-h-[160px] max-h-[360px] resize-y"
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
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddTextModal;
