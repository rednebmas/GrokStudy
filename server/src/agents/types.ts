/**
 * Type definitions for the agent system
 */

export type AgentName = "learn" | "study";

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolDefinition {
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
}

export interface AgentConfig {
  name: AgentName;
  instructions: string;
  tools: ToolDefinition[];
}
