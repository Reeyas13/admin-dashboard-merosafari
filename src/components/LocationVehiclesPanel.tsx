// components/LocationVehiclesPanel.tsx

import React, { useState, useEffect } from 'react';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Card } from 'src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Switch } from 'src/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Car,
  Plus,
  Settings,
  ToggleLeft,
  ToggleRight,
  Clock,
  Users,
  DollarSign,
  Award,
} from 'lucide-react';
import { LocationVehicle } from '../types/locationVehicles';
import { VehicleType } from '../types/vehicleTypes';
import { locationVehicleService } from '../services/locationVehicleService';
import { vehicleTypeService } from '../services/vehicleTypeService';

interface LocationVehiclesPanelProps {
  boundaryId: string;
  boundaryName: string;
  onPricingClick: (vehicleId: string, vehicleName: string) => void;
  onIncentivesClick: () => void;
}

export const LocationVehiclesPanel: React.FC<LocationVehiclesPanelProps> = ({
  boundaryId,
  boundaryName,
  onPricingClick,
  onIncentivesClick,
}) => {
  const [vehicles, setVehicles] = useState<LocationVehicle[]>([]);
  const [availableVehicleTypes, setAvailableVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type_id: '',
    is_enabled: true,
    min_drivers_required: 2,
    operating_hours_start: '06:00:00',
    operating_hours_end: '22:00:00',
  });

  useEffect(() => {
    if (boundaryId) {
      loadVehicles();
      loadAvailableVehicleTypes();
    }
  }, [boundaryId]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await locationVehicleService.getVehiclesForLocation(
        boundaryId,
        false
      );
      setVehicles(response.vehicles);
    } catch (error: any) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableVehicleTypes = async () => {
    try {
      const response = await vehicleTypeService.getVehicleTypes(true);
      setAvailableVehicleTypes(response.vehicle_types);
    } catch (error: any) {
      console.error('Failed to load vehicle types:', error);
    }
  };

  const handleAddVehicle = async () => {
    try {
      await locationVehicleService.addVehicleToLocation(boundaryId, formData);
      setShowAddDialog(false);
      loadVehicles();
      // Reset form
      setFormData({
        vehicle_type_id: '',
        is_enabled: true,
        min_drivers_required: 2,
        operating_hours_start: '06:00:00',
        operating_hours_end: '22:00:00',
      });
    } catch (error: any) {
      alert(error.message || 'Failed to add vehicle');
    }
  };

  const handleToggleVehicle = async (vehicleId: string) => {
    try {
      await locationVehicleService.toggleVehicleStatus(boundaryId, vehicleId);
      loadVehicles();
    } catch (error: any) {
      alert(error.message || 'Failed to toggle vehicle status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Available Rides in {boundaryName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage vehicle types and their configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onIncentivesClick}
          >
            <Award className="h-4 w-4 mr-2" />
            Incentives
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle Type
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="p-8 text-center">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No vehicle types configured for this location
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setShowAddDialog(true)}
          >
            Add First Vehicle
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-foreground">
                      {vehicle.vehicle_type?.name || 'Unknown Vehicle'}
                    </h4>
                    <Badge variant={vehicle.is_enabled ? 'success' : 'error'}>
                      {vehicle.is_enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {vehicle.vehicle_type?.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {vehicle.vehicle_type.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Min Drivers: <span className="font-medium text-foreground">{vehicle.min_drivers_required}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Hours: <span className="font-medium text-foreground">
                          {vehicle.operating_hours_start.slice(0, 5)} - {vehicle.operating_hours_end.slice(0, 5)}
                        </span>
                      </span>
                    </div>
                    {vehicle.vehicle_type?.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Capacity: <span className="font-medium text-foreground">{vehicle.vehicle_type.capacity}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onPricingClick(
                        vehicle.id,
                        vehicle.vehicle_type?.name || 'Unknown'
                      )
                    }
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Pricing
                  </Button>
                  <Button
                    variant={vehicle.is_enabled ? 'lighterror' : 'lightsuccess'}
                    size="sm"
                    onClick={() => handleToggleVehicle(vehicle.id)}
                  >
                    {vehicle.is_enabled ? (
                      <>
                        <ToggleLeft className="h-4 w-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-4 w-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle Type to Location</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select
                value={formData.vehicle_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, vehicle_type_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicleTypes.map((vt) => (
                    <SelectItem key={vt.id} value={vt.id}>
                      {vt.name} (Capacity: {vt.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_drivers">Minimum Drivers Required</Label>
              <Input
                id="min_drivers"
                type="number"
                min={1}
                value={formData.min_drivers_required}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_drivers_required: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Operating Hours Start</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.operating_hours_start.slice(0, 5)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operating_hours_start: `${e.target.value}:00`,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Operating Hours End</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.operating_hours_end.slice(0, 5)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operating_hours_end: `${e.target.value}:00`,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_enabled: checked })
                }
              />
              <Label htmlFor="enabled">Enable immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddVehicle}
              disabled={!formData.vehicle_type_id}
            >
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationVehiclesPanel;