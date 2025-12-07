/**
 * Type definitions for the agent system
 */

import type { ToolContext } from "../tools";

export type AgentName = "starter" | "learn" | "study";

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export type ToolResult = Record<string, unknown> | string | null;

export type ToolDefinition =
  | { type: "web_search" }
  | {
      type: "function";
      function: {
        name: string;
        description: string;
        parameters: {
          type: "object";
          properties: Record<string, ToolParameter>;
          required: string[];
        };
      };
      execute: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
    };

export interface AgentConfig {
  name: AgentName;
  instructions: string;
  tools: ToolDefinition[];
}

/**
 * Parameters that can be passed when loading an agent
 */
export interface AgentParams {
  topic?: string;
}

/**
 * Function that loads an agent config, optionally with async data
 */
export type AgentLoader = (params?: AgentParams) => Promise<AgentConfig>;
