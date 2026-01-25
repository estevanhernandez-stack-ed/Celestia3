"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRateLimitStatus = exports.geminiProxy = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// Define secret for Gemini API Key
const geminiApiKey = (0, params_1.defineSecret)("GEMINI_API_KEY");
// Rate limit configuration
const RATE_LIMIT = {
    maxRequests: 20, // Max requests per window
    windowMs: 60 * 1000, // 1 minute window
};
/**
 * Checks if a user has exceeded their rate limit.
 * Returns true if request is allowed, false if rate limited.
 */
async function checkRateLimit(userId) {
    const ref = db.collection("v3_rate_limits").doc(userId);
    const now = Date.now();
    const result = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(ref);
        const data = doc.data();
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
exports.geminiProxy = functions
    .region("us-central1")
    .runWith({
    secrets: [geminiApiKey],
    timeoutSeconds: 120,
    memory: "512MB"
})
    .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be signed in to use AI features.");
    }
    const userId = context.auth.uid;
    // Check rate limit
    const rateCheck = await checkRateLimit(userId);
    if (!rateCheck.allowed) {
        throw new functions.https.HttpsError("resource-exhausted", "Rate limit exceeded. Please wait a moment before trying again.", { remaining: 0, resetIn: "1 minute" });
    }
    // Get API key from secret
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new functions.https.HttpsError("failed-precondition", "AI service is not configured.");
    }
    try {
        // Forward request to Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${data.model || "gemini-3-pro-preview"}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                contents: data.contents,
                generation_config: data.generation_config,
                system_instruction: data.system_instruction,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error("Gemini API error:", error);
            throw new functions.https.HttpsError("internal", "AI service encountered an error.");
        }
        const result = await response.json();
        return {
            ...result,
            _rateLimit: {
                remaining: rateCheck.remaining,
            },
        };
    }
    catch (error) {
        console.error("Gemini proxy error:", error);
        throw new functions.https.HttpsError("internal", "Failed to process AI request.");
    }
});
/**
 * HTTP endpoint to check rate limit status (for UI display).
 */
exports.getRateLimitStatus = functions
    .region("us-central1")
    .https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
    }
    const userId = context.auth.uid;
    const ref = db.collection("v3_rate_limits").doc(userId);
    const doc = await ref.get();
    const data = doc.data();
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
//# sourceMappingURL=index.js.map