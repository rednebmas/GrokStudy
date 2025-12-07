/**
 * Agent router - manages agent switching and provides agent configurations
 */

import type { AgentConfig, AgentName, AgentLoader, ToolDefinition } from "./types";
import { loadLearnAgent } from "./learn";
import { loadStudyAgent } from "./study";

/**
 * Tool that allows switching between agents
 */
export const agentRouterTool: ToolDefinition = {
  type: "function",
  function: {
    name: "switch_agent",
    description:
      "Switch to a different agent mode. Use 'learn' when the user wants to explore topics and create flashcards. Use 'study' when the user wants to review their flashcards using spaced repetition.",
    parameters: {
      type: "object",
      properties: {
        agent: {
          type: "string",
          description: "The agent to switch to",
          enum: ["learn", "study"],
        },
        reason: {
          type: "string",
          description: "Brief explanation of why switching agents",
        },
      },
      required: ["agent", "reason"],
    },
  },
  execute: async (args, context) => {
    const { agent, reason } = args as unknown as { agent: AgentName; reason: string };
    console.log(`[${context.sessionId}] 🔄 Switching to ${agent} agent: ${reason}`);
    return { switched: true, agent, reason };
  },
};

const agentLoaders: Record<AgentName, AgentLoader> = {
  learn: loadLearnAgent,
  study: loadStudyAgent,
};

/**
 * Get the configuration for a specific agent (async to allow data loading)
 */
export async function getAgentConfig(agentName: AgentName): Promise<AgentConfig> {
  const loader = agentLoaders[agentName];
  const agent = await loader();
  return {
    ...agent,
    tools: [...agent.tools, agentRouterTool /*{ type: "web_search" }*/],
  };
}

/**
 * Get the default agent (Learn mode)
 */
export async function getDefaultAgent(): Promise<AgentConfig> {
  return getAgentConfig("learn");
}

/**
 * Check if an agent name is valid
 */
export function isValidAgent(name: string): name is AgentName {
  return name === "learn" || name === "study";
}
