// components/BoundaryMapWithPolygons.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Boundary } from '../types/boundary';
import { NEPAL_BOUNDS, getBoundaryColor, getMarkerIcon } from '../utils/mapUtils';
import { Button } from 'src/components/ui/button';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Leaflet imports (will be loaded via CDN)
declare global {
  interface Window {
    L: any;
  }
}

interface BoundaryMapWithPolygonsProps {
  boundaries: Boundary[];
  selectedBoundary?: Boundary | null;
  onBoundarySelect?: (boundary: Boundary) => void;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  allowDrawing?: boolean;
  onPolygonDrawn?: (polygon: number[][]) => void;
}

export const BoundaryMapWithPolygons: React.FC<BoundaryMapWithPolygonsProps> = ({
  boundaries,
  selectedBoundary,
  onBoundarySelect,
  onMapClick,
  height = '600px',
  allowDrawing = true,
  onPolygonDrawn,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polygonsRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<any>(null);
  const drawingPointsRef = useRef<number[][]>([]);
  const tempMarkersRef = useRef<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = () => {
      if (!window.L) {
        console.error('Leaflet not loaded');
        return;
      }

      const map = window.L.map(mapRef.current).setView(
        [NEPAL_BOUNDS.center.lat, NEPAL_BOUNDS.center.lng],
        NEPAL_BOUNDS.zoom
      );

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: NEPAL_BOUNDS.maxZoom,
        minZoom: NEPAL_BOUNDS.minZoom,
      }).addTo(map);

      // Handle map clicks (for drawing or regular clicks)
      map.on('click', (e: any) => {
        if (drawingMode) {
          handleDrawingClick(e.latlng);
        } else if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstance.current = map;
      setIsMapReady(true);
    };

    // Check if Leaflet is already loaded
    if (window.L) {
      initMap();
    } else {
      // Wait for Leaflet to load
      const checkLeaflet = setInterval(() => {
        if (window.L) {
          clearInterval(checkLeaflet);
          initMap();
        }
      }, 100);

      return () => clearInterval(checkLeaflet);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Handle drawing mode clicks
  const handleDrawingClick = (latlng: any) => {
    if (!mapInstance.current || !window.L) return;

    const point: number[] = [latlng.lat, latlng.lng];
    drawingPointsRef.current.push(point);

    // Add a marker for the point
    const marker = window.L.circleMarker(latlng, {
      radius: 5,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 1,
    }).addTo(mapInstance.current);

    tempMarkersRef.current.push(marker);

    // If we have at least 2 points, draw temporary lines
    if (drawingPointsRef.current.length >= 2) {
      const polyline = window.L.polyline(drawingPointsRef.current, {
        color: '#3b82f6',
        weight: 2,
        dashArray: '5, 5',
      }).addTo(mapInstance.current);

      tempMarkersRef.current.push(polyline);
    }
  };

  // Start drawing mode
  const startDrawing = () => {
    setDrawingMode(true);
    drawingPointsRef.current = [];
    // Clear any existing temporary markers
    tempMarkersRef.current.forEach((m) => m.remove());
    tempMarkersRef.current = [];
    if (drawnPolygon) {
      drawnPolygon.remove();
      setDrawnPolygon(null);
    }
  };

  // Finish drawing
  const finishDrawing = () => {
    if (!mapInstance.current || !window.L) return;

    if (drawingPointsRef.current.length < 3) {
      alert('Please draw at least 3 points to create a polygon');
      return;
    }

    // Close the polygon by connecting to first point
    const polygonPoints = [...drawingPointsRef.current, drawingPointsRef.current[0]];

    // Create the polygon
    const polygon = window.L.polygon(polygonPoints, {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.2,
      weight: 2,
    }).addTo(mapInstance.current);

    setDrawnPolygon(polygon);

    // Clear temporary markers
    tempMarkersRef.current.forEach((m) => m.remove());
    tempMarkersRef.current = [];

    // Notify parent component
    if (onPolygonDrawn) {
      onPolygonDrawn(drawingPointsRef.current);
    }

    setDrawingMode(false);
  };

  // Cancel drawing
  const cancelDrawing = () => {
    setDrawingMode(false);
    drawingPointsRef.current = [];
    tempMarkersRef.current.forEach((m) => m.remove());
    tempMarkersRef.current = [];
  };

  // Clear drawn polygon
  const clearPolygon = () => {
    if (drawnPolygon) {
      drawnPolygon.remove();
      setDrawnPolygon(null);
    }
    drawingPointsRef.current = [];
  };

  // Update markers and polygons when boundaries change
  useEffect(() => {
    if (!mapInstance.current || !isMapReady || !window.L) return;

    // Clear existing markers and polygons
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    polygonsRef.current.forEach((polygon) => polygon.remove());
    polygonsRef.current = [];

    // Add new markers and polygons
    boundaries.forEach((boundary) => {
      const isSelected = selectedBoundary?.id === boundary.id;

      // Draw polygon if it exists
      if (boundary.polygon && boundary.polygon.length > 0) {
        const color = getBoundaryColor(boundary.type);
        const polygon = window.L.polygon(boundary.polygon, {
          color: color,
          fillColor: color,
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 3 : 2,
          opacity: boundary.is_active ? 1 : 0.5,
        });

        polygon.on('click', () => {
          if (onBoundarySelect && !drawingMode) {
            onBoundarySelect(boundary);
          }
        });

        // Popup for polygon
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${boundary.name}</h3>
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 4px 0;"><strong>District:</strong> ${boundary.district}</p>
              <p style="margin: 4px 0;"><strong>Province:</strong> ${boundary.province}</p>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${boundary.type}</p>
              <p style="margin: 4px 0;">
                <strong>Status:</strong> 
                <span style="color: ${boundary.is_active ? '#10b981' : '#ef4444'};">
                  ${boundary.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        `;

        polygon.bindPopup(popupContent);
        polygon.addTo(mapInstance.current);
        polygonsRef.current.push(polygon);
      }

      // Add center marker
      const icon = window.L.divIcon({
        html: getMarkerIcon(boundary, isSelected),
        className: 'custom-marker',
        iconSize: [isSelected ? 40 : 30, isSelected ? 40 : 30],
        iconAnchor: [isSelected ? 20 : 15, isSelected ? 20 : 15],
      });

      const marker = window.L.marker([boundary.center_lat, boundary.center_lng], {
        icon,
        title: boundary.name,
      });

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${boundary.name}</h3>
          <div style="font-size: 14px; color: #666;">
            <p style="margin: 4px 0;"><strong>District:</strong> ${boundary.district}</p>
            <p style="margin: 4px 0;"><strong>Province:</strong> ${boundary.province}</p>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${boundary.type}</p>
            <p style="margin: 4px 0;">
              <strong>Status:</strong> 
              <span style="color: ${boundary.is_active ? '#10b981' : '#ef4444'};">
                ${boundary.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onBoundarySelect && !drawingMode) {
          onBoundarySelect(boundary);
        }
      });

      marker.addTo(mapInstance.current);
      markersRef.current.push(marker);
    });
  }, [boundaries, selectedBoundary, isMapReady, onBoundarySelect, drawingMode]);

  // Zoom to selected boundary
  useEffect(() => {
    if (!mapInstance.current || !selectedBoundary) return;

    if (selectedBoundary.polygon && selectedBoundary.polygon.length > 0) {
      // Fit bounds to polygon
      const bounds = window.L.latLngBounds(selectedBoundary.polygon);
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Zoom to center point
      mapInstance.current.setView(
        [selectedBoundary.center_lat, selectedBoundary.center_lng],
        12,
        { animate: true }
      );
    }
  }, [selectedBoundary]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height, width: '100%', cursor: drawingMode ? 'crosshair' : 'grab' }}
        className="rounded-lg border shadow-sm"
      />

      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Drawing Controls */}
      {allowDrawing && isMapReady && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000] space-y-2">
          {!drawingMode && !drawnPolygon && (
            <Button
              onClick={startDrawing}
              size="sm"
              variant="default"
              className="w-full"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Draw Boundary
            </Button>
          )}

          {drawingMode && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Click to add points ({drawingPointsRef.current.length} points)
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={finishDrawing}
                  size="sm"
                  variant="success"
                  disabled={drawingPointsRef.current.length < 3}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Finish
                </Button>
                <Button onClick={cancelDrawing} size="sm" variant="error">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {drawnPolygon && !drawingMode && (
            <div className="space-y-2">
              <p className="text-xs text-success font-medium">
                Polygon drawn ({drawingPointsRef.current.length} points)
              </p>
              <Button
                onClick={clearPolygon}
                size="sm"
                variant="error"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="text-sm font-semibold mb-2">Boundary Types</h4>
        <div className="space-y-2">
          {[
            { type: 'Mahanagarpalika', label: 'Metropolitan' },
            { type: 'Upamahanagarpalika', label: 'Sub-Metropolitan' },
            { type: 'Nagarpalika', label: 'Municipality' },
            { type: 'Gaunpalika', label: 'Rural Municipality' },
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center gap-2">
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: getBoundaryColor(type),
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
              <span className="text-xs text-gray-700">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: '#6b7280',
                borderRadius: '50%',
                opacity: 0.5,
              }}
            />
            <span className="text-xs text-gray-700">Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoundaryMapWithPolygons;