// pages/ZonesPage.tsx

import React, { useState, useEffect } from 'react';
import { zoneService } from '../services/zoneService';
import { Zone } from '../types/zoneTypes';
import { ZoneForm } from '../components/ZoneForm';
import { Button } from 'src/components/ui/button';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';

export const ZonesPage: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchZones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await zoneService.getZones();
      setZones(response.zones);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleEdit = (zone: Zone) => {
    setSelectedZone(zone);
    setShowForm(true);
  };

  const handleDelete = async (zone: Zone) => {
    if (!window.confirm(`Are you sure you want to delete Zone ${zone.zone_number}?`)) {
      return;
    }

    try {
      await zoneService.deleteZone(zone.zone_number);
      fetchZones();
    } catch (err: any) {
      alert(err.message || 'Failed to delete zone');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedZone(null);
    fetchZones();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedZone(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Zone Management</h1>
        <Button
          onClick={fetchZones}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-error bg-lighterror p-4 mb-6">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading zones...</div>
        </div>
      ) : zones.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No zones found</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Zone #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Radius (km)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Max Drivers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Timeout (s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Updated At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">
                        {zone.zone_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{zone.radius_km}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">
                        {zone.max_drivers_to_notify}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">
                        {zone.notification_timeout_seconds}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          zone.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground line-clamp-2">
                        {zone.description}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(zone.updated_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(zone)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Edit zone"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(zone)}
                          className="text-error hover:text-error/80 transition-colors"
                          title="Delete zone"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && selectedZone && (
        <ZoneForm
          zone={selectedZone}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default ZonesPage;
