"use client";

interface HabitCheckboxProps {
  habit: {
    name: string;
    completed: boolean;
  };
}

export function HabitCheckbox({ habit }: HabitCheckboxProps) {
  return (
    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        className="h-6 w-6 rounded-sm"
        checked={habit.completed}
        onChange={(e) => {
          // TODO: Update habit completion status in your state management
          console.log("Habit completed:", e.target.checked);
        }}
      />
      <span>{habit.name}</span>
    </label>
  );
}
