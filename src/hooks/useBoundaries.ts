// hooks/useBoundaries.ts - FIXED VERSION

import { useState, useEffect, useCallback } from 'react';
import { boundaryService } from '../services/boundaryService';
import { Boundary, BoundaryStats, BoundaryFilters } from '../types/boundary';

export const useBoundaries = () => {
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [filteredBoundaries, setFilteredBoundaries] = useState<Boundary[]>([]);
  const [stats, setStats] = useState<BoundaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BoundaryFilters>({});

  const fetchBoundaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [boundariesResponse, statsResponse] = await Promise.all([
        boundaryService.getBoundaries(),
        boundaryService.getStats(),
      ]);
      
      // Backend already sends polygon in correct format [[lat, lng], ...]
      // Just use it directly!
      setBoundaries(boundariesResponse.boundaries);
      setFilteredBoundaries(boundariesResponse.boundaries);
      setStats(statsResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch boundaries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoundaries();
  }, [fetchBoundaries]);

  // Apply filters
  useEffect(() => {
    let filtered = [...boundaries];

    if (filters.province) {
      filtered = filtered.filter((b) => b.province === filters.province);
    }

    if (filters.district) {
      filtered = filtered.filter((b) => b.district === filters.district);
    }

    if (filters.type) {
      filtered = filtered.filter((b) => b.type === filters.type);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter((b) => b.is_active === filters.isActive);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.district.toLowerCase().includes(query) ||
          b.province.toLowerCase().includes(query)
      );
    }

    setFilteredBoundaries(filtered);
  }, [boundaries, filters]);

  const toggleBoundary = useCallback(
    async (id: string) => {
      try {
        await boundaryService.toggleBoundary(id);
        // Update local state
        setBoundaries((prev) =>
          prev.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b))
        );
        // Refresh stats
        const statsResponse = await boundaryService.getStats();
        setStats(statsResponse);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to toggle boundary');
      }
    },
    []
  );

  const updateFilters = useCallback((newFilters: Partial<BoundaryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get unique districts and provinces
  const districts = Array.from(new Set(boundaries.map((b) => b.district))).sort();
  const provinces = Array.from(new Set(boundaries.map((b) => b.province))).sort();
  const types = Array.from(new Set(boundaries.map((b) => b.type))).sort();

  return {
    boundaries: filteredBoundaries,
    allBoundaries: boundaries,
    stats,
    loading,
    error,
    filters,
    districts,
    provinces,
    types,
    updateFilters,
    clearFilters,
    toggleBoundary,
    refetch: fetchBoundaries,
  };
};