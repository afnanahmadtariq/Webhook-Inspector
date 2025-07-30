import React from 'react';
import { Activity, Globe, Clock, Zap } from 'lucide-react';
import type { WebhookStats } from '../types/webhook';

interface DashboardHeaderProps {
  stats: WebhookStats;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Endpoints',
      value: stats.totalEndpoints,
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Endpoints',
      value: stats.activeEndpoints,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Requests Today',
      value: stats.requestsToday,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Webhook Inspector</h1>
          <p className="text-gray-600 mt-2">
            Monitor, debug, and test your webhook integrations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
