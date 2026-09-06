import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { src, alt, fill, priority, ...rest } = props;
    return React.createElement("img", { src, alt: alt ?? "", ...rest });
  },
}));