import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white dark:bg-slate-800 shadow-md rounded-lg p-8 text-center">
        <h1 className="text-6xl font-extrabold mb-2">404</h1>
        <p className="mb-4 text-lg text-slate-600 dark:text-slate-300">Page not found</p>
        <Link to="/" className="px-4 py-2 rounded bg-indigo-600 text-white">
          Return home
        </Link>
      </div>
    </div>
  );
}
