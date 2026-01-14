
import React from 'react';
import { Button } from 'src/components/ui/button';
import { BoundaryFilters as Filters } from '../types/boundary';
import { Search, X, Filter } from 'lucide-react';

interface BoundaryFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
  provinces: string[];
  districts: string[];
  types: string[];
}

export const BoundaryFiltersComponent: React.FC<BoundaryFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  provinces,
  districts,
  types,
}) => {
  const hasActiveFilters =
    filters.province ||
    filters.district ||
    filters.type ||
    filters.isActive !== undefined ||
    filters.searchQuery;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-error hover:text-error"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, district, province..."
          value={filters.searchQuery || ''}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Province Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Province
        </label>
        <select
          value={filters.province || ''}
          onChange={(e) =>
            onFilterChange({ province: e.target.value || undefined })
          }
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">All Provinces</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* District Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          District
        </label>
        <select
          value={filters.district || ''}
          onChange={(e) =>
            onFilterChange({ district: e.target.value || undefined })
          }
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">All Districts</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Type
        </label>
        <select
          value={filters.type || ''}
          onChange={(e) => onFilterChange({ type: e.target.value || undefined })}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Status
        </label>
        <select
          value={
            filters.isActive === undefined
              ? ''
              : filters.isActive
              ? 'active'
              : 'inactive'
          }
          onChange={(e) =>
            onFilterChange({
              isActive:
                e.target.value === ''
                  ? undefined
                  : e.target.value === 'active',
            })
          }
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>
    </div>
  );
};

export default BoundaryFiltersComponent;
