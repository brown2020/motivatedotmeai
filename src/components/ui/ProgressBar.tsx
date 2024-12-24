"use client";

import React from "react";

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  className,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
