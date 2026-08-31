import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ViewTracker } from "../ViewTracker";
import { createClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

function mockClient(rpc: ReturnType<typeof vi.fn>) {
  return { rpc } as unknown as ReturnType<typeof createClient>;
}

// ViewTracker records BOTH a legacy "record_event" and a platform
// "track_analytics_event" per mount, so each mount produces 2 rpc calls.
function recordEventCalls(rpc: ReturnType<typeof vi.fn>) {
  return rpc.mock.calls.filter(([name]) => name === "record_event");
}

describe("ViewTracker", () => {
  it("renders nothing and records a view event on mount", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { container } = render(<ViewTracker profileId="p1" />);

    expect(container).toBeEmptyDOMElement();
    const calls = recordEventCalls(rpc);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([
      "record_event",
      { p_profile_id: "p1", p_type: "view" },
    ]);
  });

  it("records only one event per mount (per profile)", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { rerender } = render(<ViewTracker profileId="p1" />);
    rerender(<ViewTracker profileId="p1" />);

    expect(recordEventCalls(rpc)).toHaveLength(1);
  });

  it("records a new event after a fresh mount (different profile)", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { unmount } = render(<ViewTracker profileId="p1" />);
    unmount();
    render(<ViewTracker profileId="p2" />);

    const calls = recordEventCalls(rpc);
    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual([
      "record_event",
      { p_profile_id: "p2", p_type: "view" },
    ]);
  });
});