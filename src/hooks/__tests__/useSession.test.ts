import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { useSession } from "../useSession";
import { createClient } from "@/lib/supabase/client";

type MockSupabase = ReturnType<typeof createClient>;

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

function mockSessionClient({ single }: { single: ReturnType<typeof vi.fn> }) {
  const client = {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single,
  } as unknown as MockSupabase;
  return client;
}

afterEach(() => {
  cleanup();
});

describe("useSession", () => {
  it("returns initial loading state", () => {
    const client = mockSessionClient({ single: vi.fn().mockResolvedValue({ data: null }) });
    vi.mocked(createClient).mockReturnValue(client);
    client.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } });

    const { result } = renderHook(() => useSession());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.isOnboarded).toBe(false);
  });

  it("returns user and profile when authenticated", async () => {
    const mockUser = { id: "123", email: "test@example.com" };
    const mockProfile = { id: "123", username: "testuser" };

    const client = mockSessionClient({ single: vi.fn().mockResolvedValue({ data: mockProfile }) });
    vi.mocked(createClient).mockReturnValue(client);
    client.auth.getUser = vi.fn().mockResolvedValue({ data: { user: mockUser } });

    const { result } = renderHook(() => useSession());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isOnboarded).toBe(true);
  });
});
