import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';
import {
  DollarSign,
  Clock,
  MapPin,
  TrendingUp,
  Calculator,
  Save,
  Car,
  Award,
} from 'lucide-react';

import { PricingConfig, CalculateFareRequest, CalculateFareResponse } from '../types/pricing';
import { LocationVehicle } from '../types/locationVehicles';
import { Boundary } from '../types/boundary';
import { pricingService } from '../services/pricingService';
import { locationVehicleService } from '../services/locationVehicleService';
import { boundaryService } from '../services/boundaryService';

// Helper functions for time conversion
// Converts ISO string → "HH:mm:ss"  (e.g. "0000-01-01T17:00:00Z" → "17:00:00")
const isoToTime = (iso: string): string => {
  if (!iso) return '';
  // Handle both full ISO and plain time strings
  const match = iso.match(/(\d{2}:\d{2}(:\d{2})?)/);
  return match ? match[1].padEnd(8, ':00') : ''; // ensures seconds if missing
};

// Converts "HH:mm:ss" (or "HH:mm") → ISO  (e.g. "17:00:00" → "0000-01-01T17:00:00Z")
const timeToIso = (time: string): string => {
  if (!time) return ''; // or null if your backend allows NULL
  // Normalize: if user types "17:00", add seconds
  return time.length === 5 ? `${time}:00` : time.trim();
};

