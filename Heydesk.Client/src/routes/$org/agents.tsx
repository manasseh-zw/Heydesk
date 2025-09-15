import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AgentsTable from "@/components/org/agents/agents-table";
import { CreateAgentModal } from "@/components/org/agents/create-agent-modal";
import { ActionCard } from "@/components/action-card";
import { AudioLines, MessageCircle } from "lucide-react";
import { AgentType } from "@/lib/types/agent";

export const Route = createFileRoute("/$org/agents")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>(
    AgentType.Chat
  );

  const handleCreateChatAgent = () => {
    setSelectedAgentType(AgentType.Chat);
    setIsCreateModalOpen(true);
  };

  const handleCreateVoiceAgent = () => {
    setSelectedAgentType(AgentType.Voice);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 py-10 md:gap-6 md:py-12">
      <div className="px-4 lg:px-6">
        <div className="mb-7 flex flex-wrap items-stretch gap-4">
          <ActionCard
            title="Add Chat Agent"
            icon={<MessageCircle size={22} />}
            className="hover:bg-transparent"
            style={{
              backgroundColor: "hsla(30, 100%, 97%, 0.30)",
              backgroundImage:
                "radial-gradient(at 10% 20%, hsla(33, 100%, 83%, 0.18) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(333, 100%, 85%, 0.30) 0px, transparent 50%), radial-gradient(at 50% 90%, hsla(213, 100%, 85%, 0.14) 0px, transparent 50%)",
            }}
            onClick={handleCreateChatAgent}
          />
          {/* <ActionCard
            title="Add Voice Agent"
            icon={<AudioLines size={22} />}
            className="hover:bg-transparent "
            style={{
              backgroundColor: "hsla(30, 100%, 97%, 0.30)",
              backgroundImage:
                "radial-gradient(at 10% 20%, hsla(33, 100%, 83%, 0.18) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(333, 100%, 85%, 0.30) 0px, transparent 50%), radial-gradient(at 50% 90%, hsla(213, 100%, 85%, 0.14) 0px, transparent 50%)",
            }}
            onClick={handleCreateVoiceAgent}
          /> */}
        </div>
        <AgentsTable />
      </div>

      <CreateAgentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        agentType={selectedAgentType}
      />
    </div>
  );
}
