/**
 * Tool definitions and execution for the agent system
 */

import { ObjectId } from "mongodb";
import type { ToolDefinition } from "../agents/types";
import { getDb } from "../db";

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
  context: ToolContext,
) => Promise<void>;

/**
 * Arguments for the create_flashcard tool
 */
interface CreateFlashcardArgs {
  question: string;
  answer: string;
  topic: string;
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
    const { question, answer, topic } = args as unknown as CreateFlashcardArgs;
    console.log(`[${context.sessionId}] 📝 Creating flashcard:`);
    console.log(`[${context.sessionId}]    Q: ${question}`);
    console.log(`[${context.sessionId}]    A: ${answer}`);

    const db = await getDb();
    await db.collection("flashcards").insertOne({
      sessionId: context.sessionId,
      question,
      answer,
      topic,
      createdAt: new Date(),
    });

    return { success: true, question, topic };
  },
};

/**
 * Tool to get a random flashcard for review
 */
let previousFlashcardId: string | undefined;
export const getRandomFlashcardTool: ToolDefinition = {
  type: "function",
  function: {
    name: "get_random_flashcard",
    description:
      "Get a random flashcard from the user's collection to quiz them on. Returns the question and answer.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  execute: async (_args, context) => {
    const db = await getDb();

    const matchStage = previousFlashcardId
      ? { $match: { _id: { $ne: new ObjectId(previousFlashcardId) } } }
      : { $match: {} };

    const flashcards = await db
      .collection("flashcards")
      .aggregate([
        matchStage,
        // optionally also filter by sessionId:
        // { $match: { sessionId: context.sessionId } },
        { $sample: { size: 1 } },
      ])
      .toArray();

    if (flashcards.length === 0) {
      return {
        found: false,
        message: "No flashcards available. The user should learn something first.",
      };
    }

    const flashcard = flashcards[0];
    previousFlashcardId = flashcard._id.toString();

    // Store the current flashcard for the session
    await db
      .collection("sessions")
      .updateOne(
        { sessionId: context.sessionId },
        { $set: { currentFlashcardId: flashcard._id } },
        { upsert: true },
      );

    return {
      found: true,
      question: flashcard.question,
      answer: flashcard.answer,
      topic: flashcard.topic,
    };
  },
};

interface ValidateAnswerArgs {
  isCorrect: boolean;
}

/**
 * Tool to validate and log the user's answer to a flashcard
 */
export const validateAnswerTool: ToolDefinition = {
  type: "function",
  function: {
    name: "validate_answer",
    description:
      "Record whether the user's answer to the current flashcard is correct. Call this after the user answers a flashcard question. IT DOES NOT NEED TO BE AN EXACT match, just around the general idea of the flashcard. IT IS OK to have parts of the flashcard that the user does not mention, that still counts as correct, but make sure to bring up any parts the user left out in their answer.",
    parameters: {
      type: "object",
      properties: {
        isCorrect: {
          type: "boolean",
          description: "Whether the user's answer is correct",
        },
      },
      required: ["isCorrect"],
    },
  },
  execute: async (args, context) => {
    const { isCorrect } = args as unknown as ValidateAnswerArgs;
    const db = await getDb();

    // Get the current flashcard from the session
    const session = await db.collection("sessions").findOne({ sessionId: context.sessionId });

    if (!session?.currentFlashcardId) {
      console.log(`[${context.sessionId}] ⚠️ No current flashcard to validate`);
      return { recorded: false, error: "No current flashcard to validate" };
    }

    const flashcard = await db
      .collection("flashcards")
      .findOne({ _id: session.currentFlashcardId });

    if (!flashcard) {
      console.log(`[${context.sessionId}] ⚠️ Flashcard not found`);
      return { recorded: false, error: "Flashcard not found" };
    }

    // Create an attempt record
    await db.collection("attempts").insertOne({
      sessionId: context.sessionId,
      flashcardId: flashcard._id,
      isCorrect,
      attemptedAt: new Date(),
    });

    if (isCorrect) {
      console.log(`[${context.sessionId}] ✅ CORRECT`);
      console.log(`[${context.sessionId}]    Q: ${flashcard.question}`);
    } else {
      console.log(`[${context.sessionId}] ❌ INCORRECT`);
      console.log(`[${context.sessionId}]    Q: ${flashcard.question}`);
      console.log(`[${context.sessionId}]    Expected: ${flashcard.answer}`);
    }

    return { recorded: true, isCorrect };
  },
};
