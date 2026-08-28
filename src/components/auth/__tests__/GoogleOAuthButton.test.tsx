import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { GoogleOAuthButton } from "../GoogleOAuthButton";
import { createClient } from "@/lib/supabase/client";

type MockSignIn = ReturnType<typeof vi.fn>;

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/i18n/provider", () => ({
  useI18n: () => ({
    t: (path: string) =>
      path === "auth2.googleLogin"
        ? "Continuer avec Google"
        : path === "auth2.googleSignup"
          ? "S'inscrire avec Google"
          : path,
  }),
}));

function mockClient(auth: { signInWithOAuth: MockSignIn }) {
  return { auth } as unknown as ReturnType<typeof createClient>;
}

afterEach(() => {
  cleanup();
});

describe("GoogleOAuthButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });
  });

  it("renders login button", () => {
    vi.mocked(createClient).mockReturnValue(
      mockClient({ signInWithOAuth: vi.fn() })
    );

    render(<GoogleOAuthButton mode="login" />);
    expect(screen.getByText("Continuer avec Google")).toBeInTheDocument();
  });

  it("renders signup button", () => {
    vi.mocked(createClient).mockReturnValue(
      mockClient({ signInWithOAuth: vi.fn() })
    );

    render(<GoogleOAuthButton mode="signup" />);
    expect(screen.getByText("S'inscrire avec Google")).toBeInTheDocument();
  });

  it("shows loading state when clicked", async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue(
      mockClient({ signInWithOAuth: mockSignIn })
    );

    render(<GoogleOAuthButton mode="login" />);
    fireEvent.click(screen.getByText("Continuer avec Google"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("shows error message on failure", async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      error: { message: "OAuth failed" },
    });
    vi.mocked(createClient).mockReturnValue(
      mockClient({ signInWithOAuth: mockSignIn })
    );

    render(<GoogleOAuthButton mode="login" />);
    fireEvent.click(screen.getByText("Continuer avec Google"));

    await waitFor(() => {
      expect(screen.getByText("OAuth failed")).toBeInTheDocument();
    });
  });
});
