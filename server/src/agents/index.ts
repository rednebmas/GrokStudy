/**
 * Agents module - exports agent router and configurations
 */

export { getAgentConfig, getDefaultAgent, isValidAgent } from "./router";
export type { AgentConfig, AgentName, AgentLoader, ToolDefinition } from "./types";
