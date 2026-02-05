// components/VehicleTypesList.tsx

import React, { useEffect, useState } from 'react';
import { vehicleTypeService } from '../services/vehicleTypeService';
import { VehicleType } from '../types/vehicleTypes';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'src/components/ui/breadcrumb';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface VehicleTypesListProps {
  onEdit?: (vehicleType: VehicleType) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export const VehicleTypesList: React.FC<VehicleTypesListProps> = ({
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    fetchVehicleTypes();
  }, [showActiveOnly]);

  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleTypeService.getVehicleTypes(showActiveOnly);
      setVehicleTypes(response.vehicle_types);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vehicle types');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle type?')) {
      try {
        await vehicleTypeService.deleteVehicleType(id);
        if (onDelete) onDelete(id);
        fetchVehicleTypes();
      } catch (err: any) {
        alert(err.message || 'Failed to delete vehicle type');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading vehicle types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error bg-lighterror p-4">
        <p className="text-error font-medium">Error: {error}</p>
        <Button variant="outline" size="sm" onClick={fetchVehicleTypes} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Vehicle Types</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicle Types</h1>
          <p className="text-muted-foreground mt-1">
            Manage your fleet vehicle types and pricing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showActiveOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowActiveOnly(!showActiveOnly)}
          >
            {showActiveOnly ? 'Show All' : 'Active Only'}
          </Button>
          {onAdd && (
            <Button onClick={onAdd} size="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle Type
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}


      {/* Vehicle Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicleTypes.map((vehicleType) => (
          <div
            key={vehicleType.id}
            className="rounded-lg border bg-card hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {vehicleType.name}
                    </h3>
                    <Badge variant={vehicleType.is_active ? 'success' : 'error'}>
                      {vehicleType.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vehicleType.slug}
                  </p>
                </div>
                {vehicleType.logo_url && (
                  <img
                    src={import.meta.env.VITE_API_URL + vehicleType.logo_url}
                    alt={vehicleType.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Seats</span>
                  <span className="font-medium">{vehicleType.no_of_seats}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Base Fare</span>
                  <span className="font-medium">₹{vehicleType.base_fare}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Per KM Rate</span>
                  <span className="font-medium">₹{vehicleType.per_km_rate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                {onEdit && (
                  <Button
                    variant="lightprimary"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(vehicleType)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="lighterror"
                    size="sm"
                    onClick={() => handleDelete(vehicleType.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicleTypes.length === 0 && (
        <div className="text-center py-12 rounded-lg border bg-card">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No vehicle types found
          </h3>
          <p className="text-muted-foreground mb-6">
            {showActiveOnly
              ? 'No active vehicle types available'
              : 'Get started by adding your first vehicle type'}
          </p>
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle Type
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleTypesList;