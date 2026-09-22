import Link from "next/link";
import { COPYRIGHT_YEAR } from "@/lib/date-utils";

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {COPYRIGHT_YEAR} Motivate.me. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/about"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
