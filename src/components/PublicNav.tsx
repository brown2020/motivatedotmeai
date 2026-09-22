import Link from "next/link";

export function PublicNav() {
  return (
    <nav className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Motivate.me
        </Link>
        <Link
          href="/signin"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
