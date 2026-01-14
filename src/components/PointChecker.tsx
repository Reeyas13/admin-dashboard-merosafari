// components/PointChecker.tsx

import React, { useState } from 'react';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { boundaryService } from '../services/boundaryService';
import { PointInPolygonResponse } from '../types/boundary';
import { MapPin, Pin, Search, X } from 'lucide-react';

interface PointCheckerProps {
  onLocationFound?: (lat: number, lng: number, response: PointInPolygonResponse) => void;
}

export const PointChecker: React.FC<PointCheckerProps> = ({ onLocationFound }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PointInPolygonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid coordinates');
      return;
    }

    if (lat < 26 || lat > 31 || lng < 80 || lng > 89) {
      setError('Coordinates must be within Nepal bounds');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await boundaryService.checkPointInPolygon({
        latitude: lat,
        longitude: lng,
      });
      setResult(response);

      if (onLocationFound) {
        onLocationFound(lat, lng, response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check point');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLatitude('');
    setLongitude('');
    setResult(null);
    setError(null);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLoading(false);
      },
      (err) => {
        setError('Failed to get current location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Check Point Location
        </h3>
        {(latitude || longitude || result) && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Enter coordinates to check which boundary contains the point
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="26.6653"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="87.2782"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleCheck}
          disabled={loading || !latitude || !longitude}
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Checking...' : 'Check Location'}
        </Button>
        <Button
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={loading}
        >
          <MapPin className="h-4 w-4 mr-2" />
          <Pin />
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-lighterror p-4">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.in_boundary
              ? 'border-success bg-lightsuccess'
              : 'border-warning bg-lightwarning'
          }`}
        >
          {result.in_boundary && result.boundary ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="success">Found</Badge>
                <span className="font-semibold text-success">
                  Point is within a boundary
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="font-medium">Name:</span> {result.boundary.name}
                </p>
                <p>
                  <span className="font-medium">District:</span>{' '}
                  {result.boundary.district}
                </p>
                <p>
                  <span className="font-medium">Province:</span>{' '}
                  {result.boundary.province}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {result.boundary.type}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge
                    variant={result.boundary.is_active ? 'success' : 'error'}
                  >
                    {result.boundary.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="warning">Not Found</Badge>
              <span className="font-semibold text-warning">
                Point is not within any boundary
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PointChecker;