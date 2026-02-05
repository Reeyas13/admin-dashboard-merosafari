import React, { useState } from 'react';
import { vehicleTypeService } from '../services/vehicleTypeService';
import { CreateVehicleTypeRequest, VehicleType } from '../types/vehicleTypes';
import { Button } from 'src/components/ui/button';
import { X, Upload, FileIcon } from 'lucide-react';

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
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(vehicleType?.logo_url || '');
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

  // Handle logo file selection with validation
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PNG, SVG)
    const validLogoTypes = ['image/png', 'image/svg+xml'];
    if (!validLogoTypes.includes(file.type)) {
      setError('Logo must be a PNG or SVG file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo file size must be less than 5MB');
      return;
    }

    setLogoFile(file);
    setError(null);

    // Create preview for PNG files
    if (file.type === 'image/png') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(''); // SVG preview can be added if needed
    }
  };

  // Handle 3D model file selection with validation
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (GLB, GLTF, FBX, OBJ)
    const validModelTypes = [
      'model/gltf-binary',
      'model/gltf+json',
      'application/octet-stream', // GLB files often have this MIME type
    ];
    const validExtensions = ['.glb', '.gltf', '.fbx', '.obj'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validModelTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Model must be a GLB, GLTF, FBX, or OBJ file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Model file size must be less than 50MB');
      return;
    }

    setModelFile(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData object
      const submitData = new FormData();

      // Append text fields
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      submitData.append('no_of_seats', formData.no_of_seats.toString());
      submitData.append('base_fare', formData.base_fare.toString());
      submitData.append('per_km_rate', formData.per_km_rate.toString());
      submitData.append('is_active', formData.is_active.toString());

      // Append logo file if selected
      if (logoFile) {
        submitData.append('logo', logoFile, logoFile.name);
      }

      // Append model file if selected
      if (modelFile) {
        submitData.append('model', modelFile, modelFile.name);
      }

      if (vehicleType) {
        await vehicleTypeService.updateVehicleType(vehicleType.id, submitData);
      } else {
        await vehicleTypeService.createVehicleType(submitData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg  bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl border border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
            <div className="md:col-span-2">
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

            {/* Logo Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Logo (PNG or SVG) <span className="text-error">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {logoFile ? logoFile.name : 'Choose logo file'}
                  </span>
                  <input
                    type="file"
                    accept=".png,.svg"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                {logoPreview && (
                  <div className="w-16 h-16 border rounded-md overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: 5MB. Accepted formats: PNG, SVG
              </p>
            </div>

            {/* 3D Model Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                3D Model (GLB, GLTF, FBX, OBJ)
              </label>
              <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                <FileIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {modelFile ? modelFile.name : 'Choose 3D model file'}
                </span>
                <input
                  type="file"
                  accept=".glb,.gltf,.fbx,.obj"
                  onChange={handleModelChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: 50MB. Accepted formats: GLB, GLTF, FBX, OBJ
              </p>
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
