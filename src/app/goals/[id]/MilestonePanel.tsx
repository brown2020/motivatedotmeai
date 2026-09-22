"use client";

import { useState } from "react";
import type { Goal, Milestone } from "@/types/goals";
import { formatDisplayDate } from "@/lib/date-utils";

type Props = {
  goal: Goal;
  onUpdateMilestones: (milestones: Milestone[]) => void;
};

export function MilestonePanel({ goal, onUpdateMilestones }: Props) {
  const [isEditingMilestone, setIsEditingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    name: "",
    targetDate: "",
    weight: 0,
  });

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const milestone: Milestone = {
      id: crypto.randomUUID(),
      name: newMilestone.name,
      targetDate: new Date(newMilestone.targetDate),
      completed: false,
      weight: newMilestone.weight || 0,
    };
    onUpdateMilestones([...(goal.milestones || []), milestone]);
    setIsEditingMilestone(false);
    setNewMilestone({ name: "", targetDate: "", weight: 0 });
  };

  const toggleMilestone = (milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    onUpdateMilestones(updatedMilestones);
  };

  return (
    <div className="bg-white shadow-sm sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
          <button
            type="button"
            onClick={() => setIsEditingMilestone(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Milestone
          </button>
        </div>

        {isEditingMilestone && (
          <form onSubmit={handleAddMilestone} className="mb-4">
            <div className="space-y-3">
              <div>
                <label htmlFor="milestoneName" className="block text-sm font-medium text-gray-700">
                  Milestone Name
                </label>
                <input
                  type="text"
                  id="milestoneName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newMilestone.name}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="milestoneDate" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="milestoneWeight" className="block text-sm font-medium text-gray-700">
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
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setNewMilestone({ ...newMilestone, weight: 0 });
                      return;
                    }
                    const parsed = Number(raw);
                    if (Number.isNaN(parsed)) return;
                    setNewMilestone({ ...newMilestone, weight: parsed });
                  }}
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
                    aria-label={`Mark milestone ${milestone.name} complete`}
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
                </div>
                <span className="text-sm text-gray-500">
                  {formatDisplayDate(milestone.targetDate)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
