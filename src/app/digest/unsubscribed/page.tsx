import { Metadata } from "next";
import Link from "next/link";
import { getServerMessages } from "@/lib/i18n/messages-server";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export const metadata: Metadata = {
  title: "Digest Unsubscribed",
};

export default async function UnsubscribedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const messages = await getServerMessages();
  const d = messages.digest.unsubscribe;

  const isSuccess = params.ok === "1";
  const errorType = params.error;

  let title: string;
  let description: string;

  if (isSuccess) {
    title = d.successTitle;
    description = d.successDescription;
  } else if (errorType === "invalid") {
    title = d.errorInvalidTitle;
    description = d.errorInvalidDescription;
  } else {
    title = d.errorServerTitle;
    description = d.errorServerDescription;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
            {isSuccess ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-600 mb-6">{description}</p>

          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {messages.common.choose}
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">{messages.landing.footerMadeWith}</p>
      </div>
    </main>
  );
}