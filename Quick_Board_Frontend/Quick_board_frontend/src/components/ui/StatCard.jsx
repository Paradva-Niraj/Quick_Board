// src/components/ui/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    indigo: "bg-indigo-500"
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} rounded-lg p-3 mr-4`}>
          {icon && <div className="text-white text-2xl">{icon}</div>}
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;