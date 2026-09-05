import { describe, it, expect } from "vitest";
import { RESERVED_USERNAMES } from "@/lib/reservedUsernames";

describe("RESERVED_USERNAMES", () => {
  it("blocks the explore slug", () => {
    expect(RESERVED_USERNAMES).toContain("explore");
  });
});
