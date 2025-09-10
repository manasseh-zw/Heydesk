import { z } from 'zod';
import { AgentType } from '@/lib/types/agent';

export const createAgentSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters"),
  systemPrompt: z
    .string()
    .min(10, "System prompt must be at least 10 characters"),
  type: z.enum(AgentType),
});


