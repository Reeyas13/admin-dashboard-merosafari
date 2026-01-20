// utils/polygonUtils.ts

import { Boundary } from '../types/boundary';

/**
 * Generate a mock polygon around a center point
 * This creates a roughly circular polygon for demonstration
 * In production, you'd fetch actual boundary polygon data
 */
export const generateMockPolygon = (
  centerLat: number,
  centerLng: number,
  radiusKm: number = 5
): number[][] => {
  const points: number[][] = [];
  const numPoints = 12; // Create a 12-sided polygon

  // Approximate degrees per km (varies with latitude)
  const latPerKm = 1 / 111; // 1 degree latitude ≈ 111 km
  const lngPerKm = 1 / (111 * Math.cos((centerLat * Math.PI) / 180));

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const latOffset = radiusKm * latPerKm * Math.sin(angle);
    const lngOffset = radiusKm * lngPerKm * Math.cos(angle);

    points.push([centerLat + latOffset, centerLng + lngOffset]);
  }

  // Close the polygon
  points.push(points[0]);

  return points;
};

/**
 * Add mock polygons to boundaries that don't have them
 * This is for demonstration purposes
 */
export const addMockPolygonsToBoundaries = (boundaries: Boundary[]): Boundary[] => {
  return boundaries.map((boundary) => {
    if (boundary.polygon && boundary.polygon.length > 0) {
      return boundary; // Already has a polygon
    }

    // Generate a mock polygon based on boundary type
    let radiusKm = 5; // Default radius
    switch (boundary.type) {
      case 'Mahanagarpalika':
        radiusKm = 15; // Largest
        break;
      case 'Upamahanagarpalika':
        radiusKm = 10;
        break;
      case 'Nagarpalika':
        radiusKm = 7;
        break;
      case 'Gaunpalika':
        radiusKm = 5; // Smallest
        break;
    }

    return {
      ...boundary,
      polygon: generateMockPolygon(
        boundary.center_lat,
        boundary.center_lng,
        radiusKm
      ),
    };
  });
};

/**
 * Calculate the center point of a polygon
 */
export const calculatePolygonCenter = (polygon: number[][]): {
  lat: number;
  lng: number;
} => {
  if (!polygon || polygon.length === 0) {
    return { lat: 0, lng: 0 };
  }

  let latSum = 0;
  let lngSum = 0;
  const count = polygon.length;

  polygon.forEach(([lat, lng]) => {
    latSum += lat;
    lngSum += lng;
  });

  return {
    lat: latSum / count,
    lng: lngSum / count,
  };
};

/**
 * Calculate the area of a polygon in square kilometers (approximate)
 */
export const calculatePolygonArea = (polygon: number[][]): number => {
  if (!polygon || polygon.length < 3) return 0;

  let area = 0;
  const n = polygon.length - 1; // Exclude last point if it's the same as first

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i][0] * polygon[j][1];
    area -= polygon[j][0] * polygon[i][1];
  }

  area = Math.abs(area) / 2;

  // Convert from square degrees to approximate square kilometers
  // This is a rough approximation
  const avgLat = polygon.reduce((sum, [lat]) => sum + lat, 0) / polygon.length;
  const latKm = 111;
  const lngKm = 111 * Math.cos((avgLat * Math.PI) / 180);
  
  return area * latKm * lngKm;
};

/**
 * Simplify a polygon by removing points (Douglas-Peucker algorithm simplified)
 */
export const simplifyPolygon = (
  polygon: number[][],
  // tolerance: number = 0.001
): number[][] => {
  if (polygon.length <= 3) return polygon;

  // Simple implementation - keep every nth point
  const step = Math.max(1, Math.floor(polygon.length / 50)); // Keep ~50 points max
  const simplified: number[][] = [];

  for (let i = 0; i < polygon.length; i += step) {
    simplified.push(polygon[i]);
  }

  // Ensure first and last points are included
  if (simplified[simplified.length - 1] !== polygon[polygon.length - 1]) {
    simplified.push(polygon[polygon.length - 1]);
  }

  return simplified;
};

/**
 * Validate if a polygon is valid (has at least 3 points)
 */
export const isValidPolygon = (polygon: number[][]): boolean => {
  if (!polygon || polygon.length < 3) return false;
  
  // Check if all points are valid coordinates
  return polygon.every(
    ([lat, lng]) =>
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
  );
};

/**
 * Convert polygon to GeoJSON format
 */
export const polygonToGeoJSON = (polygon: number[][]) => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [polygon.map(([lat, lng]) => [lng, lat])], // GeoJSON uses [lng, lat]
    },
    properties: {},
  };
};

/**
 * Get bounds of a polygon
 */
export const getPolygonBounds = (polygon: number[][]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} => {
  if (!polygon || polygon.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  polygon.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  return { minLat, maxLat, minLng, maxLng };
};