/** Technical details (keys, env vars, database errors) must never reach visitors. */
const TECHNICAL = /supabase|environment|env\b|variable|api.?key|role|secret|token|jwt|unauthori|bearer|database|relation|column|constraint|violat|postgres|sql|fetch|network|http|undefined|null|stack|cloud|lovable|config|zod|invalid_|expected/i;

export function friendlyError(error: unknown, fallback: string): string {
  const msg = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!msg || msg.length > 160 || TECHNICAL.test(msg)) return fallback;
  return msg;
}
