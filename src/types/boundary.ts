// types/boundary.ts

export interface Timestamp {
  seconds: number;
  nanos: number;
}

export interface Boundary {
  id: string;
  name: string;
  district: string;
  province: string;
  type: string;
  center_lat: number;
  center_lng: number;
  is_active: boolean;
  created_at: Timestamp | null;
  // Polygon coordinates (array of [lat, lng] pairs)
  polygon?: number[][];
}

export interface BoundariesResponse {
  boundaries: Boundary[];
}

export interface BoundaryStats {
  total_boundaries: number;
  active_boundaries: number;
  inactive_boundaries: number;
  provinces_covered: number;
  districts_covered: number;
}

export interface PointInPolygonRequest {
  latitude: number;
  longitude: number;
}

export interface PointInPolygonResponse {
  in_boundary: boolean;
  boundary?: Boundary;
}

export interface ToggleBoundaryResponse {
  message: string;
  is_active: boolean;
  boundary: Boundary;
}

export interface BoundaryFilters {
  province?: string;
  district?: string;
  type?: string;
  isActive?: boolean;
  searchQuery?: string;
}

// For drawing new boundaries
export interface CreateBoundaryRequest {
  name: string;
  district: string;
  province: string;
  type: string;
  polygon: number[][];
  is_active?: boolean;
}

export const PROVINCES = [
  'Koshi',
  'Madhesh', 
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim'
] as const;

export const BOUNDARY_TYPES = [
  'Mahanagarpalika',
  'Upamahanagarpalika',
  'Nagarpalika',
  'Gaunpalika'
] as const;

export type Province = typeof PROVINCES[number];
export type BoundaryType = typeof BOUNDARY_TYPES[number];