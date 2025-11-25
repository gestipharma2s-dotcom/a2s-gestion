import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{value}</h3>
          <p className="text-sm text-gray-500">{change}</p>
        </div>
        <div className={`w-14 h-14 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="text-white" size={28} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;