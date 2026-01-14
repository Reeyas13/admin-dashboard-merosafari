// components/BoundaryMap.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Boundary } from '../types/boundary';
import { NEPAL_BOUNDS, getBoundaryColor, getMarkerIcon } from '../utils/mapUtils';
import 'leaflet/dist/leaflet.css';
// Leaflet imports (will be loaded via CDN)
declare global {
  interface Window {
    L: any;
  }
}

interface BoundaryMapProps {
  boundaries: Boundary[];
  selectedBoundary?: Boundary | null;
  onBoundarySelect?: (boundary: Boundary) => void;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
}

export const BoundaryMap: React.FC<BoundaryMapProps> = ({
  boundaries,
  selectedBoundary,
  onBoundarySelect,
  onMapClick,
  height = '600px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

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

      // Handle map clicks
      if (onMapClick) {
        map.on('click', (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

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
  }, [onMapClick]);

  // Update markers when boundaries change
  useEffect(() => {
    if (!mapInstance.current || !isMapReady || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    boundaries.forEach((boundary) => {
      const isSelected = selectedBoundary?.id === boundary.id;
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

      // Popup content
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
        if (onBoundarySelect) {
          onBoundarySelect(boundary);
        }
      });

      marker.addTo(mapInstance.current);
      markersRef.current.push(marker);
    });
  }, [boundaries, selectedBoundary, isMapReady, onBoundarySelect]);

  // Zoom to selected boundary
  useEffect(() => {
    if (!mapInstance.current || !selectedBoundary) return;

    mapInstance.current.setView(
      [selectedBoundary.center_lat, selectedBoundary.center_lng],
      12,
      { animate: true }
    );
  }, [selectedBoundary]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
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

export default BoundaryMap;