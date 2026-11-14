import { describe, expect, it } from "vitest";
import { friendlyError } from "./user-error";
const F = "fallback";
describe("friendlyError", () => {
  it("hides service role key errors", () => {
    expect(friendlyError(new Error("Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY. Connect Supabase in Lovable Cloud."), F)).toBe(F);
  });
  it("keeps plain user messages", () => {
    expect(friendlyError(new Error("Please wait before sending another."), F)).toBe("Please wait before sending another.");
  });
});
