import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { slugify } from "@/lib/blog/text";

function headingId(children: ReactNode): string | undefined {
  if (typeof children === "string") return slugify(children);
  return undefined;
}

export function useMDXComponents(): MDXComponents {
  return {
    h2(props) {
      const id = headingId(props.children);
      return <h2 id={id} className="scroll-mt-24" {...props} />;
    },
    h3(props) {
      const id = headingId(props.children);
      return <h3 id={id} className="scroll-mt-24" {...props} />;
    },
  };
}