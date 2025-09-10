import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createAgent,
  type CreateAgentRequest,
} from "@/lib/services/agents.service";
import { authState } from "@/lib/state/auth.state";
import { AgentType } from "@/lib/types/agent";
import ErrorAlert from "@/components/error-alert";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { createAgentSchema } from "@/lib/validators/agent.validator";

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentType: AgentType;
}

export function CreateAgentModal({
  open,
  onOpenChange,
  agentType,
}: CreateAgentModalProps) {
  const queryClient = useQueryClient();
  const { organization } = useStore(authState);
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const nameId = useId();
  const descriptionId = useId();
  const systemPromptId = useId();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      type: agentType,
    },
    validators: {
      onChange: createAgentSchema,
    },
    onSubmit: async ({ value }) => {
      setServerErrors([]);
      if (!organization?.id) return;
      createAgentMutation.mutate({
        organizationId: organization.id,
        payload: value,
      });
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: ({
      organizationId,
      payload,
    }: {
      organizationId: string;
      payload: CreateAgentRequest;
    }) => createAgent(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error & { errors?: string[] }) => {
      if (error.errors && Array.isArray(error.errors)) {
        setServerErrors(error.errors);
      } else {
        setServerErrors([error.message || "An unexpected error occurred"]);
      }
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setServerErrors([]);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-h-[400px] m-0 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle>
              Create {agentType === AgentType.Chat ? "Chat" : "Voice"} Agent
            </DialogTitle>
            <DialogDescription>
              Add a new {agentType === AgentType.Chat ? "chat" : "voice"} agent
              to your organization.
            </DialogDescription>
            {serverErrors.length > 0 && (
              <div className="mt-3">
                <ErrorAlert errors={serverErrors} />
              </div>
            )}
          </DialogHeader>

          <form className="flex flex-col gap-5 mt-6">
            {/* Name */}
            <div className="space-y-2">
              <form.Field name="name">
                {(field) => (
                  <>
                    <Input
                      id={nameId}
                      placeholder="Name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={createAgentMutation.isPending}
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

            {/* Description */}
            <div className="space-y-2">
              <form.Field name="description">
                {(field) => (
                  <>
                    <Textarea
                      id={descriptionId}
                      placeholder="Brief description..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={createAgentMutation.isPending}
                      rows={3}
                      className="min-h-[80px] max-h-[120px] resize-y"
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

            {/* System Prompt */}
            <div className="space-y-2">
              <form.Field name="systemPrompt">
                {(field) => (
                  <>
                    <Textarea
                      id={systemPromptId}
                      placeholder="Instructions for the agent..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={createAgentMutation.isPending}
                      rows={6}
                      className="min-h-[150px] max-h-[300px] resize-y"
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

            <DialogFooter className="mt-3">
              <Button
                type="button"
                size="normal"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createAgentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="normal"
                disabled={
                  createAgentMutation.isPending || !form.state.canSubmit
                }
                onClick={() => form.handleSubmit()}
              >
                {createAgentMutation.isPending ? (
                  <span>
                    Creating <Spinner variant="ellipsis" />
                  </span>
                ) : (
                  "Create Agent"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
