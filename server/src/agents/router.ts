/**
 * Agent router - manages agent switching and provides agent configurations
 */

import type { AgentConfig, AgentName, ToolDefinition } from "./types";
import { learnAgent } from "./learn";
import { studyAgent } from "./study";

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
};

const agents: Record<AgentName, AgentConfig> = {
  learn: learnAgent,
  study: studyAgent,
};

/**
 * Get the configuration for a specific agent
 */
export function getAgentConfig(agentName: AgentName): AgentConfig {
  const agent = agents[agentName];
  return {
    ...agent,
    tools: [...agent.tools, agentRouterTool],
  };
}

/**
 * Get the default agent (Learn mode)
 */
export function getDefaultAgent(): AgentConfig {
  return getAgentConfig("learn");
}

/**
 * Check if an agent name is valid
 */
export function isValidAgent(name: string): name is AgentName {
  return name === "learn" || name === "study";
}
