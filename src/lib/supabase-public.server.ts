// Read-only server client using the publishable key. RLS applies (anon role),
// so it can only read rows that public policies expose.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function createPublicServerClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend configuration is missing (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY)");

  const shimFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };

  return createClient<Database>(url, key, {
    global: { fetch: shimFetch },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
