"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const profilePhotoURL = useAppStore((s) => s.user?.profilePhotoURL);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const avatarSrc =
    profilePhotoURL ||
    user?.photoURL ||
    "https://www.gravatar.com/avatar/?d=mp";

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                Motivate.me
              </span>
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/goals"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Goals
              </Link>
              <Link
                href="/habits"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Habits
              </Link>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative ml-3">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center rounded-full bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Image
                  width={32}
                  height={32}
                  className="rounded-full"
                  src={avatarSrc}
                  alt={user?.displayName || "User"}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    {user?.displayName}
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-700">
                    {user?.email}
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={signOut}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
