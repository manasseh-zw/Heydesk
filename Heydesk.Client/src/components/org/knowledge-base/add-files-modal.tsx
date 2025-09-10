import { useId, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import ErrorAlert from "@/components/error-alert";
import { ingestDocument } from "@/lib/services/documents.service";
import { authState } from "@/lib/state/auth.state";
import {
  AlertCircleIcon,
  PaperclipIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";

interface AddFilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFilesModal({ open, onOpenChange }: AddFilesModalProps) {
  const { organization } = useStore(authState);
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const nameId = useId();

  const maxSize = useMemo(() => 10 * 1024 * 1024, []);

  const [uploadState, uploader] = useFileUpload({ maxSize });
  const file = uploadState.files[0];

  const form = useForm({
    defaultValues: { name: "" },
    validators: {
      onChange: ({ value }) => {
        const errs: Record<string, string | undefined> = {};
        if (!value.name.trim()) errs.name = "Name is required";
        return {
          fields: {
            name: errs.name
              ? [{ type: "value", message: errs.name }]
              : undefined,
          },
        };
      },
    },
    onSubmit: async ({ value }) => {
      setServerErrors([]);
      if (!organization?.id || !file || !(file.file instanceof File)) return;
      mutate({
        organizationId: organization.id,
        name: value.name,
        file: file.file,
      });
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      organizationId,
      name,
      file,
    }: {
      organizationId: string;
      name: string;
      file: File;
    }) => ingestDocument(organizationId, { name, file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      onOpenChange(false);
      uploader.removeFile(uploadState.files[0]?.id);
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
      if (uploadState.files[0]) uploader.removeFile(uploadState.files[0].id);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-h-[360px] m-0 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle>Add Files</DialogTitle>
            <DialogDescription>
              Upload a file to ingest as a document.
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

            <div className="flex flex-col gap-2">
              <div
                role="button"
                onClick={uploader.openFileDialog}
                onDragEnter={uploader.handleDragEnter}
                onDragLeave={uploader.handleDragLeave}
                onDragOver={uploader.handleDragOver}
                onDrop={uploader.handleDrop}
                data-dragging={uploadState.isDragging || undefined}
                className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
              >
                <input
                  {...uploader.getInputProps()}
                  className="sr-only"
                  aria-label="Upload file"
                  disabled={Boolean(file)}
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <div
                    className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <UploadIcon className="size-4 opacity-60" />
                  </div>
                  <p className="mb-1.5 text-sm font-medium">Upload file</p>
                  <p className="text-muted-foreground text-xs">
                    Drag & drop or click to browse (max. {formatBytes(maxSize)})
                  </p>
                </div>
              </div>

              {uploadState.errors.length > 0 && (
                <div
                  className="text-destructive flex items-center gap-1 text-xs"
                  role="alert"
                >
                  <AlertCircleIcon className="size-3 shrink-0" />
                  <span>{uploadState.errors[0]}</span>
                </div>
              )}

              {file && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 rounded-xl border px-4 py-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <PaperclipIcon
                        className="size-4 shrink-0 opacity-60"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">
                          {file.file.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                      onClick={() =>
                        uploader.removeFile(uploadState.files[0]?.id)
                      }
                      aria-label="Remove file"
                    >
                      <XIcon className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
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
                disabled={
                  isPending ||
                  !form.state.canSubmit ||
                  !file ||
                  !(file.file instanceof File)
                }
                onClick={() => form.handleSubmit()}
              >
                {isPending ? (
                  <span>
                    Uploading <Spinner variant="ellipsis" />
                  </span>
                ) : (
                  "Upload"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddFilesModal;
