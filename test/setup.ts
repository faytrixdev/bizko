import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    React.createElement("img", { src: props.src, alt: (props.alt as string) ?? "" }),
}));