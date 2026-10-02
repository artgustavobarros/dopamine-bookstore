import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { getRequestHeader } from "@tanstack/react-start/server";
import { env } from "@/env";

const ATOMIC_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return count
`;

const budgets = {
  diagnosis: { limit: 3, windowMs: 60 * 60 * 1000 },
  roast: { limit: 20, windowMs: 10 * 60 * 1000 },
} as const;

export type AiRequestKind = keyof typeof budgets;

export async function checkSharedQuota({
  fetchImpl = fetch,
  key,
  limit,
  token,
  url,
  windowMs,
}: {
  fetchImpl?: typeof fetch;
  key: string;
  limit: number;
  token: string;
  url: string;
  windowMs: number;
}): Promise<boolean> {
  try {
    if (new URL(url).protocol !== "https:") {
      return false;
    }
    const response = await fetchImpl(url, {
      body: JSON.stringify(["EVAL", ATOMIC_WINDOW_SCRIPT, 1, key, windowMs]),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) {
      return false;
    }
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("result" in body)) {
      return false;
    }
    const count = Number(body.result);
    return Number.isInteger(count) && count > 0 && count <= limit;
  } catch {
    return false;
  }
}

export function makeClientQuotaKey(
  kind: AiRequestKind,
  ip: string,
  secret: string
): string {
  const digest = createHmac("sha256", secret).update(ip).digest("hex");
  return `dopamine:gemini:${kind}:${digest}`;
}

export async function allowAiRequest(kind: AiRequestKind): Promise<boolean> {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  const secret = env.RATE_LIMIT_KEY_SECRET;
  if (!(url && token && secret && secret.length >= 32)) {
    return false;
  }

  // Vercel overwrites X-Forwarded-For before it reaches the function.
  // Other deployments need their own trusted client-IP integration.
  if (process.env.VERCEL !== "1") {
    return false;
  }
  const ip = getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
  if (!(ip && isIP(ip))) {
    return false;
  }

  return await checkSharedQuota({
    key: makeClientQuotaKey(kind, ip, secret),
    limit: budgets[kind].limit,
    token,
    url,
    windowMs: budgets[kind].windowMs,
  });
}
