// components/ZoneForm.tsx

import React, { useState } from 'react';
import { zoneService } from '../services/zoneService';
import { UpdateZoneRequest, Zone } from '../types/zoneTypes';
import { Button } from 'src/components/ui/button';
import { X } from 'lucide-react';

interface ZoneFormProps {
  zone: Zone;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ZoneForm: React.FC<ZoneFormProps> = ({
  zone,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<UpdateZoneRequest>({
    radius_km: zone.radius_km,
    max_drivers_to_notify: zone.max_drivers_to_notify,
    notification_timeout_seconds: zone.notification_timeout_seconds,
    is_active: zone.is_active,
    description: zone.description,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await zoneService.updateZone(zone.zone_number, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-foreground">
            Edit Zone {zone.zone_number}
          </h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-error bg-lighterror p-4">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Radius (km) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="radius_km"
                value={formData.radius_km}
                onChange={handleChange}
                required
                min="0.1"
                step="0.1"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Max Drivers to Notify */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Drivers to Notify <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="max_drivers_to_notify"
                value={formData.max_drivers_to_notify}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Notification Timeout */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notification Timeout (seconds) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="notification_timeout_seconds"
                value={formData.notification_timeout_seconds}
                onChange={handleChange}
                required
                min="5"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label
                htmlFor="is_active"
                className="ml-2 block text-sm text-foreground"
              >
                Active
              </label>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter zone description"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Zone'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZoneForm;
