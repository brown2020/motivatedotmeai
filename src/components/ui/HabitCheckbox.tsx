"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

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
  const { completeHabit } = useApp();

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => completeHabit(habitId)}
        className="w-5 h-5 text-blue-600 rounded-sm focus:ring-blue-500"
      />
      <label className="text-sm font-medium text-gray-700">{name}</label>
    </div>
  );
};

export default HabitCheckbox;
