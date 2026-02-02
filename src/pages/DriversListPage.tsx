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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Car, Eye, RefreshCw, ChevronLeft, ChevronRight, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { driverService, DriverDetail } from '../services/driverService';

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500' },
  pending_verification: { label: 'Pending', color: 'bg-yellow-500' },
  inactive: { label: 'Inactive', color: 'bg-gray-500' },
  suspended: { label: 'Suspended', color: 'bg-red-500' },
};

const verificationConfig = {
  approved: { label: 'Approved', color: 'bg-green-500' },
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  rejected: { label: 'Rejected', color: 'bg-red-500' },
};

export const DriversListPage: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<DriverDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<DriverDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  useEffect(() => {
    loadDrivers();
  }, [pagination.page]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const response = await driverService.getDrivers(pagination.page, pagination.page_size);
      setDrivers(response.drivers);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDeleteClick = (driver: DriverDetail) => {
    setDriverToDelete(driver);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return;

    try {
      setDeleting(true);
      await driverService.deleteDriver(driverToDelete.user.id);
      
      // Remove driver from the list
      setDrivers((prev) => prev.filter((d) => d.user.id !== driverToDelete.user.id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      
      // Close dialog
      setDeleteDialogOpen(false);
      setDriverToDelete(null);
    } catch (err) {
      console.error('Failed to delete driver:', err);
      alert('Failed to delete driver. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDriverToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-500',
    };
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const getVerificationBadge = (status?: string) => {
    if (!status) return <Badge className="bg-gray-400 text-white">No Verification</Badge>;
    const config = verificationConfig[status as keyof typeof verificationConfig] || {
      label: status,
      color: 'bg-gray-500',
    };
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const totalPages = Math.ceil(pagination.total / pagination.page_size);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Drivers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            <Car className="inline mr-3 text-blue-600" size={40} />
            Driver Management
          </h1>
          <p className="text-slate-600">View and manage all drivers</p>
        </div>
        <Button onClick={loadDrivers} disabled={loading}>
          <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={18} />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-slate-600">Total Drivers</div>
          <div className="text-2xl font-bold">{pagination.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {drivers.filter((d) => d.user.status === 'active').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Pending Verification</div>
          <div className="text-2xl font-bold text-yellow-600">
            {drivers.filter((d) => d.user.status === 'pending_verification').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Verified</div>
          <div className="text-2xl font-bold text-blue-600">
            {drivers.filter((d) => d.verification?.status === 'approved').length}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-slate-500">Loading drivers...</div>
                  </TableCell>
                </TableRow>
              ) : drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Car className="mx-auto mb-4 text-slate-300" size={48} />
                    <div className="text-slate-500">No drivers found</div>
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((driver) => (
                  <TableRow key={driver.user.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <div className="font-semibold">{driver.user.full_name}</div>
                        <div className="text-sm text-slate-500 font-mono">
                          {driver.user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{driver.user.email}</div>
                        <div className="text-slate-500">{driver.user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(driver.user.status)}</TableCell>
                    <TableCell>
                      {getVerificationBadge(driver.verification?.status)}
                      {driver.verification && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2"
                          onClick={() =>
                            navigate(`/driver-verification/${driver.verification?.id}`)
                          }
                        >
                          <Shield size={14} />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {driver.vehicle ? (
                        <div className="text-sm">
                          <div>{driver.vehicle.vehicle_model}</div>
                          <div className="text-slate-500">{driver.vehicle.vehicle_color}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(driver.user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/drivers/${driver.user.id}`)}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleDeleteClick(driver)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-sm text-slate-600">
              Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
              {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
              {pagination.total} drivers
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Delete Driver</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{driverToDelete?.user.full_name}</span>?
              <br />
              <br />
              This action cannot be undone. All data associated with this driver including:
              <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                <li>Driver profile and account information</li>
                <li>Vehicle information and registration</li>
                <li>Verification documents and history</li>
                <li>Trip history and earnings records</li>
                <li>Rating and review data</li>
              </ul>
              <br />
              will be permanently removed from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={16} />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2" size={16} />
                  Delete Driver
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversListPage;