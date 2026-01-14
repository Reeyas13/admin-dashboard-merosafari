import React from 'react';
import { BoundaryStats as Stats } from '../types/boundary';
import { MapPin, CheckCircle, XCircle, Map, Building2 } from 'lucide-react';

interface BoundaryStatsProps {
  stats: Stats | null;
  loading?: boolean;
}

export const BoundaryStatsCards: React.FC<BoundaryStatsProps> = ({
  stats,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Boundaries',
      value: stats.total_boundaries,
      icon: MapPin,
      color: 'primary',
      bgColor: 'bg-lightprimary',
      textColor: 'text-primary',
    },
    {
      label: 'Active',
      value: stats.active_boundaries,
      icon: CheckCircle,
      color: 'success',
      bgColor: 'bg-lightsuccess',
      textColor: 'text-success',
    },
    {
      label: 'Inactive',
      value: stats.inactive_boundaries,
      icon: XCircle,
      color: 'error',
      bgColor: 'bg-lighterror',
      textColor: 'text-error',
    },
    {
      label: 'Provinces',
      value: stats.provinces_covered,
      icon: Map,
      color: 'info',
      bgColor: 'bg-lightinfo',
      textColor: 'text-info',
    },
    {
      label: 'Districts',
      value: stats.districts_covered,
      icon: Building2,
      color: 'warning',
      bgColor: 'bg-lightwarning',
      textColor: 'text-warning',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div
                className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}
              >
                <Icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoundaryStatsCards;