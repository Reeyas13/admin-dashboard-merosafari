// pages/VehicleManagementPage.tsx

import React, { useState, useEffect, Suspense } from 'react';
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
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { LocationVehicle } from '../types/locationVehicles';
import { VehicleType } from '../types/vehicleTypes';
import { Boundary } from '../types/boundary';
import { locationVehicleService } from '../services/locationVehicleService';
import { vehicleTypeService } from '../services/vehicleTypeService';
import { boundaryService } from '../services/boundaryService';

// 3D Model Component
const Model3D: React.FC<{ modelUrl: string }> = ({ modelUrl }) => {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={2} />;
};

// Vehicle Preview Component
const VehiclePreview: React.FC<{ vehicleType: VehicleType | null }> = ({ vehicleType }) => {
  if (!vehicleType) {
    return (
      <div className="h-80 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
        <div className="text-center text-muted-foreground">
          <Car className="h-16 w-16 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Select a vehicle type</p>
          <p className="text-xs mt-1 opacity-70">Preview will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 3D Model Preview */}
      {vehicleType.model_url && (
        <div className="h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-700">
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 opacity-70" />
                  <p className="text-sm opacity-70">Loading 3D model...</p>
                </div>
              </div>
            }
          >
            <Canvas camera={{ position: [3, 2, 3], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <directionalLight position={[-10, -10, -5]} intensity={0.3} />
              <Model3D modelUrl={"http://localhost:8080" + vehicleType.model_url} />
              <OrbitControls 
                enableZoom={true} 
                autoRotate 
                autoRotateSpeed={1.5}
                minDistance={2}
                maxDistance={10}
                enablePan={false}
              />
              <Environment preset="sunset" />
            </Canvas>
          </Suspense>
        </div>
      )}

      {/* 2D Image Preview */}
      {vehicleType.logo_url && (
        <div className="relative">
          <img
            src={"http://localhost:8080" + vehicleType.logo_url}
            alt={vehicleType.name}
            className="w-full h-32 object-contain bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
          />
          <Badge className="absolute top-3 right-3 shadow-md">{vehicleType.name}</Badge>
        </div>
      )}

      {/* Vehicle Details Card */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Vehicle Details
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Vehicle Name</div>
            <div className="font-semibold">{vehicleType.name}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Capacity</div>
            <div className="font-semibold">{vehicleType.no_of_seats} seats</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Per KM Rate</div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              Rs. {vehicleType.per_km_rate}/km
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Status</div>
            <Badge variant={vehicleType.is_active ? 'success' : 'error'}>
              {vehicleType.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VehicleManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(null);
  const [vehicles, setVehicles] = useState<LocationVehicle[]>([]);
  const [availableVehicleTypes, setAvailableVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleTypePreview, setSelectedVehicleTypePreview] = useState<VehicleType | null>(null);
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
      const selectedType = availableVehicleTypes.find(vt => vt.id === formData.vehicle_type_id);
      setSelectedVehicleTypePreview(selectedType || null);
    } else {
      setSelectedVehicleTypePreview(null);
    }
  }, [formData.vehicle_type_id, availableVehicleTypes]);

  const loadBoundaries = async () => {
    try {
      setLoading(true);
      const response = await boundaryService.getBoundaries();
      const activeBoundaries = response.boundaries.filter(b => b.is_active);
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
      console.log({ response })
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
      console.log({ response })
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

  const handleToggleVehicle = async (vehicleId: string) => {
    if (!selectedBoundary) return;
    try {
      await locationVehicleService.toggleVehicleStatus(
        selectedBoundary.id,
        vehicleId
      );
      loadVehicles();
    } catch (error: any) {
      alert(error.message || 'Failed to toggle vehicle status');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!selectedBoundary) return;
    if (!confirm('Are you sure you want to remove this vehicle type from this location?')) {
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

  const filteredBoundaries = boundaries.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/map">Locations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Vehicle Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-7 w-7 text-primary" />
              Vehicle Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure available vehicle types for each service area
            </p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/pricing')}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Pricing</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/incentives')}
                >
                  <Award className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Incentives</p>
              </TooltipContent>
            </Tooltip>
            <Button onClick={loadVehicles} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Location Selector */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Select Location
                  </h3>
                  <Input
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-3"
                  />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredBoundaries.map((boundary) => (
                    <div
                      key={boundary.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedBoundary?.id === boundary.id
                        ? 'border-primary bg-lightprimary'
                        : 'border-border bg-card'
                        }`}
                      onClick={() => setSelectedBoundary(boundary)}
                    >
                      <div className="font-medium text-sm">{boundary.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {boundary.district}, {boundary.province}
                      </div>
                      <Badge variant="success" className="mt-2 text-xs">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>

                {filteredBoundaries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No active locations found
                  </div>
                )}
              </div>
            </Card>

            {selectedBoundary && (
              <Card className="p-4 bg-lightprimary border-primary">
                <h4 className="font-semibold text-primary text-sm mb-2">Selected Location</h4>
                <div className="text-sm space-y-1">
                  <div className="font-medium">{selectedBoundary.name}</div>
                  <div className="text-muted-foreground">
                    {selectedBoundary.type}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedBoundary.district}, {selectedBoundary.province}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content - Vehicles List */}
          <div className="lg:col-span-9 space-y-4">
            {selectedBoundary ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Vehicles in {selectedBoundary.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vehicles.length} vehicle type{vehicles.length !== 1 ? 's' : ''} configured
                      </p>
                    </div>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle Type
                    </Button>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : vehicles.length === 0 ? (
                    <div className="text-center py-12">
                      <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No vehicles configured
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Add vehicle types to enable ride services in this area
                      </p>
                      <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Vehicle
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {vehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="p-5 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-lightprimary flex items-center justify-center">
                                  {vehicle.vehicle_type?.logo_url ? (
                                    <img
                                      src={"http://localhost:8080" + vehicle.vehicle_type.logo_url}
                                      alt={vehicle.vehicle_type_name}
                                      className="h-10 w-10 object-contain"
                                    />
                                  ) : (
                                    <Car className="h-6 w-6 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground text-lg">
                                    {vehicle.vehicle_type_name || 'Unknown Vehicle'}
                                  </h3>
                                  {vehicle.vehicle_type?.slug && (
                                    <p className="text-sm text-muted-foreground">
                                      {vehicle.vehicle_type.slug}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={vehicle.is_enabled ? 'success' : 'error'}>
                                  {vehicle.is_enabled ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="text-muted-foreground text-xs">Min Drivers</div>
                                    <div className="font-medium">
                                      {vehicle.min_drivers_required}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="text-muted-foreground text-xs">Operating Hours</div>
                                    <div className="font-medium">
                                      {vehicle.operating_hours_start.slice(0, 5)} - {vehicle.operating_hours_end.slice(0, 5)}
                                    </div>
                                  </div>
                                </div>
                                {vehicle.vehicle_type?.no_of_seats && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="text-muted-foreground text-xs">Capacity</div>
                                      <div className="font-medium">
                                        {vehicle.vehicle_type.no_of_seats} seats
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => navigate(`/pricing?vehicle=${vehicle.id}`)}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Configure Pricing</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="lighterror"
                                    size="icon"
                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remove Vehicle</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select a Location
                </h3>
                <p className="text-muted-foreground">
                  Choose a location from the sidebar to manage its vehicle types
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Add Vehicle Dialog - Made larger */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Add Vehicle Type to {selectedBoundary?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
              {/* Left Column - Form */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_type" className="text-sm font-medium">
                    Vehicle Type
                  </Label>
                  <Select
                    value={formData.vehicle_type_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, vehicle_type_id: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a vehicle type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicleTypes.map((vt) => (
                        <SelectItem key={vt.id} value={vt.id} className="py-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{vt.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{vt.no_of_seats} seats</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_drivers" className="text-sm font-medium">
                    Minimum Drivers Required
                  </Label>
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
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum number of drivers needed for this vehicle type in this location
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Operating Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time" className="text-xs text-muted-foreground">
                        Start Time
                      </Label>
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
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time" className="text-xs text-muted-foreground">
                        End Time
                      </Label>
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
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
                      Enable immediately
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Make this vehicle available for booking right away
                    </p>
                  </div>
                  <Switch
                    id="enabled"
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_enabled: checked })
                    }
                  />
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Vehicle Preview</Label>
                <VehiclePreview vehicleType={selectedVehicleTypePreview} />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-3">
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
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default VehicleManagementPage;