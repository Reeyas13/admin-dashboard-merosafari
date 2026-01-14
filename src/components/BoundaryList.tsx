
import React from 'react';
import { Boundary } from '../types/boundary';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatTimestamp } from '../utils/mapUtils';

interface BoundaryListProps {
  boundaries: Boundary[];
  selectedBoundary?: Boundary | null;
  onBoundarySelect: (boundary: Boundary) => void;
  onToggle: (id: string) => void;
  loading?: boolean;
}

export const BoundaryList: React.FC<BoundaryListProps> = ({
  boundaries,
  selectedBoundary,
  onBoundarySelect,
  onToggle,
  loading,
}) => {
  const getTypeBadgeVariant = (type: string) => {
    const variants: Record<string, any> = {
      Mahanagarpalika: 'error',
      Upamahanagarpalika: 'warning',
      Nagarpalika: 'primary',
      Gaunpalika: 'success',
    };
    return variants[type] || 'default';
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (boundaries.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border bg-card">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No boundaries found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      {boundaries.map((boundary) => {
        const isSelected = selectedBoundary?.id === boundary.id;
        return (
          <div
            key={boundary.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary bg-lightprimary' : 'bg-card'
            }`}
            onClick={() => onBoundarySelect(boundary)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground truncate">
                    {boundary.name}
                  </h4>
                  <Badge variant={getTypeBadgeVariant(boundary.type)}>
                    {boundary.type}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">District:</span>{' '}
                    {boundary.district}
                  </p>
                  <p>
                    <span className="font-medium">Province:</span>{' '}
                    {boundary.province}
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">Coordinates:</span>{' '}
                    {boundary.center_lat.toFixed(4)},{' '}
                    {boundary.center_lng.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant={boundary.is_active ? 'success' : 'error'}
                  className="whitespace-nowrap"
                >
                  {boundary.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Button
                  variant={boundary.is_active ? 'lighterror' : 'lightsuccess'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(boundary.id);
                  }}
                  className="whitespace-nowrap"
                >
                  {boundary.is_active ? (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-1" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {boundary.created_at && (
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                Created: {formatTimestamp(boundary.created_at)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BoundaryList;
