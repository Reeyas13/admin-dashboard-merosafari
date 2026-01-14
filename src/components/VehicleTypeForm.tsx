// components/VehicleTypeForm.tsx

import React, { useState } from 'react';
import { vehicleTypeService } from '../services/vehicleTypeService';
import { CreateVehicleTypeRequest, VehicleType } from '../types/vehicleTypes';
import { Button } from 'src/components/ui/button';
import { X } from 'lucide-react';

interface VehicleTypeFormProps {
  vehicleType?: VehicleType;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VehicleTypeForm: React.FC<VehicleTypeFormProps> = ({
  vehicleType,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateVehicleTypeRequest>({
    name: vehicleType?.name || '',
    slug: vehicleType?.slug || '',
    no_of_seats: vehicleType?.no_of_seats || 4,
    logo_url: vehicleType?.logo_url || '',
    base_fare: vehicleType?.base_fare || 0,
    per_km_rate: vehicleType?.per_km_rate || 0,
    is_active: vehicleType?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (vehicleType) {
        await vehicleTypeService.updateVehicleType(vehicleType.id, formData);
      } else {
        await vehicleTypeService.createVehicleType(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle type');
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
            {vehicleType ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}
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
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., Autorickshaw"
              />
            </div>

            {/* Slug */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Slug <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-muted"
                placeholder="Auto-generated from name"
                readOnly
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from the name
              </p>
            </div>

            {/* Number of Seats */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of Seats <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="no_of_seats"
                value={formData.no_of_seats}
                onChange={handleChange}
                required
                min="1"
                max="50"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Logo URL
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* Base Fare */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Base Fare (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="base_fare"
                value={formData.base_fare}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Per KM Rate */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Per KM Rate (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="per_km_rate"
                value={formData.per_km_rate}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Is Active */}
            <div className="md:col-span-2">
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
                  Active (Available for booking)
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : vehicleType ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleTypeForm;