import React, { useState, useEffect } from 'react';
import { Button } from 'src/components/ui/button';
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
import { Badge } from 'src/components/ui/badge';
import {
  DollarSign,
  Clock,
  MapPin,
  TrendingUp,
  Calculator,
  Save,
} from 'lucide-react';
import { PricingConfig, CalculateFareRequest } from '../types/pricing';
import { pricingService } from '../services/pricingService';

interface PricingConfigPanelProps {
  locationVehicleId: string;
  vehicleName: string;
  boundaryId: string;
  onClose: () => void;
}

export const PricingConfigPanel: React.FC<PricingConfigPanelProps> = ({
  locationVehicleId,
  vehicleName,
  boundaryId,
  onClose,
}) => {
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [formData, setFormData] = useState({
    base_fare: 50,
    per_km_rate: 15,
    waiting_time_per_minute: 5,
    eta_waiting_charge_starts_after_minutes: 5,
    service_tax_percentage: 13,
    outside_service_area_charge: 50,
    peak_hour_multiplier: 1.5,
    peak_hours_start: '17:00:00',
    peak_hours_end: '20:00:00',
    is_active: true,
  });

  const [fareCalc, setFareCalc] = useState({
    distance_km: 5,
    waiting_time_minutes: 0,
    is_outside_service_area: false,
    is_peak_hour: false,
  });
  const [calculatedFare, setCalculatedFare] = useState<any>(null);

  useEffect(() => {
    loadPricing();
  }, [locationVehicleId]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const data = await pricingService.getPricing(locationVehicleId);
      //@ts-ignore
      setPricing(data);
      setFormData({
      //@ts-ignore
        base_fare: data.base_fare,
      //@ts-ignore

        per_km_rate: data.per_km_rate,
      //@ts-ignore

        waiting_time_per_minute: data.waiting_time_per_minute,

      //@ts-ignore
        eta_waiting_charge_starts_after_minutes:
      //@ts-ignore
          data.eta_waiting_charge_starts_after_minutes,
      //@ts-ignore
        service_tax_percentage: data.service_tax_percentage,
      //@ts-ignore
        outside_service_area_charge: data.outside_service_area_charge,
      //@ts-ignore
        peak_hour_multiplier: data.peak_hour_multiplier,
      //@ts-ignore
        peak_hours_start: data.peak_hours_start,
      //@ts-ignore
        peak_hours_end: data.peak_hours_end,
      //@ts-ignore
        is_active: data.is_active,
      });
    } catch (error: any) {
      console.error('Failed to load pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (pricing) {
      //@ts-ignore
        await pricingService.updatePricing(locationVehicleId, formData);
      } else {
      //@ts-ignore
        await pricingService.setPricing({
          location_vehicle_id: locationVehicleId,
          ...formData,
        });
      }
      loadPricing();
      alert('Pricing configuration saved successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to save pricing configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateFare = async () => {
    try {
      const request: CalculateFareRequest = {
        location_boundary_id: boundaryId,
        vehicle_type_id: locationVehicleId,
        ...fareCalc,
      };
      const result = await pricingService.calculateFare(request);
      setCalculatedFare(result);
    } catch (error: any) {
      alert(error.message || 'Failed to calculate fare');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Pricing Configuration - {vehicleName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Set pricing rules for this vehicle type
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalculator(true)}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Fare
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Loading pricing...</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Status Badge */}
          {pricing && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Configuration Status</span>
                <Badge variant={formData.is_active ? 'success' : 'error'}>
                  {formData.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </Card>
          )}

          {/* Base Pricing */}
          <Card className="p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Base Pricing
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_fare">Base Fare (NPR)</Label>
                <Input
                  id="base_fare"
                  type="number"
                  step="0.01"
                  value={formData.base_fare}
                  onChange={(e) =>
                    setFormData({ ...formData, base_fare: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="per_km">Per KM Rate (NPR)</Label>
                <Input
                  id="per_km"
                  type="number"
                  step="0.01"
                  value={formData.per_km_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, per_km_rate: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Waiting Time Charges */}
          <Card className="p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Waiting Time Charges
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waiting_rate">Per Minute Rate (NPR)</Label>
                <Input
                  id="waiting_rate"
                  type="number"
                  step="0.01"
                  value={formData.waiting_time_per_minute}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waiting_time_per_minute: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waiting_start">Free Waiting Time (Minutes)</Label>
                <Input
                  id="waiting_start"
                  type="number"
                  value={formData.eta_waiting_charge_starts_after_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eta_waiting_charge_starts_after_minutes: parseInt(
                        e.target.value
                      ),
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Additional Charges */}
          <Card className="p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Additional Charges
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outside_charge">
                  Outside Service Area Charge (NPR)
                </Label>
                <Input
                  id="outside_charge"
                  type="number"
                  step="0.01"
                  value={formData.outside_service_area_charge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outside_service_area_charge: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_tax">Service Tax (%)</Label>
                <Input
                  id="service_tax"
                  type="number"
                  step="0.01"
                  value={formData.service_tax_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_tax_percentage: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Peak Hours */}
          <Card className="p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Peak Hours Pricing
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peak_multiplier">Peak Hour Multiplier</Label>
                <Input
                  id="peak_multiplier"
                  type="number"
                  step="0.1"
                  value={formData.peak_hour_multiplier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      peak_hour_multiplier: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peak_start">Peak Hours Start</Label>
                <Input
                  id="peak_start"
                  type="time"
                  value={formData.peak_hours_start.slice(0, 5)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      peak_hours_start: `${e.target.value}:00`,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peak_end">Peak Hours End</Label>
                <Input
                  id="peak_end"
                  type="time"
                  value={formData.peak_hours_end.slice(0, 5)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      peak_hours_end: `${e.target.value}:00`,
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Active Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">
                  Activate Pricing Configuration
                </h4>
                <p className="text-sm text-muted-foreground">
                  Enable this pricing for customer bookings
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      )}

      {/* Fare Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fare Calculator</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="calc_distance">Distance (KM)</Label>
              <Input
                id="calc_distance"
                type="number"
                step="0.1"
                value={fareCalc.distance_km}
                onChange={(e) =>
                  setFareCalc({
                    ...fareCalc,
                    distance_km: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calc_waiting">Waiting Time (Minutes)</Label>
              <Input
                id="calc_waiting"
                type="number"
                value={fareCalc.waiting_time_minutes}
                onChange={(e) =>
                  setFareCalc({
                    ...fareCalc,
                    waiting_time_minutes: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="calc_outside"
                checked={fareCalc.is_outside_service_area}
                onCheckedChange={(checked) =>
                  setFareCalc({ ...fareCalc, is_outside_service_area: checked })
                }
              />
              <Label htmlFor="calc_outside">Outside Service Area</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="calc_peak"
                checked={fareCalc.is_peak_hour}
                onCheckedChange={(checked) =>
                  setFareCalc({ ...fareCalc, is_peak_hour: checked })
                }
              />
              <Label htmlFor="calc_peak">Peak Hour</Label>
            </div>

            <Button onClick={handleCalculateFare} className="w-full">
              Calculate Fare
            </Button>

            {calculatedFare && (
              <Card className="p-4 bg-lightprimary border-primary">
                <h4 className="font-semibold text-primary mb-3">Fare Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span className="font-medium">
                      NPR {calculatedFare.fare_breakdown.base_fare.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance Charge:</span>
                    <span className="font-medium">
                      NPR {calculatedFare.fare_breakdown.distance_charge.toFixed(2)}
                    </span>
                  </div>
                  {calculatedFare.fare_breakdown.waiting_time_charge > 0 && (
                    <div className="flex justify-between">
                      <span>Waiting Time:</span>
                      <span className="font-medium">
                        NPR{' '}
                        {calculatedFare.fare_breakdown.waiting_time_charge.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {calculatedFare.fare_breakdown.outside_service_area_charge > 0 && (
                    <div className="flex justify-between">
                      <span>Outside Service Area:</span>
                      <span className="font-medium">
                        NPR{' '}
                        {calculatedFare.fare_breakdown.outside_service_area_charge.toFixed(
                          2
                        )}
                      </span>
                    </div>
                  )}
                  {calculatedFare.fare_breakdown.peak_hour_charge > 0 && (
                    <div className="flex justify-between text-warning">
                      <span>Peak Hour Charge:</span>
                      <span className="font-medium">
                        NPR{' '}
                        {calculatedFare.fare_breakdown.peak_hour_charge.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service Tax:</span>
                    <span className="font-medium">
                      NPR {calculatedFare.fare_breakdown.service_tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-lg text-primary">
                    <span>Total Fare:</span>
                    <span>
                      NPR {calculatedFare.fare_breakdown.total_fare.toFixed(2)}
                    </span>
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

export default PricingConfigPanel;