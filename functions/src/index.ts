import * as functions from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// Define secret for Gemini API Key
const geminiApiKey = defineSecret("GEMINI_API_KEY");

// Rate limit configuration
const RATE_LIMIT = {
  maxRequests: 20,      // Max requests per window
  windowMs: 60 * 1000,  // 1 minute window
};

interface RateLimitDoc {
  count: number;
  windowStart: number;
}

/**
 * Checks if a user has exceeded their rate limit.
 * Returns true if request is allowed, false if rate limited.
 */
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const ref = db.collection("v3_rate_limits").doc(userId);
  const now = Date.now();

  const result = await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);
    const data = doc.data() as RateLimitDoc | undefined;

    // Check if window has expired
    if (!data || now - data.windowStart > RATE_LIMIT.windowMs) {
      // Start a new window
      transaction.set(ref, {
        count: 1,
        windowStart: now,
      });
      return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
    }

    // Check if limit exceeded
    if (data.count >= RATE_LIMIT.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    // Increment count
    transaction.update(ref, {
      count: admin.firestore.FieldValue.increment(1),
    });

    return { allowed: true, remaining: RATE_LIMIT.maxRequests - data.count - 1 };
  });

  return result;
}

/**
 * Rate-limited proxy for Gemini API requests.
 * Authenticates the user, checks rate limits, and forwards the request.
 */
export const geminiProxy = functions
  .region("us-central1")
  .runWith({ secrets: [geminiApiKey] })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to use AI features."
      );
    }

    const userId = context.auth.uid;

    // Check rate limit
    const rateCheck = await checkRateLimit(userId);
    if (!rateCheck.allowed) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Rate limit exceeded. Please wait a moment before trying again.",
        { remaining: 0, resetIn: "1 minute" }
      );
    }

    // Get API key from secret
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "AI service is not configured."
      );
    }

    try {
      // Forward request to Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${data.model || "gemini-3-pro-preview"}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: data.contents,
            generation_config: data.generation_config || data.generationConfig,
            system_instruction: data.system_instruction || data.systemInstruction,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Gemini API error:", error);
        throw new functions.https.HttpsError(
          "internal",
          "AI service encountered an error."
        );
      }

      const result = await response.json();
      return {
        ...result,
        _rateLimit: {
          remaining: rateCheck.remaining,
        },
      };
    } catch (error) {
      console.error("Gemini proxy error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to process AI request."
      );
    }
  });

/**
 * HTTP endpoint to check rate limit status (for UI display).
 */
export const getRateLimitStatus = functions
  .region("us-central1")
  .https.onCall(async (_data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in."
      );
    }

    const userId = context.auth.uid;
    const ref = db.collection("v3_rate_limits").doc(userId);
    const doc = await ref.get();
    const data = doc.data() as RateLimitDoc | undefined;

    if (!data) {
      return {
        remaining: RATE_LIMIT.maxRequests,
        resetIn: null,
      };
    }

    const now = Date.now();
    const windowEnd = data.windowStart + RATE_LIMIT.windowMs;

    if (now > windowEnd) {
      return {
        remaining: RATE_LIMIT.maxRequests,
        resetIn: null,
      };
    }

    return {
      remaining: Math.max(0, RATE_LIMIT.maxRequests - data.count),
      resetIn: Math.ceil((windowEnd - now) / 1000),
    };
  });
