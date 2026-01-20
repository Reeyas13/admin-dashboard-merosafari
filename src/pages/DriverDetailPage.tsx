import React, { useState, useEffect } from 'react';
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
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { driverService, DriverDetail } from '../services/driverService';
import { format } from 'date-fns';

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500', icon: CheckCircle },
  pending_verification: { label: 'Pending Verification', color: 'bg-yellow-500', icon: Clock },
  inactive: { label: 'Inactive', color: 'bg-gray-500', icon: XCircle },
  suspended: { label: 'Suspended', color: 'bg-red-500', icon: XCircle },
};

const verificationConfig = {
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  pending: { label: 'Pending Review', color: 'bg-yellow-500', icon: Clock },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  resubmit_required: { label: 'Resubmit Required', color: 'bg-orange-500', icon: Clock },
  expired: { label: 'Expired', color: 'bg-gray-500', icon: XCircle },
};

export const DriverDetailPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driverId) {
      loadDriver(driverId);
    }
  }, [driverId]);

  const loadDriver = async (id: string) => {
    try {
      setLoading(true);
      const response = await driverService.getDriver(id);
      setDriver(response);
    } catch (err) {
      console.error('Failed to load driver:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-500',
      icon: Clock,
    };
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white text-lg px-4 py-2 flex items-center gap-2`}>
        <Icon size={18} />
        {config.label}
      </Badge>
    );
  };

  const getVerificationBadge = (status?: string) => {
    if (!status)
      return (
        <Badge className="bg-gray-400 text-white text-lg px-4 py-2">No Verification</Badge>
      );
    const config = verificationConfig[status as keyof typeof verificationConfig] || {
      label: status,
      color: 'bg-gray-500',
      icon: Clock,
    };
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white text-lg px-4 py-2 flex items-center gap-2`}>
        <Icon size={18} />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto mb-4 text-slate-300 animate-pulse" size={64} />
          <div className="text-slate-500 text-xl">Loading driver details...</div>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Car className="mx-auto mb-4 text-slate-300" size={64} />
          <div className="text-slate-500 text-xl mb-4">Driver not found</div>
          <Button onClick={() => navigate('/drivers')}>
            <ArrowLeft className="mr-2" size={18} />
            Back to Drivers
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
            <BreadcrumbLink href="/drivers">Drivers</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Driver Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-slate-900">{driver.user.full_name}</h1>
            {getStatusBadge(driver.user.status)}
          </div>
          <p className="text-slate-600">Complete driver profile and verification status</p>
        </div>
        <Button onClick={() => navigate('/drivers')} variant="outline">
          <ArrowLeft className="mr-2" size={18} />
          Back to Drivers
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User size={20} />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-600 mb-1">Driver ID</div>
                <div className="font-mono text-sm bg-slate-100 p-2 rounded">
                  {driver.user.id}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                  <Mail size={14} />
                  Email
                </div>
                <div className="font-medium">{driver.user.email}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                  <Phone size={14} />
                  Phone
                </div>
                <div className="font-medium">{driver.user.phone}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Role</div>
                <Badge className="capitalize">{driver.user.role}</Badge>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-full bg-blue-200"></div>
                </div>
                <div className="pb-4 flex-1">
                  <div className="font-medium">Joined</div>
                  <div className="text-sm text-slate-600">
                    {formatDate(driver.user.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Last Updated</div>
                  <div className="text-sm text-slate-600">
                    {formatDate(driver.user.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verification Status */}
          {driver.verification ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield size={20} />
                  Verification Status
                </h3>
                {getVerificationBadge(driver.verification.status)}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Verification ID</div>
                  <div className="font-mono text-sm bg-slate-100 p-2 rounded mb-4">
                    {driver.verification.id}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-slate-600">Submitted At</div>
                      <div className="font-medium">
                        {formatDate(driver.verification.submitted_at)}
                      </div>
                    </div>
                    {driver.verification.reviewed_at && (
                      <div>
                        <div className="text-sm text-slate-600">Reviewed At</div>
                        <div className="font-medium">
                          {formatDate(driver.verification.reviewed_at)}
                        </div>
                      </div>
                    )}
                    {driver.verification.approved_at && (
                      <div>
                        <div className="text-sm text-slate-600">Approved At</div>
                        <div className="font-medium">
                          {formatDate(driver.verification.approved_at)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {driver.verification.expires_at && (
                    <div>
                      <div className="text-sm text-slate-600">Expires At</div>
                      <div className="font-medium">
                        {formatDate(driver.verification.expires_at)}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-slate-600">Submission Count</div>
                    <div className="font-medium">{driver.verification.submission_count}</div>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() =>
                        navigate(`/driver-verification/${driver.verification?.id}`)
                      }
                      className="w-full"
                    >
                      <Shield className="mr-2" size={18} />
                      View Verification Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center py-8">
                <Shield className="mx-auto mb-4 text-slate-300" size={48} />
                <h3 className="font-semibold text-lg mb-2">No Verification Submitted</h3>
                <p className="text-slate-600 mb-4">
                  This driver hasn't submitted verification documents yet.
                </p>
              </div>
            </Card>
          )}

          {/* Vehicle Information */}
          {driver.vehicle ? (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Car size={20} />
                Vehicle Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-600">Vehicle ID</div>
                    <div className="font-mono text-sm bg-slate-100 p-2 rounded">
                      {driver.vehicle.id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Model</div>
                    <div className="font-medium">{driver.vehicle.vehicle_model}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Color</div>
                    <div className="font-medium capitalize">{driver.vehicle.vehicle_color}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {driver.vehicle.vehicle_registration_number && (
                    <div>
                      <div className="text-sm text-slate-600">Registration Number</div>
                      <div className="font-medium">
                        {driver.vehicle.vehicle_registration_number}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-slate-600">Status</div>
                    <Badge className={driver.vehicle.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                      {driver.vehicle.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Registered At</div>
                    <div className="font-medium">{formatDate(driver.vehicle.created_at)}</div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center py-8">
                <Car className="mx-auto mb-4 text-slate-300" size={48} />
                <h3 className="font-semibold text-lg mb-2">No Vehicle Registered</h3>
                <p className="text-slate-600">This driver hasn't registered a vehicle yet.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDetailPage;