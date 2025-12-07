/**
 * Tool definitions for the agent system
 */

import type { ToolDefinition } from "../agents/types";

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
};
