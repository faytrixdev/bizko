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
    table(props) {
      const { children, ...rest } = props;
      return (
        <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-border">
          <table {...rest} className="w-full border-collapse bg-white text-left text-sm [&_tbody_tr]:border-t [&_tbody_tr]:border-border">
            {children}
          </table>
        </div>
      );
    },
    th(props) {
      return <th {...props} className="bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600" />;
    },
    td(props) {
      return <td {...props} className="px-4 py-3 align-top text-gray-700" />;
    },
  };
}