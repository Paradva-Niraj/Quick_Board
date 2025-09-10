import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  size = "default",
  message = "Loading...",
  fullscreen = true,   // if false → overlay style
  color = "text-blue-600"
}) => {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12",
  };

  const containerClasses = fullscreen
    ? "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"
    : "absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-50";

  return (
    <div className={`${containerClasses} animate-fadeIn`}>
      <div className="text-center">
        <Loader2
          className={`${sizeClasses[size]} animate-spin ${color} mx-auto mb-4`}
        />
        {message && <p className="text-gray-600 font-medium">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
