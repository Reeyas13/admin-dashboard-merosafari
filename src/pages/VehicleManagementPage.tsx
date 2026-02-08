// pages/VehicleManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'src/components/ui/breadcrumb';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Card } from 'src/components/ui/card';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Switch } from 'src/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from 'src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';
import {
  Car,
  Plus,
  RefreshCw,
  Clock,
  Users,
  MapPin,
  Trash2,
  DollarSign,
  Award,

} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LocationVehicle } from '../types/locationVehicles';
import { VehicleType } from '../types/vehicleTypes';
import { Boundary } from '../types/boundary';
import { locationVehicleService } from '../services/locationVehicleService';
import { vehicleTypeService } from '../services/vehicleTypeService';
import { boundaryService } from '../services/boundaryService';

// Vehicle Preview Component
const VehiclePreview: React.FC<{ vehicleType: VehicleType | null }> = ({
  vehicleType,
}) => {
  if (!vehicleType) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Car className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Select a vehicle type</p>
        <p className="text-gray-400 text-sm mt-2">
          Preview will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vehicle Image Preview */}
      {vehicleType.logo_url ? (
        <div className="rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-8">
          <img
            src={ `${import.meta.env.VITE_API_URL}`+vehicleType.logo_url}
            alt={vehicleType.name}
            className="max-w-full max-h-64 object-contain"
          />
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-12">
          <div className="text-center">
            <Car className="w-20 h-20 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No image available</p>
          </div>
        </div>
      )}

      {/* Vehicle Details Card */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-3 text-gray-900">Vehicle Details</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Vehicle Name</span>
            <span className="font-medium text-gray-900">
              {vehicleType.name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Capacity</span>
            <span className="font-medium text-gray-900">
              {vehicleType.no_of_seats} seats
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Per KM Rate</span>
            <span className="font-medium text-gray-900">
              Rs. {vehicleType.per_km_rate}/km
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status</span>
            <Badge variant={vehicleType.is_active ? 'default' : 'secondary'}>
              {vehicleType.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const VehicleManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(
    null
  );
  const [vehicles, setVehicles] = useState<LocationVehicle[]>([]);
  const [availableVehicleTypes, setAvailableVehicleTypes] = useState<
    VehicleType[]
  >([]);
  const [selectedVehicleTypePreview, setSelectedVehicleTypePreview] =
    useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    vehicle_type_id: '',
    is_enabled: true,
    min_drivers_required: 2,
    operating_hours_start: '06:00:00',
    operating_hours_end: '22:00:00',
  });

  useEffect(() => {
    loadBoundaries();
    loadAvailableVehicleTypes();
  }, []);

  useEffect(() => {
    if (selectedBoundary) {
      loadVehicles();
    }
  }, [selectedBoundary]);

  // Update preview when vehicle type is selected
  useEffect(() => {
    if (formData.vehicle_type_id) {
      const selectedType = availableVehicleTypes.find(
        (vt) => vt.id === formData.vehicle_type_id
      );
      setSelectedVehicleTypePreview(selectedType || null);
    } else {
      setSelectedVehicleTypePreview(null);
    }
  }, [formData.vehicle_type_id, availableVehicleTypes]);

  const loadBoundaries = async () => {
    try {
      setLoading(true);
      const response = await boundaryService.getBoundaries();
      const activeBoundaries = response.boundaries.filter((b) => b.is_active);
      setBoundaries(activeBoundaries);

      if (activeBoundaries.length > 0 && !selectedBoundary) {
        setSelectedBoundary(activeBoundaries[0]);
      }
    } catch (error: any) {
      console.error('Failed to load boundaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    if (!selectedBoundary) return;

    try {
      setLoading(true);
      const response = await locationVehicleService.getVehiclesForLocation(
        selectedBoundary.id,
        false
      );
      console.log({ response });
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
      console.log({ response });
      setAvailableVehicleTypes(response.vehicle_types);
    } catch (error: any) {
      console.error('Failed to load vehicle types:', error);
    }
  };

  const handleAddVehicle = async () => {
    if (!selectedBoundary) return;

    try {
      await locationVehicleService.addVehicleToLocation(
        selectedBoundary.id,
        formData
      );
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
      setSelectedVehicleTypePreview(null);
    } catch (error: any) {
      alert(error.message || 'Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!selectedBoundary) return;

    if (
      !confirm(
        'Are you sure you want to remove this vehicle type from this location?'
      )
    ) {
      return;
    }

    try {
      await locationVehicleService.removeVehicleFromLocation(
        selectedBoundary.id,
        vehicleId
      );
      loadVehicles();
    } catch (error: any) {
      alert(error.message || 'Failed to remove vehicle');
    }
  };

  const filteredBoundaries = boundaries.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/locations">Locations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Vehicle Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vehicle Management
          </h1>
          <p className="text-gray-600">
            Configure available vehicle types for each service area
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/pricing')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Manage Pricing
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/incentives')}
          >
            <Award className="w-4 h-4 mr-2" />
            Manage Incentives
          </Button>
          <Button variant="outline" onClick={loadVehicles}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Location Selector */}
        <div className="col-span-3">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Select Location</h2>
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredBoundaries.map((boundary) => (
                <Card
                  key={boundary.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedBoundary?.id === boundary.id
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : ''
                  }`}
                  onClick={() => setSelectedBoundary(boundary)}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{boundary.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {boundary.district}, {boundary.province}
                      </p>
                      <Badge
                        variant="default"
                        className="mt-1 text-xs"
                      >
                        Active
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredBoundaries.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No active locations found
                </p>
              )}
            </div>

            {selectedBoundary && (
              <Card className="p-3 mt-4 bg-blue-50 border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Selected Location</p>
                <p className="font-semibold text-sm">{selectedBoundary.name}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedBoundary.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {selectedBoundary.district}, {selectedBoundary.province}
                </p>
              </Card>
            )}
          </Card>
        </div>

        {/* Main Content - Vehicles List */}
        <div className="col-span-9">
          {selectedBoundary ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Vehicles in {selectedBoundary.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {vehicles.length} vehicle type
                    {vehicles.length !== 1 ? 's' : ''} configured
                  </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle Type
                </Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : vehicles.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No vehicles configured
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add vehicle types to enable ride services in this area
                    </p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Vehicle
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        {vehicle.vehicle_type?.logo_url ? (
                          <img
                            src={ `${import.meta.env.VITE_API_URL}${vehicle.vehicle_type.logo_url}`}
                            alt={vehicle.vehicle_type_name || 'Vehicle'}
                            className="w-16 h-16 object-contain rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                            <Car className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {vehicle.vehicle_type_name || 'Unknown Vehicle'}
                          </h3>
                          {vehicle.vehicle_type?.slug && (
                            <p className="text-xs text-gray-500">
                              {vehicle.vehicle_type.slug}
                            </p>
                          )}
                          <Badge
                            variant={vehicle.is_enabled ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {vehicle.is_enabled ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">Min Drivers:</span>
                          <span>{vehicle.min_drivers_required}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Operating Hours:</span>
                          <span>
                            {vehicle.operating_hours_start.slice(0, 5)} -{' '}
                            {vehicle.operating_hours_end.slice(0, 5)}
                          </span>
                        </div>
                        {vehicle.vehicle_type?.no_of_seats && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Car className="w-4 h-4" />
                            <span className="font-medium">Capacity:</span>
                            <span>{vehicle.vehicle_type.no_of_seats} seats</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            navigate(`/pricing?vehicle=${vehicle.id}`)
                          }
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Configure Pricing
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove Vehicle</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Select a Location
                </h3>
                <p className="text-gray-600">
                  Choose a location from the sidebar to manage its vehicle types
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add Vehicle Type to {selectedBoundary?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <div>
                <Label>Vehicle Type</Label>
                <Select
                  value={formData.vehicle_type_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, vehicle_type_id: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicleTypes.map((vt) => (
                      <SelectItem key={vt.id} value={vt.id}>
                        <div className="flex items-center gap-2">
                          {vt.logo_url && (
                            <img
                              src={`${import.meta.env.VITE_API_URL}${vt.logo_url}`}
                              alt={vt.name}
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          <span>
                            {vt.name} • {vt.no_of_seats} seats
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Minimum Drivers Required</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.min_drivers_required}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_drivers_required: parseInt(e.target.value) || 1,
                    })
                  }
                  className="h-11"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum number of drivers needed for this vehicle type in this
                  location
                </p>
              </div>

              <div>
                <Label>Operating Hours</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Start Time</Label>
                    <Input
                      type="time"
                      value={formData.operating_hours_start.slice(0, 5)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operating_hours_start: `${e.target.value}:00`,
                        })
                      }
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">End Time</Label>
                    <Input
                      type="time"
                      value={formData.operating_hours_end.slice(0, 5)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operating_hours_end: `${e.target.value}:00`,
                        })
                      }
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Enable immediately</Label>
                  <p className="text-xs text-gray-500">
                    Make this vehicle available for booking right away
                  </p>
                </div>
                <Switch
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_enabled: checked })
                  }
                />
              </div>
            </div>

            {/* Right Column - Preview */}
            <div>
              <Label className="mb-3 block">Vehicle Preview</Label>
              <VehiclePreview vehicleType={selectedVehicleTypePreview} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setSelectedVehicleTypePreview(null);
              }}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddVehicle}
              disabled={!formData.vehicle_type_id}
              className="px-6"
            >
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleManagementPage;