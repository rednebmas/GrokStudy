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
- If they want to review/study flashcards, use switch_agent to switch to "study"
- If they want to learn or explore topics, use switch_agent to switch to "learn"`;

export const loadStarterAgent: AgentLoader = async (): Promise<AgentConfig> => {
  let instructions = baseInstructions;

  const db = await getDb();

  // Get flashcard count for review prompt
  const flashcardCount = await db.collection("flashcards").countDocuments();

  // Get three most recent flashcards to show where they left off
  const recentFlashcards = await db
    .collection("flashcards")
    .find()
    .sort({ createdAt: -1 })
    .limit(3)
    .toArray();

  if (flashcardCount > 0) {
    instructions += `\n\nThe user has ${flashcardCount} flashcard${flashcardCount === 1 ? "" : "s"} available to review.`;
  }

  if (recentFlashcards.length > 0) {
    const recentSummary = recentFlashcards
      .map((fc) => `- "${fc.question}" (${fc.topic})`)
      .join("\n");
    instructions += `\n\nTheir most recent flashcards are:\n${recentSummary}\n\nMention these to help them pick up where they left off.`;
    console.log(`📚 Starter agent loaded ${recentFlashcards.length} recent flashcards`);
  }

  return {
    name: "starter",
    instructions,
    tools: [], // Only needs switch_agent which is added by router
  };
};
