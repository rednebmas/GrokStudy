/**
 * Starter Agent - greets users and helps them choose their next action
 */

import type { AgentConfig, AgentLoader } from "./types";
import { getDb } from "../db";

const baseInstructions = `You are a friendly learning assistant that greets users and helps them decide what to do next.

Your role is to:
1. Warmly greet the user
2. Let them know how many flashcards they have to review (if any)
3. Offer to continue learning from where they left off or start something new

Based on the user's choice:
- If they want to review/study flashcards, use switch_agent to switch to "review"
- If they want to learn or explore topics, use switch_agent to switch to "learn"`;

export const loadStarterAgent: AgentLoader = async (): Promise<AgentConfig> => {
  let instructions = baseInstructions;

  const db = await getDb();

  // Get flashcard count for review prompt
  const flashcardCount = await db.collection("flashcards").countDocuments();

  // Get list of topics the user has learned about
  const topics = await db.collection("flashcards").distinct("topic");

  if (flashcardCount > 0) {
    instructions += `\n\nThe user has ${flashcardCount} flashcard${flashcardCount === 1 ? "" : "s"} available to review.`;
  }

  if (topics.length > 0) {
    const topicsList = topics.join(", ");
    instructions += `\n\nThe user has previously learned about these topics: ${topicsList}\n\nMention these to help them pick up where they left off, or they can start something new.`;
    console.log(`📚 Starter agent loaded ${topics.length} topics: ${topicsList}`);
  }

  return {
    name: "starter",
    instructions,
    tools: [], // Only needs switch_agent which is added by router
  };
};
