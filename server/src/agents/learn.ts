/**
 * Learn Agent - helps users explore topics and creates flashcards
 */

import type { AgentConfig, AgentLoader, AgentParams } from "./types";
import { createFlashcardTool } from "../tools";
import { getDb } from "../db";

const baseInstructions = `You are a friendly and knowledgeable learning assistant that helps users explore topics they're curious about. Your goal is to:

1. Engage in natural conversation about topics the user wants to learn
2. Explain concepts clearly and CONCISELY (1-2 sentences) allowing the user to direct their learning. Don't overwhelm them with too much information at once.
3. Create flashcards when you teach important concepts that are worth remembering

When calling the create_flashcard tool:
- Create them naturally as part of the conversation after explaining a concept
- Tell the user what you'll quiz them on
- Keep questions clear and focused on a single concept
- Make answers concise but complete
- Don't overwhelm the user - create 1 flashcard at a time for key concepts

Make sure that you use the web_search tool to make sure you are knowledgeable and up-to-date on your topics of conversation. 

If the user says they want to review, study, or practice their flashcards, use the switch_agent tool to switch to the study agent.

Be encouraging and curious. Help the user build lasting knowledge through engaging conversation.`;

export const loadLearnAgent: AgentLoader = async (params?: AgentParams): Promise<AgentConfig> => {
  let instructions = baseInstructions;
  const topic = params?.topic;

  // Load recent flashcards to help user continue from where they left off
  const db = await getDb();
  const query = topic ? { topic } : {};
  const recentFlashcards = await db
    .collection("flashcards")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(3)
    .toArray();

  if (topic) {
    instructions += `\n\nThe user wants to continue learning about: ${topic}`;
  }

  if (recentFlashcards.length > 0) {
    const recentSummary = recentFlashcards
      .map((fc) => `- "${fc.question}"`)
      .join("\n");
    instructions += `\n\nTheir most recent flashcards${topic ? " on this topic" : ""} are:\n${recentSummary}\n\nUse these to help guide the conversation.`;
    console.log(`📚 Learn agent loaded ${recentFlashcards.length} recent flashcards${topic ? ` for topic: ${topic}` : ""}`);
  }

  return {
    name: "learn",
    instructions,
    tools: [createFlashcardTool],
  };
};
