"use client";

import React, { useId } from "react";
import { useAppStore } from "@/stores/app-store";

interface HabitCheckboxProps {
  habitId: string;
  name: string;
  completed: boolean;
}

const HabitCheckbox: React.FC<HabitCheckboxProps> = ({
  habitId,
  name,
  completed,
}) => {
  const id = useId();
  const toggleHabitCompletionToday = useAppStore(
    (s) => s.toggleHabitCompletionToday
  );

  return (
    <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <input
        id={id}
        type="checkbox"
        checked={completed}
        onChange={() => toggleHabitCompletionToday(habitId)}
        aria-label={`Mark ${name} complete for today`}
        className="w-5 h-5 text-indigo-600 rounded-sm border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:bg-gray-700"
      />
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {name}
      </label>
    </div>
  );
};

export default HabitCheckbox;
