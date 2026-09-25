import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ViewTracker } from "../ViewTracker";
import { createClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
  isSupabaseConfigured: () => true,
}));

const fetchMock = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  cleanup();
  fetchMock.mockClear();
});

function mockClient(rpc: ReturnType<typeof vi.fn>) {
  return { rpc } as unknown as ReturnType<typeof createClient>;
}

// ViewTracker records the legacy view counter via POST /api/track-view
// (record_event is no longer callable with the anon key) and a platform
// "track_analytics_event" rpc per mount.
function trackViewCalls() {
  return fetchMock.mock.calls.filter(([url]) => url === "/api/track-view");
}

describe("ViewTracker", () => {
  it("renders nothing and records a view event on mount", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { container } = render(<ViewTracker profileId="p1" />);

    expect(container).toBeEmptyDOMElement();
    const calls = trackViewCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ profileId: "p1" }),
    });
  });

  it("records only one event per mount (per profile)", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { rerender } = render(<ViewTracker profileId="p1" />);
    rerender(<ViewTracker profileId="p1" />);

    expect(trackViewCalls()).toHaveLength(1);
  });

  it("records a new event after a fresh mount (different profile)", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { unmount } = render(<ViewTracker profileId="p1" />);
    unmount();
    render(<ViewTracker profileId="p2" />);

    const calls = trackViewCalls();
    expect(calls).toHaveLength(2);
    expect(calls[1][1]).toMatchObject({
      body: JSON.stringify({ profileId: "p2" }),
    });
  });
});
