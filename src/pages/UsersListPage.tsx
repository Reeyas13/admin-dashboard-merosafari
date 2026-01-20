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
import { User, RefreshCw, ChevronLeft, ChevronRight, Mail, Phone, Eye } from 'lucide-react';
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-slate-500">Loading users...</div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/users/${user.id}`)}
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
    </div>
  );
};

export default UsersListPage;