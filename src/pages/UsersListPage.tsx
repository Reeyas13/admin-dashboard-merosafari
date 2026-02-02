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
import { User, RefreshCw, ChevronLeft, ChevronRight, Mail, Phone, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { userService } from '../services/userService';
import { User as UserType } from '../services/driverService';

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500' },
  inactive: { label: 'Inactive', color: 'bg-gray-500' },
  suspended: { label: 'Suspended', color: 'bg-red-500' },
};

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(pagination.page, pagination.page_size);
      setUsers(response.users);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDeleteClick = (user: UserType) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await userService.deleteUser(userToDelete.id);
      
      // Remove user from the list
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      
      // Close dialog
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || {
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
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            <User className="inline mr-3 text-blue-600" size={40} />
            User Management
          </h1>
          <p className="text-slate-600">View and manage all users in the system</p>
        </div>
        <Button onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={18} />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-slate-600">Total Users</div>
          <div className="text-2xl font-bold">{pagination.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === 'active').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Inactive</div>
          <div className="text-2xl font-bold text-gray-600">
            {users.filter((u) => u.status === 'inactive').length}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-slate-500">Loading users...</div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <User className="mx-auto mb-4 text-slate-300" size={48} />
                    <div className="text-slate-500">No users found</div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <div className="font-semibold">{user.full_name}</div>
                        <div className="text-sm text-slate-500 font-mono">
                          {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleDeleteClick(user)}
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
              {pagination.total} users
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
              <DialogTitle className="text-xl">Delete User</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{userToDelete?.full_name}</span>?
              <br />
              <br />
              This action cannot be undone. All data associated with this user including:
              <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                <li>User profile and account information</li>
                <li>Order history and transactions</li>
                <li>Activity logs and records</li>
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
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersListPage;