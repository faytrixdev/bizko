export const MAX_TESTIMONIAL_CONTENT = 400;
export const MAX_TESTIMONIAL_NAME = 120;
export const MAX_TESTIMONIAL_ROLE = 120;

export type TestimonialInput = {
  authorName: string;
  authorRole?: string;
  content: string;
  rating?: number;
};

export function isRating(value: number): value is 1 | 2 | 3 | 4 | 5 {
  return value >= 1 && value <= 5;
}

export function isValidTestimonialInput(input: TestimonialInput): boolean {
  const nameOk = input.authorName.trim().length >= 1 && input.authorName.trim().length <= MAX_TESTIMONIAL_NAME;
  const roleOk = input.authorRole === undefined || input.authorRole.trim() === ""
    || (input.authorRole.trim().length >= 1 && input.authorRole.trim().length <= MAX_TESTIMONIAL_ROLE);
  const contentOk = input.content.trim().length >= 1 && input.content.trim().length <= MAX_TESTIMONIAL_CONTENT;
  const ratingOk = input.rating === undefined || isRating(input.rating);
  return nameOk && roleOk && contentOk && ratingOk;
}
