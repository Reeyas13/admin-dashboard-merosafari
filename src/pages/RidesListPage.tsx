import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import {
  Car,
  MapPin,
  Filter,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { rideService, Ride, GetRidesParams } from '../services/rideServices';
import { format } from 'date-fns';
  
const statusConfig = {
  requested: { label: 'Requested', color: 'bg-blue-500' },
  accepted: { label: 'Accepted', color: 'bg-yellow-500' },
  started: { label: 'Started', color: 'bg-purple-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

export const RidesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  });

  const [filters, setFilters] = useState<GetRidesParams>({
    page: 1,
    page_size: 20,
    status: '',
    vehicle_type: '',
    from_date: '',
    to_date: '',
  });

  useEffect(() => {
    loadRides();
  }, [filters.page]);

  const loadRides = async () => {
    try {
      setLoading(true);
      const response = await rideService.getRides(filters);
      setRides(response.rides);
      setPagination({
        page: response.page,
        page_size: response.page_size,
        total: response.total,
        total_pages: response.total_pages,
      });
    } catch (err) {
      console.error('Failed to load rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof GetRidesParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleApplyFilters = () => {
    loadRides();
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      status: '',
      vehicle_type: '',
      from_date: '',
      to_date: '',
    });
    setTimeout(loadRides, 100);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-500',
    };
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

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
            <BreadcrumbPage>Rides</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            <Car className="inline mr-3 text-blue-600" size={40} />
            Ride Management
          </h1>
          <p className="text-slate-600">
            View and manage all rides in the system
          </p>
        </div>
        <Button onClick={loadRides} disabled={loading}>
          <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={18} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <Label>Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Vehicle Type</Label>
            <Input
              placeholder="e.g., safari"
              value={filters.vehicle_type}
              onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
            />
          </div>
          <div>
            <Label>From Date</Label>
            <Input
              type="date"
              value={filters.from_date}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
            />
          </div>
          <div>
            <Label>To Date</Label>
            <Input
              type="date"
              value={filters.to_date}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-slate-600">Total Rides</div>
          <div className="text-2xl font-bold">{pagination.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {rides.filter((r) => r.status === 'completed').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Active</div>
          <div className="text-2xl font-bold text-blue-600">
            {rides.filter((r) => ['requested', 'accepted', 'started'].includes(r.status)).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">
            {rides.filter((r) => r.status === 'cancelled').length}
          </div>
        </Card>
      </div>

      {/* Rides Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ride ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="text-slate-500">Loading rides...</div>
                  </TableCell>
                </TableRow>
              ) : rides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Car className="mx-auto mb-4 text-slate-300" size={48} />
                    <div className="text-slate-500">No rides found</div>
                  </TableCell>
                </TableRow>
              ) : (
                rides.map((ride) => (
                  <TableRow key={ride.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">
                      {ride.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{getStatusBadge(ride.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car size={16} />
                        <span className="capitalize">{ride.vehicle_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin size={14} className="text-green-600" />
                          <span className="truncate max-w-[200px]">
                            {ride.pickup_location.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-red-600" />
                          <span className="truncate max-w-[200px]">
                            {ride.dropoff_location.city}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold">
                          NPR {ride.final_fare || ride.estimated_fare}
                        </div>
                        {ride.final_fare > 0 && (
                          <div className="text-xs text-slate-500">
                            Est: NPR {ride.estimated_fare}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ride.distance_km > 0 ? `${ride.distance_km} km` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(ride.requested_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/rides/${ride.id}`)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-sm text-slate-600">
              Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
              {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
              {pagination.total} rides
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === pagination.total_pages ||
                      Math.abs(p - pagination.page) <= 1
                  )
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <Button
                        variant={p === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.total_pages}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RidesListPage;