export const PricingManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleIdFromParams = searchParams.get('vehicle');

  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(null);
  const [vehicles, setVehicles] = useState<LocationVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<LocationVehicle | null>(null);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [calculatedFare, setCalculatedFare] = useState<CalculateFareResponse | null>(null);

  // Use strings for controlled inputs to avoid issues with 0 values
  const [formData, setFormData] = useState({
    base_fare: '',
    per_km_rate: '',
    waiting_time_per_minute: '',
    eta_waiting_charge_starts_after_minutes: '',
    service_tax_percentage: '',
    outside_service_area_charge: '',
    peak_hour_multiplier: '',
    peak_hours_start: '',
    peak_hours_end: '',
    is_active: false,
  });

  const [fareCalc, setFareCalc] = useState({
    distance_km: 10,
    waiting_time_minutes: 0,
    is_outside_service_area: false,
    is_peak_hour: false,
  });

  useEffect(() => {
    loadBoundaries();
  }, []);

  useEffect(() => {
    if (selectedBoundary) {
      loadVehicles();
    }
  }, [selectedBoundary]);

  useEffect(() => {
    if (selectedVehicle) {
      loadPricing();
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (vehicleIdFromParams && vehicles.length > 0) {
      const vehicle = vehicles.find((v) => v.id === vehicleIdFromParams);
      if (vehicle) {
        setSelectedVehicle(vehicle);
      }
    }
  }, [vehicleIdFromParams, vehicles]);

  const loadBoundaries = async () => {
    try {
      setLoading(true);
      const response = await boundaryService.getBoundaries();
      const active = response.boundaries.filter((b) => b.is_active);
      setBoundaries(active);
      if (active.length > 0 && !selectedBoundary) {
        setSelectedBoundary(active[0]);
      }
    } catch (err) {
      console.error('Failed to load boundaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    if (!selectedBoundary) return;
    try {
      const response = await locationVehicleService.getVehiclesForLocation(
        selectedBoundary.id,
        false
      );
      setVehicles(response.vehicles);
      if (response.vehicles.length > 0 && !selectedVehicle) {
        setSelectedVehicle(response.vehicles[0]);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    }
  };

  const loadPricing = async () => {
    if (!selectedVehicle) return;
    try {
      setLoading(true);
      const data = await pricingService.getPricing(selectedVehicle.id);

      setPricing(data.pricing);
      console.log({ data });

      setFormData({
        base_fare: String(data.pricing.base_fare || 0),
        per_km_rate: String(data.pricing.per_km_rate || 0),
        waiting_time_per_minute: String(data.pricing.waiting_time_per_minute || 0),
        eta_waiting_charge_starts_after_minutes: String(data.pricing.eta_waiting_charge_starts_after_minutes || 0),
        service_tax_percentage: String(data.pricing.service_tax_percentage || 0),
        outside_service_area_charge: String(data.pricing.outside_service_area_charge || 0),
        peak_hour_multiplier: String(data.pricing.peak_hour_multiplier || 1.0),
        peak_hours_start: isoToTime(data.pricing.peak_hours_start || ''),
        peak_hours_end: isoToTime(data.pricing.peak_hours_end || ''),
        is_active: data.pricing.is_active || false,
      });
    } catch (err: any) {
      console.error('Failed to load pricing:', err);
      setPricing(null);
      setFormData({
        base_fare: '',
        per_km_rate: '',
        waiting_time_per_minute: '',
        eta_waiting_charge_starts_after_minutes: '',
        service_tax_percentage: '',
        outside_service_area_charge: '',
        peak_hour_multiplier: '1.0',
        peak_hours_start: '',
        peak_hours_end: '',
        is_active: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedVehicle) return;

    try {
      setSaving(true);
      
      const pricingData = {
        location_vehicle_id: selectedVehicle.id,
        base_fare: parseFloat(formData.base_fare) || 0,
        per_km_rate: parseFloat(formData.per_km_rate) || 0,
        waiting_time_per_minute: parseFloat(formData.waiting_time_per_minute) || 0,
        eta_waiting_charge_starts_after_minutes: parseInt(formData.eta_waiting_charge_starts_after_minutes) || 0,
        service_tax_percentage: parseFloat(formData.service_tax_percentage) || 0,
        outside_service_area_charge: parseFloat(formData.outside_service_area_charge) || 0,
        peak_hour_multiplier: parseFloat(formData.peak_hour_multiplier) || 1.0,
        peak_hours_start: timeToIso(formData.peak_hours_start),
        peak_hours_end: timeToIso(formData.peak_hours_end),
        is_active: formData.is_active,
      };

      // If pricing exists (has an ID), use PUT to update, otherwise POST to create
      await pricingService.savePricing(pricingData, pricing?.id);

      await loadPricing();
      alert('Pricing saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateFare = async () => {
    if (!selectedBoundary || !selectedVehicle) return;

    try {
      const request: CalculateFareRequest = {
        location_boundary_id: selectedBoundary.id,
        vehicle_type_id: selectedVehicle.vehicle_type_id,
        distance_km: fareCalc.distance_km,
        waiting_time_minutes: fareCalc.waiting_time_minutes,
        is_outside_service_area: fareCalc.is_outside_service_area,
        is_peak_hour: fareCalc.is_peak_hour,
      };

      const result = await pricingService.calculateFare(request);
      setCalculatedFare(result);
    } catch (err: any) {
      alert(err.message || 'Failed to calculate fare');
    }
  };

  const filteredBoundaries = boundaries.filter(
    (b) =>
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
              <BreadcrumbPage>Pricing Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-7 w-7 text-primary" />
              Pricing Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure fare structures for each vehicle type in each location
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/vehicle-management')}
            >
              <Car className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/incentives')}
            >
              <Award className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalculator(true)}
              disabled={!selectedVehicle}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Fare
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Select Location
              </h3>
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredBoundaries.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      selectedBoundary?.id === b.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedBoundary(b)}
                  >
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.district}</div>
                  </div>
                ))}
              </div>
            </Card>

            {selectedBoundary && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  Select Vehicle
                </h3>
                <div className="space-y-2">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        selectedVehicle?.id === v.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedVehicle(v)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{v.vehicle_type_name}</span>
                        <Badge variant={v.is_enabled ? 'default' : 'secondary'}>
                          {v.is_enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {vehicles.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No vehicles configured
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Pricing Form */}
          <div className="lg:col-span-9">
            {selectedVehicle ? (
              <div className="space-y-6">
                <Card className="p-5 bg-primary/5 border-primary">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {selectedVehicle.vehicle_type_name} — {selectedBoundary?.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Pricing configuration {pricing?.id ? `(ID: ${pricing.id})` : '(New)'}
                      </p>
                    </div>
                    <Badge variant={formData.is_active ? 'default' : 'secondary'}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </Card>

                {loading ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full mx-auto border-t-transparent" />
                    <p className="mt-4 text-muted-foreground">Loading pricing...</p>
                  </Card>
                ) : (
                  <>
                    {/* Base Pricing */}
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Base Pricing
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Base Fare (NPR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.base_fare}
                            onChange={(e) =>
                              setFormData({ ...formData, base_fare: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Per KM Rate (NPR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.per_km_rate}
                            onChange={(e) =>
                              setFormData({ ...formData, per_km_rate: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Waiting Charges */}
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Waiting Time
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Per Minute Rate (NPR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.waiting_time_per_minute}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                waiting_time_per_minute: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Free Waiting (minutes)</Label>
                          <Input
                            type="number"
                            value={formData.eta_waiting_charge_starts_after_minutes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                eta_waiting_charge_starts_after_minutes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Additional Charges */}
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Additional Charges
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Outside Area Charge (NPR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.outside_service_area_charge}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                outside_service_area_charge: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Service Tax (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.service_tax_percentage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                service_tax_percentage: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Peak Hours */}
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Peak Hours
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.peak_hour_multiplier}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                peak_hour_multiplier: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Start Time (HH:mm:ss)</Label>
                          <Input
                            type="text"
                            placeholder="17:00:00"
                            value={formData.peak_hours_start}
                            onChange={(e) =>
                              setFormData({ ...formData, peak_hours_start: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>End Time (HH:mm:ss)</Label>
                          <Input
                            type="text"
                            placeholder="20:00:00"
                            value={formData.peak_hours_end}
                            onChange={(e) =>
                              setFormData({ ...formData, peak_hours_end: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Save */}
                    <Card className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={formData.is_active}
                            onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                          />
                          <div>
                            <p className="font-medium">Pricing Active</p>
                            <p className="text-sm text-muted-foreground">
                              Customers can book with this pricing
                            </p>
                          </div>
                        </div>
                        <Button onClick={handleSave} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Saving...' : pricing?.id ? 'Update Pricing' : 'Create Pricing'}
                        </Button>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Vehicle</h3>
                <p className="text-muted-foreground">
                  Choose a location and vehicle to manage its pricing
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Fare Calculator Dialog */}
        <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Fare Calculator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={fareCalc.distance_km}
                  onChange={(e) =>
                    setFareCalc({ ...fareCalc, distance_km: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Waiting Time (minutes)</Label>
                <Input
                  type="number"
                  value={fareCalc.waiting_time_minutes}
                  onChange={(e) =>
                    setFareCalc({
                      ...fareCalc,
                      waiting_time_minutes: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={fareCalc.is_outside_service_area}
                  onCheckedChange={(c) =>
                    setFareCalc({ ...fareCalc, is_outside_service_area: c })
                  }
                />
                <Label>Outside Service Area</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={fareCalc.is_peak_hour}
                  onCheckedChange={(c) => setFareCalc({ ...fareCalc, is_peak_hour: c })}
                />
                <Label>Peak Hour</Label>
              </div>

              <Button onClick={handleCalculateFare} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate
              </Button>

              {calculatedFare && (
                <Card className="p-4 bg-primary/5">
                  <h4 className="font-semibold mb-3">Fare Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Fare</span>
                      <span>NPR {calculatedFare.base_fare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Distance ({(calculatedFare.distance_fare / calculatedFare.per_km_rate || 0).toFixed(1)} km)
                      </span>
                      <span>NPR {calculatedFare.distance_fare.toFixed(2)}</span>
                    </div>
                    {calculatedFare.waiting_fare > 0 && (
                      <div className="flex justify-between">
                        <span>Waiting Time</span>
                        <span>NPR {calculatedFare.waiting_fare.toFixed(2)}</span>
                      </div>
                    )}
                    {calculatedFare.outside_area_charge > 0 && (
                      <div className="flex justify-between">
                        <span>Outside Area</span>
                        <span>NPR {calculatedFare.outside_area_charge.toFixed(2)}</span>
                      </div>
                    )}
                    {calculatedFare.peak_hour_surcharge > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Peak Hour Surcharge</span>
                        <span>NPR {calculatedFare.peak_hour_surcharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Service Tax</span>
                      <span>NPR {calculatedFare.service_tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total Fare</span>
                      <span>NPR {calculatedFare.total_fare.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCalculator(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PricingManagementPage;