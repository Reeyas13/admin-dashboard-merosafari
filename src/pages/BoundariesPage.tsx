// pages/BoundariesPage.tsx - Updated with Icon Navigation

import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'src/components/ui/breadcrumb';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Card } from 'src/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';
import { BoundaryMapWithPolygons } from '../components/BoundaryMapWithPolygonsProps';
import { BoundaryStatsCards } from '../components/BoundaryStats';
import { BoundaryFiltersComponent } from '../components/BoundaryFilters';
import { BoundaryList } from '../components/BoundaryList';
import { PointChecker } from '../components/PointChecker';
import { useBoundaries } from '../hooks/useBoundaries';
import { Boundary, PointInPolygonResponse } from '../types/boundary';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  Car,
  DollarSign,
  Award,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BoundariesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    boundaries,
    stats,
    loading,
    error,
    filters,
    provinces,
    districts,
    types,
    updateFilters,
    clearFilters,
    toggleBoundary,
    refetch,
  } = useBoundaries();

  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [clickedPoint, setClickedPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Load Leaflet CSS and JS
  useEffect(() => {
    // Add Leaflet CSS
    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity =
        'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!document.querySelector('#leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity =
        'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      document.body.appendChild(script);
    }
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await toggleBoundary(id);
      if (selectedBoundary?.id === id) {
        setSelectedBoundary((prev) =>
          prev ? { ...prev, is_active: !prev.is_active } : null
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle boundary');
    }
  };

  const handleLocationFound = (
    lat: number,
    lng: number,
    response: PointInPolygonResponse
  ) => {
    setClickedPoint({ lat, lng });
    if (response.in_boundary && response.boundary) {
      setSelectedBoundary(response.boundary);
    } else {
      setSelectedBoundary(null);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setClickedPoint({ lat, lng });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-error bg-lighterror p-8 text-center">
          <p className="text-error font-medium mb-4">Error: {error}</p>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Location Boundaries</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Location Boundaries
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage service area boundaries across Nepal
            </p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/vehicle-management')}
                >
                  <Car className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Vehicles</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/pricing')}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Pricing</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/incentives')}
                >
                  <Award className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Incentives</p>
              </TooltipContent>
            </Tooltip>

            <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <BoundaryStatsCards stats={stats} loading={loading} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div
            className={`lg:col-span-3 space-y-6 transition-all ${
              showSidebar ? '' : 'hidden lg:block'
            }`}
          >
            {/* Point Checker */}
            <PointChecker onLocationFound={handleLocationFound} />

            {/* Filters */}
            <div className="rounded-lg border bg-card p-6">
              <BoundaryFiltersComponent
                filters={filters}
                onFilterChange={updateFilters}
                onClearFilters={clearFilters}
                provinces={provinces}
                districts={districts}
                types={types}
              />
            </div>

            {/* Results Count */}
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold">{boundaries.length}</span>{' '}
                of <span className="font-semibold">{stats?.total_boundaries || 0}</span>{' '}
                boundaries
              </p>
            </div>
          </div>

          {/* Map and List */}
          <div className={`${showSidebar ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6`}>
            {/* Toggle Sidebar Button (Mobile) */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Hide Filters
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Show Filters
                  </>
                )}
              </Button>
            </div>

            {/* Map */}
            <BoundaryMapWithPolygons
              boundaries={boundaries}
              selectedBoundary={selectedBoundary}
              onBoundarySelect={setSelectedBoundary}
              onMapClick={handleMapClick}
              height="500px"
              allowDrawing={false}
            />

            {/* Selected Boundary Info with Quick Actions */}
            {selectedBoundary && (
              <Card className="p-5 border-primary bg-lightprimary">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold text-lg text-primary">
                        {selectedBoundary.name}
                      </h3>
                      {selectedBoundary.polygon && (
                        <Badge variant="lightInfo">
                          <MapIcon className="h-3 w-3 mr-1" />
                          Polygon Mapped
                        </Badge>
                      )}
                      <Badge
                        variant={selectedBoundary.is_active ? 'success' : 'error'}
                      >
                        {selectedBoundary.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">District:</span>{' '}
                        <span className="font-medium">
                          {selectedBoundary.district}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Province:</span>{' '}
                        <span className="font-medium">
                          {selectedBoundary.province}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>{' '}
                        <span className="font-medium">{selectedBoundary.type}</span>
                      </div>
                      {selectedBoundary.polygon && (
                        <div>
                          <span className="text-muted-foreground">Points:</span>{' '}
                          <span className="font-medium">
                            {selectedBoundary.polygon.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    {selectedBoundary.is_active && (
                      <div className="flex flex-wrap gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/vehicle-management')}
                            >
                              <Car className="h-4 w-4 mr-2" />
                              Vehicles
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Manage vehicle types for this location</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/pricing')}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Pricing
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configure pricing and fare structures</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/incentives')}
                            >
                              <Award className="h-4 w-4 mr-2" />
                              Incentives
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Manage driver incentive programs</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  <Button
                    variant={
                      selectedBoundary.is_active ? 'lighterror' : 'lightsuccess'
                    }
                    size="sm"
                    onClick={() => handleToggle(selectedBoundary.id)}
                  >
                    {selectedBoundary.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Boundary List */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Boundaries List
              </h3>
              <BoundaryList
                boundaries={boundaries}
                selectedBoundary={selectedBoundary}
                onBoundarySelect={setSelectedBoundary}
                onToggle={handleToggle}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BoundariesPage;