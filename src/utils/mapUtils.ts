// utils/mapUtils.ts

import { Boundary } from '../types/boundary';

// Nepal bounds for map initialization
export const NEPAL_BOUNDS = {
  center: { lat: 28.3949, lng: 84.124 } as const,
  zoom: 7,
  minZoom: 6,
  maxZoom: 18,
};

// Get color based on boundary type
export const getBoundaryColor = (type: string): string => {
  const colors: Record<string, string> = {
    Mahanagarpalika: '#ef4444', // red
    Upamahanagarpalika: '#f59e0b', // orange
    Nagarpalika: '#3b82f6', // blue
    Gaunpalika: '#10b981', // green
  };
  return colors[type] || '#6b7280'; // gray as default
};

// Get marker icon HTML
export const getMarkerIcon = (boundary: Boundary, isSelected: boolean = false) => {
  const color = getBoundaryColor(boundary.type);
  const size = isSelected ? 40 : 30;
  const opacity = boundary.is_active ? 1 : 0.5;

  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      opacity: ${opacity};
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    ">
      <div style="
        width: ${size - 16}px;
        height: ${size - 16}px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `;
};

// Format timestamp
export const formatTimestamp = (timestamp: { seconds: number; nanos: number } | null): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate bounds for multiple boundaries
export const calculateBounds = (boundaries: Boundary[]): [[number, number], [number, number]] | null => {
  if (boundaries.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  boundaries.forEach((b) => {
    if (b.center_lat < minLat) minLat = b.center_lat;
    if (b.center_lat > maxLat) maxLat = b.center_lat;
    if (b.center_lng < minLng) minLng = b.center_lng;
    if (b.center_lng > maxLng) maxLng = b.center_lng;
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
};

// Search boundaries by coordinates
export const findNearestBoundary = (
  boundaries: Boundary[],
  lat: number,
  lng: number,
  maxDistance: number = 0.5
): Boundary | null => {
  let nearest: Boundary | null = null;
  let minDistance = Infinity;

  boundaries.forEach((boundary) => {
    const distance = Math.sqrt(
      Math.pow(boundary.center_lat - lat, 2) + Math.pow(boundary.center_lng - lng, 2)
    );

    if (distance < minDistance && distance <= maxDistance) {
      minDistance = distance;
      nearest = boundary;
    }
  });

  return nearest;
};