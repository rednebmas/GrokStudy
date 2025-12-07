/**
 * Starter Agent - greets users and helps them choose their next action
 */

import type { AgentConfig, AgentLoader } from "./types";
import { getDb } from "../db";

const instructions = `You are a friendly learning assistant that helps users learn and review flashcards.

Based on the user's choice:
- If they want to review/study flashcards, use switch_agent to switch to "study"
- If they want to learn or explore topics, use switch_agent to switch to "learn" and include the topic parameter if they mention one`;

const formatTopics = (topicList: string[]): string => {
  if (topicList.length === 1) return topicList[0];
  if (topicList.length === 2) return `${topicList[0]} and ${topicList[1]}`;
  return `${topicList.slice(0, -1).join(", ")}, and ${topicList[topicList.length - 1]}`;
};

export const loadStarterAgent: AgentLoader = async (): Promise<AgentConfig> => {
  const db = await getDb();

  // Get flashcard count for review prompt
  const flashcardCount = await db.collection("flashcards").countDocuments();

  // Get list of topics the user has learned about
  const topics = await db.collection("flashcards").distinct("topic");

  // Build the greeting message with specific data
  let greeting = 'Say this to me: "Hello! ';

  if (flashcardCount > 0) {
    greeting += `You have ${flashcardCount} flashcard${flashcardCount === 1 ? "" : "s"} ready to review. `;
  }

  if (topics.length > 0) {
    greeting += `You've been learning about ${formatTopics(topics)}. `;
    greeting +=
      "Would you like to review your flashcards, continue with one of these topics, or explore something new?";
    console.log(`📚 Starter agent: ${flashcardCount} flashcards, ${topics.length} topics`);
  } else {
    greeting += "What would you like to learn about today?";
  }

  greeting += '"';

  return {
    name: "starter",
    instructions,
    tools: [],
    greeting,
  };
};
