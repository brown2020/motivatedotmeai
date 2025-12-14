"use client";

import { useMemo, useRef, useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { ErrorAlert } from "./ErrorAlert";

export function GoalAiCoach({ goalId }: { goalId: string }) {
  const goal = useAppStore((s) => s.goals.find((g) => g.id === goalId));

  const abortRef = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");

  const payload = useMemo(() => {
    if (!goal) return null;

    return {
      goal: {
        id: goal.id,
        name: goal.name,
        reason: goal.reason,
        category: goal.category,
        priority: goal.priority,
        progress: goal.progress,
        status: goal.status,
        endDateISO: new Date(goal.endDate).toISOString(),
        lastUpdatedISO: goal.lastUpdated
          ? new Date(goal.lastUpdated).toISOString()
          : undefined,
        tags: goal.tags,
        milestones: goal.milestones.map((m) => ({
          id: m.id,
          name: m.name,
          targetDateISO: new Date(m.targetDate).toISOString(),
          completed: m.completed,
          weight: m.weight,
        })),
      },
    };
  }, [goal]);

  if (!goal) {
    return <ErrorAlert message="Goal not found" />;
  }

  const run = async () => {
    if (!payload) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setOutput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/goal-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    await run();
  };

  const handleRegenerate = async () => {
    await run();
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Coach</h3>
          <p className="mt-1 text-sm text-gray-600">
            Get tailored next steps based on your goal status and milestones.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isLoading ? (
            <button
              onClick={handleStop}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
            >
              Stop
            </button>
          ) : (
            <>
              <button
                onClick={handleGenerate}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700"
              >
                Generate
              </button>
              <button
                onClick={handleRegenerate}
                className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Regenerate
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorAlert message={error} />
        </div>
      )}

      <div className="mt-4">
        {isLoading && !output ? (
          <div className="text-sm text-gray-500">Thinking…</div>
        ) : output ? (
          <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-6">
            {output}
          </pre>
        ) : (
          <div className="text-sm text-gray-500">
            Click Generate to get coaching.
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Note: requires `OPENAI_API_KEY` on the server.
      </p>
    </section>
  );
}
