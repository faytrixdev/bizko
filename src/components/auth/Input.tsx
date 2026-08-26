export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`h-11 w-full rounded-lg border bg-white px-4 text-[14px] placeholder:text-gray-400 outline-none transition
        ${error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10" : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"}
        ${className}`}
    />
  );
}
