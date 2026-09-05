import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TestimonialCard } from "../TestimonialCard";

afterEach(() => {
  cleanup();
});

const testimonial = {
  id: "t1",
  authorName: "Awa",
  authorRole: "CEO, Studio D",
  content: "Une prestation exceptionnelle",
  rating: 5 as const,
};

describe("TestimonialCard", () => {
  it("renders author, role, content and 5 stars", () => {
    render(<TestimonialCard testimonial={testimonial} starLabel="stars" />);
    expect(screen.getByText("Awa")).toBeInTheDocument();
    expect(screen.getByText("CEO, Studio D")).toBeInTheDocument();
    expect(screen.getByText("Une prestation exceptionnelle")).toBeInTheDocument();
  });
  it("renders no stars when rating is absent", () => {
    const { container } = render(
      <TestimonialCard testimonial={{ ...testimonial, rating: undefined }} starLabel="stars" />
    );
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });
});