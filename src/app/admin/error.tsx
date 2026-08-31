"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-lg font-semibold text-gray-900 mb-2">Quelque chose s&apos;est mal passé</h1>
      <p className="text-sm text-gray-500 mb-4">{error.message}</p>
      <button onClick={reset} className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:no-underline">
        Réessayer
      </button>
    </div>
  );
}
