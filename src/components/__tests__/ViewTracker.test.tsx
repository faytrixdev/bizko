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

describe("ViewTracker", () => {
  it("renders nothing and records a view event on mount", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { container } = render(<ViewTracker profileId="p1" />);

    expect(container).toBeEmptyDOMElement();
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("record_event", {
      p_profile_id: "p1",
      p_type: "view",
    });
  });

  it("records only one event per mount", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { rerender } = render(<ViewTracker profileId="p1" />);
    rerender(<ViewTracker profileId="p1" />);

    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("records a new event after a fresh mount (different profile)", () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(mockClient(rpc));

    const { unmount } = render(<ViewTracker profileId="p1" />);
    unmount();
    render(<ViewTracker profileId="p2" />);

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenLastCalledWith("record_event", {
      p_profile_id: "p2",
      p_type: "view",
    });
  });
});