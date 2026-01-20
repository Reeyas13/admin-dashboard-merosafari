import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import {
  Car,
  MapPin,
  DollarSign,
  User,
  Clock,
  Navigation,
  ArrowLeft,
  Phone,
  Mail,
  Eye,
} from 'lucide-react';
import { rideService, Ride } from '../services/rideServices';
import { userService } from '../services/userService';
import { driverService, User as UserType } from '../services/driverService';
import { format } from 'date-fns';
import polyline from '@mapbox/polyline';

// OpenStreetMap with Leaflet
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const statusConfig = {
  requested: { label: 'Requested', color: 'bg-blue-500' },
  accepted: { label: 'Accepted', color: 'bg-yellow-500' },
  started: { label: 'Started', color: 'bg-purple-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

export const RideDetailPage: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for user and driver details
  const [userDetail, setUserDetail] = useState<UserType | null>(null);
  const [driverDetail, setDriverDetail] = useState<UserType | null>(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (rideId) {
      loadRide(rideId);
    }
  }, [rideId]);

  useEffect(() => {
    if (ride && mapContainerRef.current && !mapRef.current) {
      initializeMap();
    }
  }, [ride]);

  // Load participant details when ride is loaded
  useEffect(() => {
    if (ride) {
      loadParticipantDetails();
    }
  }, [ride]);

  const loadRide = async (id: string) => {
    try {
      setLoading(true);
      const response = await rideService.getRide(id);
      console.log({response})
      setRide(response.ride);
    } catch (err) {
      console.error('Failed to load ride:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user and driver details
  const loadParticipantDetails = async () => {
    if (!ride) return;
    
    try {
      setLoadingParticipants(true);
      
      // Load user details
      if (ride.user_id) {
        const userResponse = await userService.getUser(ride.user_id);
        setUserDetail(userResponse.user);
      }
      
      // Load driver details
      if (ride.driver_id) {
        const driverResponse = await driverService.getDriver(ride.driver_id);
        setDriverDetail(driverResponse.user);
      }
    } catch (err) {
      console.error('Failed to load participant details:', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const initializeMap = () => {
    if (!ride || !mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      [ride.pickup_location.latitude, ride.pickup_location.longitude],
      13
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom icons
    const pickupIcon = L.divIcon({
      html: `<div style="background: #22c55e; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const dropoffIcon = L.divIcon({
      html: `<div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M12 2L12 22M5 12L19 12"/>
        </svg>
      </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add pickup marker
    const pickupMarker = L.marker(
      [ride.pickup_location.latitude, ride.pickup_location.longitude],
      { icon: pickupIcon }
    ).addTo(map);
    pickupMarker.bindPopup(`
      <div style="padding: 8px;">
        <strong style="color: #22c55e;">Pickup Location</strong><br/>
        ${ride.pickup_location.address || ride.pickup_location.city}
      </div>
    `);

    // Add dropoff marker
    const dropoffMarker = L.marker(
      [ride.dropoff_location.latitude, ride.dropoff_location.longitude],
      { icon: dropoffIcon }
    ).addTo(map);
    dropoffMarker.bindPopup(`
      <div style="padding: 8px;">
        <strong style="color: #ef4444;">Dropoff Location</strong><br/>
        ${ride.dropoff_location.address || ride.dropoff_location.city}
      </div>
    `);

    // Draw route if polyline exists
    if (ride.route?.polyline) {
      try {
        const coordinates = polyline.decode(ride.route.polyline);
        const latLngs = coordinates.map((coord: number[]) => [coord[0], coord[1]] as [number, number]);

        L.polyline(latLngs, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.7,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        // Fit map to show entire route
        const bounds = L.latLngBounds([
          [ride.pickup_location.latitude, ride.pickup_location.longitude],
          [ride.dropoff_location.latitude, ride.dropoff_location.longitude],
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error('Failed to decode polyline:', error);
        // Fallback: fit bounds to pickup and dropoff
        const bounds = L.latLngBounds([
          [ride.pickup_location.latitude, ride.pickup_location.longitude],
          [ride.dropoff_location.latitude, ride.dropoff_location.longitude],
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      // No polyline: just show straight line and fit bounds
      L.polyline(
        [
          [ride.pickup_location.latitude, ride.pickup_location.longitude],
          [ride.dropoff_location.latitude, ride.dropoff_location.longitude],
        ],
        {
          color: '#94a3b8',
          weight: 3,
          opacity: 0.5,
          dashArray: '10, 10',
        }
      ).addTo(map);

      const bounds = L.latLngBounds([
        [ride.pickup_location.latitude, ride.pickup_location.longitude],
        [ride.dropoff_location.latitude, ride.dropoff_location.longitude],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-500',
    };
    return (
      <Badge className={`${config.color} text-white text-lg px-4 py-1`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto mb-4 text-slate-300 animate-pulse" size={64} />
          <div className="text-slate-500 text-xl">Loading ride details...</div>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto mb-4 text-slate-300" size={64} />
          <div className="text-slate-500 text-xl mb-4">Ride not found</div>
          <Button onClick={() => navigate('/rides')}>
            <ArrowLeft className="mr-2" size={18} />
            Back to Rides
          </Button>
        </div>
      </div>
    );
  }

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
            <BreadcrumbLink href="/rides">Rides</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ride Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Ride #{ride.id.slice(0, 8)}
            </h1>
            {getStatusBadge(ride.status)}
          </div>
          <p className="text-slate-600">Complete ride information and route visualization</p>
        </div>
        <Button onClick={() => navigate('/rides')} variant="outline">
          <ArrowLeft className="mr-2" size={18} />
          Back to Rides
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Ride Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ride Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Car size={20} />
              Ride Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Ride ID:</span>
                <span className="font-mono font-medium">{ride.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Vehicle Type:</span>
                <span className="font-medium capitalize">{ride.vehicle_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Method:</span>
                <span className="font-medium capitalize">{ride.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">OTP:</span>
                <span className="font-mono font-bold text-lg">{ride.otp}</span>
              </div>
              {ride.number_of_passengers > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Passengers:</span>
                  <span className="font-medium">{ride.number_of_passengers}</span>
                </div>
              )}
            </div>
          </Card>

          {/* User & Driver - UPDATED */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User size={20} />
              Participants
            </h3>
            <div className="space-y-4">
              {/* User Details */}
              <div>
                <div className="text-sm text-slate-600 mb-2 flex items-center justify-between">
                  <span>User</span>
                  {userDetail && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/users/${ride.user_id}`)}
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </Button>
                  )}
                </div>
                {loadingParticipants ? (
                  <div className="bg-slate-100 p-3 rounded animate-pulse">
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ) : userDetail ? (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="font-semibold text-blue-900">{userDetail.full_name}</div>
                    <div className="text-sm text-blue-700 flex items-center gap-1 mt-1">
                      <Phone size={12} />
                      {userDetail.phone}
                    </div>
                    <div className="text-sm text-blue-700 flex items-center gap-1">
                      <Mail size={12} />
                      {userDetail.email}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100 p-3 rounded">
                    <div className="font-mono text-sm text-slate-600">{ride.user_id}</div>
                  </div>
                )}
              </div>

              {/* Driver Details */}
              <div>
                <div className="text-sm text-slate-600 mb-2 flex items-center justify-between">
                  <span>Driver</span>
                  {driverDetail && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/drivers/${ride.driver_id}`)}
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </Button>
                  )}
                </div>
                {ride.driver_id ? (
                  loadingParticipants ? (
                    <div className="bg-slate-100 p-3 rounded animate-pulse">
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  ) : driverDetail ? (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <div className="font-semibold text-green-900">{driverDetail.full_name}</div>
                      <div className="text-sm text-green-700 flex items-center gap-1 mt-1">
                        <Phone size={12} />
                        {driverDetail.phone}
                      </div>
                      <div className="text-sm text-green-700 flex items-center gap-1">
                        <Mail size={12} />
                        {driverDetail.email}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100 p-3 rounded">
                      <div className="font-mono text-sm text-slate-600">{ride.driver_id}</div>
                    </div>
                  )
                ) : (
                  <div className="bg-slate-100 p-3 rounded text-slate-500 text-sm">
                    Not assigned
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock size={20} />
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-full bg-blue-200"></div>
                </div>
                <div className="pb-4 flex-1">
                  <div className="font-medium">Requested</div>
                  <div className="text-sm text-slate-600">{formatDate(ride.requested_at)}</div>
                </div>
              </div>
              {ride.accepted_at && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-0.5 h-full bg-yellow-200"></div>
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="font-medium">Accepted</div>
                    <div className="text-sm text-slate-600">{formatDate(ride.accepted_at)}</div>
                  </div>
                </div>
              )}
              {ride.started_at && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div className="w-0.5 h-full bg-purple-200"></div>
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="font-medium">Started</div>
                    <div className="text-sm text-slate-600">{formatDate(ride.started_at)}</div>
                  </div>
                </div>
              )}
              {ride.completed_at && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Completed</div>
                    <div className="text-sm text-slate-600">{formatDate(ride.completed_at)}</div>
                  </div>
                </div>
              )}
              {ride.cancelled_at && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Cancelled</div>
                    <div className="text-sm text-slate-600">{formatDate(ride.cancelled_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Fare Breakdown */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Fare Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Estimated Fare:</span>
                <span className="font-medium">NPR {ride.estimated_fare.toFixed(2)}</span>
              </div>
              {ride.final_fare > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Final Fare:</span>
                    <span className="font-medium">NPR {ride.final_fare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Driver Earnings:</span>
                    <span className="font-medium text-green-600">
                      NPR {ride.driver_earnings.toFixed(2)}
                    </span>
                  </div>
                  {ride.cashback > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Cashback:</span>
                      <span className="font-medium text-blue-600">
                        NPR {ride.cashback.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>NPR {ride.final_fare.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Route Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Navigation size={20} />
              Route Statistics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Distance:</span>
                <span className="font-medium">
                  {ride.distance_km > 0 ? `${ride.distance_km} km` : `${ride.route.distance_km} km (est)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Duration:</span>
                <span className="font-medium">
                  {ride.duration_minutes > 0
                    ? `${ride.duration_minutes} min`
                    : `${ride.route.duration_minutes} min (est)`}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Map & Locations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Route Map
            </h3>
            <div
              ref={mapContainerRef}
              className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-slate-200"
            />
            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Dropoff</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-blue-500 rounded"></div>
                <span>Route</span>
              </div>
            </div>
          </Card>

          {/* Locations */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Location Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-green-600" />
                  <span className="font-semibold">Pickup Location</span>
                </div>
                <div className="text-sm space-y-2 bg-green-50 p-4 rounded-lg">
                  <div>
                    <span className="text-slate-600">Address:</span>
                    <div className="font-medium">{ride.pickup_location.address}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">City:</span>
                    <div className="font-medium">{ride.pickup_location.city}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Coordinates:</span>
                    <div className="font-mono text-xs">
                      {ride.pickup_location.latitude.toFixed(6)}, {ride.pickup_location.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-red-600" />
                  <span className="font-semibold">Dropoff Location</span>
                </div>
                <div className="text-sm space-y-2 bg-red-50 p-4 rounded-lg">
                  <div>
                    <span className="text-slate-600">Address:</span>
                    <div className="font-medium">{ride.dropoff_location.address}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">City:</span>
                    <div className="font-medium">{ride.dropoff_location.city}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Coordinates:</span>
                    <div className="font-mono text-xs">
                      {ride.dropoff_location.latitude.toFixed(6)}, {ride.dropoff_location.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {ride.notes && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3">Notes</h3>
              <p className="text-slate-700">{ride.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetailPage;