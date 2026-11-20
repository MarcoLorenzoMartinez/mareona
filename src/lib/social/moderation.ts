import "server-only";

import {
  MODERATION_SYSTEM_PROMPT,
  MODERATION_REJECTED_MESSAGE,
  BANNED_USER_POST_MESSAGE,
  READ_ONLY_WALL_MESSAGE,
  isProfileActivelyBanned,
  parseModerationResponse,
  type ModerationDecision,
} from "./moderation-ai";

export {
  MODERATION_REJECTED_MESSAGE,
  BANNED_USER_POST_MESSAGE,
  READ_ONLY_WALL_MESSAGE,
  isProfileActivelyBanned,
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Gemma 2 was retired on Groq; Llama 3.1 8B is the fastest supported model. Override via env.
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const TIMEOUT_MS = 2500;

interface GroqCompletion {
  readonly choices?: readonly { readonly message?: { readonly content?: string | null } }[];
}

async function classifyWithGroq(text: string, apiKey: string): Promise<ModerationDecision> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
      temperature: 0,
      max_tokens: 80,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: MODERATION_SYSTEM_PROMPT },
        { role: "user", content: `<mensaje>${text}</mensaje>` },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  if (response.status === 429) return { verdict: "flag", reason: "ai_rate_limited" };
  if (!response.ok) return { verdict: "flag", reason: `ai_http_${response.status}` };

  const completion = (await response.json()) as GroqCompletion;
  return parseModerationResponse(completion.choices?.[0]?.message?.content);
}

/**
 * Moderates a post body with Groq.
 * Never throws; every infrastructure failure degrades to `flag` so the post is published
 * and queued for human review instead of blocking the user.
 *
 * @param text - Trimmed post body.
 * @returns `block` to reject, `flag` to publish for review, `allow` to publish normally.
 */
export async function moderateText(text: string): Promise<ModerationDecision> {
  if (!text.trim()) {
    return { verdict: "allow", reason: "lineup_only" };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { verdict: "allow", reason: "ai_unconfigured" };

  try {
    return await classifyWithGroq(text, apiKey);
  } catch {
    return { verdict: "flag", reason: "ai_unavailable" };
  }
}
