"use client";

import { QUICKSTART_TEMPLATES } from "@/lib/quickstart-templates";

export function QuickstartTemplatePicker({
  isOpen,
  onClose,
  onPick,
  title = "Choose a template",
  description = "Create a goal + starter habits in seconds.",
}: {
  isOpen: boolean;
  onClose: () => void;
  onPick: (templateId: string) => Promise<void>;
  title?: string;
  description?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICKSTART_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className="text-left rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="text-sm font-semibold text-gray-900">
                {t.title}
              </div>
              <div className="mt-1 text-sm text-gray-600">{t.description}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 capitalize">
                  {t.category}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700 capitalize">
                  {t.priority} priority
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700">
                  {t.durationWeeks} weeks
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
