"use client";

import React from "react";

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
  variant?: "default" | "success" | "warning";
}

function getProgressColor(progress: number, variant?: string): string {
  if (variant === "success") return "bg-green-500";
  if (variant === "warning") return "bg-yellow-500";

  // Default: color based on progress level
  if (progress >= 100) return "bg-green-500";
  if (progress >= 50) return "bg-indigo-500";
  return "bg-yellow-500";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  className,
  variant,
}) => {
  const progressColor = getProgressColor(progress, variant);

  return (
    <div className={`w-full ${className ?? ""}`}>
      {label && (
        <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {label}
        </div>
      )}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
