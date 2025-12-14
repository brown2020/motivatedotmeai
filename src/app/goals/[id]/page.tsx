"use client";

import { useAppStore } from "@/stores/app-store";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { GoalInsights } from "@/components/GoalInsights";
import { GoalAiCoach } from "@/components/GoalAiCoach";
import { useState } from "react";
import { Milestone } from "@/types/goals";

export default function GoalDetailsPage() {
  const goals = useAppStore((s) => s.goals);
  const updateGoal = useAppStore((s) => s.updateGoal);
  const deleteGoal = useAppStore((s) => s.deleteGoal);
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;
  const goal = goals.find((g) => g.id === goalId);

  const [isEditingMilestone, setIsEditingMilestone] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    name: "",
    targetDate: "",
    weight: 0,
  });

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Goal not found
            </h3>
          </div>
        </main>
      </div>
    );
  }

  const handleProgressUpdate = (newProgress: number) => {
    void updateGoal({
      ...goal,
      progress: Math.min(100, Math.max(0, newProgress)),
      lastUpdated: new Date(),
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const milestone: Milestone = {
      id: crypto.randomUUID(),
      name: newMilestone.name,
      targetDate: new Date(newMilestone.targetDate),
      completed: false,
      weight: newMilestone.weight || 0,
    };
    void updateGoal({
      ...goal,
      milestones: [...goal.milestones, milestone],
      lastUpdated: new Date(),
    });
    setIsEditingMilestone(false);
    setNewMilestone({ name: "", targetDate: "", weight: 0 });
  };

  const toggleMilestone = (milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    void updateGoal({
      ...goal,
      milestones: updatedMilestones,
      lastUpdated: new Date(),
    });
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;
    setIsDeleting(true);
    try {
      await deleteGoal(goal.id);
      router.push("/goals");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 truncate">
                {goal.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{goal.reason}</p>
            </div>
            <button
              onClick={handleDeleteGoal}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-xs bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50"
            >
              {isDeleting ? "Deleting…" : "Delete goal"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - Goal Details and Progress */}
          <div className="space-y-6">
            {/* Progress Update */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Progress
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {goal.progress}%
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleProgressUpdate(goal.progress - 10)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleProgressUpdate(goal.progress + 10)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      +10%
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Goal Information */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Details
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Category
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {goal.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Priority
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {goal.priority}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Due Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(goal.endDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        goal.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : goal.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : goal.status === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(goal.status || "not_started").replace("_", " ")}
                    </span>
                  </dd>
                </div>
              </dl>
              {goal.tags?.length > 0 && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap gap-2">
                      {goal.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Milestones and Analytics */}
          <div className="space-y-6">
            {/* Milestones */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Milestones
                </h2>
                <button
                  onClick={() => setIsEditingMilestone(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Add Milestone
                </button>
              </div>

              {isEditingMilestone && (
                <form onSubmit={handleAddMilestone} className="mb-4">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="milestoneName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Milestone Name
                      </label>
                      <input
                        type="text"
                        id="milestoneName"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newMilestone.name}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="milestoneDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Target Date
                      </label>
                      <input
                        type="date"
                        id="milestoneDate"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newMilestone.targetDate}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            targetDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="milestoneWeight"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Progress Weight (%)
                      </label>
                      <input
                        type="number"
                        id="milestoneWeight"
                        required
                        min="0"
                        max="100"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newMilestone.weight}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            weight: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingMilestone(false)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <ul className="divide-y divide-gray-200">
                {goal.milestones.map((milestone) => (
                  <li key={milestone.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => toggleMilestone(milestone.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-sm"
                        />
                        <span
                          className={`ml-3 text-sm ${
                            milestone.completed
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {milestone.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({milestone.weight}%)
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(milestone.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Goal Insights */}
            <GoalInsights goalId={goalId} />

            {/* AI Coach */}
            <GoalAiCoach goalId={goalId} />
          </div>
        </div>
      </main>
    </div>
  );
}
