"use client";

import React from "react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: "h-4 w-4",
  medium: "h-8 w-8",
  large: "h-12 w-12",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = "medium",
}) => {
  const spinner = (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg
        className="w-full h-full text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};