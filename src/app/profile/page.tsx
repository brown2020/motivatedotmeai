"use client";

import Header from "@/components/Header";
import { ErrorAlert } from "@/components/ErrorAlert";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAppStore } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { storage } from "@/lib/firebase";
import Image from "next/image";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useMemo, useState } from "react";

export default function ProfilePage() {
  const authUser = useAuthStore((s) => s.user);
  const user = useAppStore((s) => s.user);
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);
  const setUserPreferences = useAppStore((s) => s.setUserPreferences);
  const setProfilePhotoURL = useAppStore((s) => s.setProfilePhotoURL);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const preferences = user?.preferences;

  const canRender = useMemo(() => {
    return Boolean(authUser?.uid) && !loading.user;
  }, [authUser?.uid, loading.user]);

  const updatePreferences = async (
    patch: Partial<NonNullable<typeof preferences>>
  ) => {
    if (!preferences) return;
    setIsSaving(true);
    try {
      await setUserPreferences({ ...preferences, ...patch });
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSrc =
    user?.profilePhotoURL ||
    authUser?.photoURL ||
    "https://www.gravatar.com/avatar/?d=mp";

  const handleProfilePhoto = async (file: File) => {
    if (!authUser?.uid) return;
    if (!file.type.startsWith("image/")) {
      throw new Error("Please choose an image file.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be under 5MB.");
    }

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `profile-${crypto.randomUUID()}.${ext}`;
      const objectRef = ref(
        storage,
        `users/${authUser.uid}/profile/${fileName}`
      );
      await uploadBytes(objectRef, file, {
        contentType: file.type,
        cacheControl: "public,max-age=3600",
      });
      const url = await getDownloadURL(objectRef);
      await setProfilePhotoURL(url);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your preferences and account settings
          </p>
        </div>

        {error && (
          <div className="mt-6 px-4 sm:px-0">
            <ErrorAlert message={error.message} onClose={clearError} />
          </div>
        )}

        {!canRender ? (
          <div className="mt-10 px-4 sm:px-0">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mt-6 space-y-6 px-4 sm:px-0">
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900">Account</h2>
              <div className="mt-4 flex items-center gap-4">
                <Image
                  src={avatarSrc}
                  alt={authUser?.displayName || "User"}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center gap-3">
                    <span className="text-sm text-gray-700">Profile photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          await handleProfilePhoto(file);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          // reset so selecting same file again triggers change
                          e.target.value = "";
                        }
                      }}
                      className="text-sm"
                    />
                  </label>
                  {isUploading && (
                    <div className="text-sm text-gray-500">Uploading…</div>
                  )}
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {authUser?.displayName || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {authUser?.email || "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900">Preferences</h2>

              <div className="mt-4 space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700">Dark mode</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={Boolean(preferences?.darkMode)}
                    disabled={isSaving}
                    onChange={(e) =>
                      updatePreferences({ darkMode: e.target.checked })
                    }
                  />
                </label>

                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700">Notifications</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={Boolean(preferences?.notifications)}
                    disabled={isSaving}
                    onChange={(e) =>
                      updatePreferences({ notifications: e.target.checked })
                    }
                  />
                </label>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-700">
                      Daily reminder time (optional)
                    </span>
                    <input
                      type="time"
                      className="rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      disabled={isSaving}
                      value={preferences?.reminderTimes?.[0] || ""}
                      onChange={(e) =>
                        updatePreferences({ reminderTimes: [e.target.value] })
                      }
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This stores a preference only; wiring push notifications can
                    be added next.
                  </p>
                </div>
              </div>

              {isSaving && (
                <div className="mt-4 text-sm text-gray-500">Saving…</div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
