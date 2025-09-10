import React from "react";
import { Link, useRouteError } from "react-router-dom";
import { env } from "@/config/env";

export default function ErrorPage() {
  const error = useRouteError();

  // Log error in development only
  if (env.IS_DEV) {
    console.error("Route error:", error);
  }

  const message =
    error?.status === 404
      ? "The page you're looking for doesn't exist."
      : error?.statusText || error?.message || "An unexpected error occurred.";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-xl w-full bg-white dark:bg-slate-800 shadow-md rounded-lg p-8 text-center">
        <h1 className="text-4xl font-extrabold mb-2">Something went wrong</h1>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-4 py-2 rounded bg-indigo-600 text-white">
            Go to home
          </Link>
          <button className="px-4 py-2 rounded border" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
