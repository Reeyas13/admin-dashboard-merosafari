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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from 'src/components/ui/dialog';

import {
  DollarSign,
  Clock,
  MapPin,
  TrendingUp,
  Calculator,
  Save,
  Car,
  Award,
  Shield,
} from 'lucide-react';

import {
  PricingConfig,
  CalculateFareRequest,
  CalculateFareResponse,
} from '../types/pricing';
import { LocationVehicle } from '../types/locationVehicles';
import { Boundary } from '../types/boundary';
import { pricingService } from '../services/pricingService';
import { locationVehicleService } from '../services/locationVehicleService';
import { boundaryService } from '../services/boundaryService';

// Helper functions for time conversion
const isoToTime = (iso: string): string => {
  if (!iso) return '';
  const match = iso.match(/(\d{2}:\d{2}(:\d{2})?)/);
  return match ? match[1].padEnd(8, ':00') : '';
};

const timeToIso = (time: string): string => {
  if (!time) return '';
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

  const [formData, setFormData] = useState({
    base_fare: '',
    per_km_rate: '',
    waiting_time_per_minute: '',
    eta_waiting_charge_starts_after_minutes: '',
    service_tax_percentage: '',
    outside_service_area_charge: '',
    insurance_charge_type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    insurance_charge_value: '',
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

      setFormData({
        base_fare: String(data.pricing.base_fare || 0),
        per_km_rate: String(data.pricing.per_km_rate || 0),
        waiting_time_per_minute: String(data.pricing.waiting_time_per_minute || 0),
        eta_waiting_charge_starts_after_minutes: String(
          data.pricing.eta_waiting_charge_starts_after_minutes || 0
        ),
        service_tax_percentage: String(data.pricing.service_tax_percentage || 0),
        outside_service_area_charge: String(data.pricing.outside_service_area_charge || 0),
        insurance_charge_type: data.pricing.insurance_charge_type as 'PERCENTAGE' | 'FIXED',
        insurance_charge_value: String(data.pricing.insurance_charge_value || 0),
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
        insurance_charge_type: 'PERCENTAGE',
        insurance_charge_value: '',
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
        eta_waiting_charge_starts_after_minutes:
          parseInt(formData.eta_waiting_charge_starts_after_minutes) || 0,
        service_tax_percentage: parseFloat(formData.service_tax_percentage) || 0,
        outside_service_area_charge: parseFloat(formData.outside_service_area_charge) || 0,
        insurance_charge_type: formData.insurance_charge_type,
        insurance_charge_value: parseFloat(formData.insurance_charge_value) || 0,
        peak_hour_multiplier: parseFloat(formData.peak_hour_multiplier) || 1.0,
        peak_hours_start: timeToIso(formData.peak_hours_start),
        peak_hours_end: timeToIso(formData.peak_hours_end),
        is_active: formData.is_active,
      };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
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
            <BreadcrumbPage>Pricing Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            <DollarSign className="inline mr-3 text-green-600" size={40} />
            Pricing Management
          </h1>
          <p className="text-slate-600">
            Configure fare structures for each vehicle type in each location
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/vehicle-management')}>
            <Car className="mr-2" size={18} />
            Manage Vehicles
          </Button>
          <Button variant="outline" onClick={() => navigate('/incentives')}>
            <Award className="mr-2" size={18} />
            Manage Incentives
          </Button>
          <Button
            variant="default"
            onClick={() => setShowCalculator(true)}
            disabled={!selectedVehicle}
          >
            <Calculator className="mr-2" size={18} />
            Calculate Fare
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin size={18} />
              Select Location
            </h3>
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredBoundaries.map((b) => (
                <Card
                  key={b.id}
                  className={`p-3 cursor-pointer hover:bg-slate-50 transition ${
                    selectedBoundary?.id === b.id ? 'border-2 border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedBoundary(b)}
                >
                  <div className="font-medium">{b.name}</div>
                  <div className="text-sm text-slate-500">{b.district}</div>
                </Card>
              ))}
            </div>
          </Card>

          {selectedBoundary && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Car size={18} />
                Select Vehicle
              </h3>
              <div className="space-y-2">
                {vehicles.map((v) => (
                  <Card
                    key={v.id}
                    className={`p-3 cursor-pointer hover:bg-slate-50 transition ${
                      selectedVehicle?.id === v.id ? 'border-2 border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedVehicle(v)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{v.vehicle_type_name}</span>
                      <Badge variant={v.is_enabled ? 'default' : 'secondary'}>
                        {v.is_enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {vehicles.length === 0 && (
                  <div className="text-center py-4 text-slate-500">No vehicles configured</div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Pricing Form */}
        <div className="col-span-9">
          {selectedVehicle ? (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {selectedVehicle.vehicle_type_name} — {selectedBoundary?.name}
                </h2>
                <p className="text-slate-600">
                  Pricing configuration {pricing?.id ? `(ID: ${pricing.id})` : '(New)'}
                </p>
                <Badge variant={formData.is_active ? 'default' : 'secondary'} className="mt-2">
                  {formData.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="text-slate-500">Loading pricing...</div>
                </div>
              ) : (
                <>
                  {/* Base Pricing */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <DollarSign size={18} />
                        Base Pricing
                      </h3>
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

                    {/* Waiting Charges */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Clock size={18} />
                        Waiting Time
                      </h3>
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
                  </div>

                  {/* Additional Charges */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Additional Charges</h3>
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

                    {/* Insurance */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Shield size={18} />
                        Insurance
                      </h3>
                      <div>
                        <Label>Insurance Type</Label>
                        <Select
                          value={formData.insurance_charge_type}
                          onValueChange={(value: 'PERCENTAGE' | 'FIXED') =>
                            setFormData({ ...formData, insurance_charge_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                            <SelectItem value="FIXED">Fixed Amount (NPR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>
                          Insurance Value (
                          {formData.insurance_charge_type === 'PERCENTAGE' ? '%' : 'NPR'})
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.insurance_charge_value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              insurance_charge_value: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Peak Hours */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp size={18} />
                      Peak Hours
                    </h3>
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
                          type="time"
                          step="1"
                          value={formData.peak_hours_start}
                          onChange={(e) =>
                            setFormData({ ...formData, peak_hours_start: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>End Time (HH:mm:ss)</Label>
                        <Input
                          type="time"
                          step="1"
                          value={formData.peak_hours_end}
                          onChange={(e) =>
                            setFormData({ ...formData, peak_hours_end: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                      />
                      <div>
                        <div className="font-medium">Pricing Active</div>
                        <div className="text-sm text-slate-500">
                          Customers can book with this pricing
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving} size="lg">
                      <Save className="mr-2" size={18} />
                      {saving
                        ? 'Saving...'
                        : pricing?.id
                        ? 'Update Pricing'
                        : 'Create Pricing'}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Car className="mx-auto mb-4 text-slate-300" size={64} />
              <h3 className="text-xl font-semibold mb-2">Select a Vehicle</h3>
              <p className="text-slate-600">Choose a location and vehicle to manage its pricing</p>
            </Card>
          )}
        </div>
      </div>

      {/* Fare Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fare Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={fareCalc.is_outside_service_area}
                  onCheckedChange={(c) =>
                    setFareCalc({ ...fareCalc, is_outside_service_area: c })
                  }
                />
                <Label>Outside Service Area</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={fareCalc.is_peak_hour}
                  onCheckedChange={(c) => setFareCalc({ ...fareCalc, is_peak_hour: c })}
                />
                <Label>Peak Hour</Label>
              </div>
            </div>
            <Button onClick={handleCalculateFare} className="w-full">
              Calculate
            </Button>

            {calculatedFare && (
              <Card className="p-4 bg-slate-50">
                <h4 className="font-semibold mb-3">Fare Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Fare</span>
                    <span>NPR {calculatedFare.base_fare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance</span>
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
                    <div className="flex justify-between">
                      <span>Peak Hour Surcharge</span>
                      <span>NPR {calculatedFare.peak_hour_surcharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service Tax</span>
                    <span>NPR {calculatedFare.service_tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span>NPR {calculatedFare.insurance_charge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
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
  );
};

export default PricingManagementPage;