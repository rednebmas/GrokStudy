/**
 * Tool definitions and execution for the agent system
 */

import type { ToolDefinition } from "../agents/types";

/**
 * Context passed to tool handlers
 */
export interface ToolContext {
  sessionId: string;
}

/**
 * Tool handler function type
 */
export type ToolHandler<T = Record<string, unknown>> = (
  args: T,
  context: ToolContext
) => Promise<void>;

/**
 * Arguments for the create_flashcard tool
 */
interface CreateFlashcardArgs {
  question: string;
  answer: string;
}

/**
 * Tool to create a flashcard for spaced repetition learning
 */
export const createFlashcardTool: ToolDefinition = {
  type: "function",
  function: {
    name: "create_flashcard",
    description:
      "Create a flashcard to help the user remember an important concept. Use this after explaining something worth remembering.",
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question side of the flashcard",
        },
        answer: {
          type: "string",
          description: "The answer side of the flashcard",
        },
        topic: {
          type: "string",
          description: "The topic or category this flashcard belongs to",
        },
      },
      required: ["question", "answer", "topic"],
    },
  },
  execute: async (args, context) => {
    const { question, answer } = args as unknown as CreateFlashcardArgs;
    console.log(`[${context.sessionId}] 📝 Creating flashcard:`);
    console.log(`[${context.sessionId}]    Q: ${question}`);
    console.log(`[${context.sessionId}]    A: ${answer}`);
    // TODO: Persist flashcard to database
  },
};
