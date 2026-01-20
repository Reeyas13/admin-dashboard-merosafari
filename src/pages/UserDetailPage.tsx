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
import { User, Phone, Mail, Calendar, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { userService } from '../services/userService';
import { User as UserType } from '../services/driverService';
import { format } from 'date-fns';

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-500', icon: XCircle },
  suspended: { label: 'Suspended', color: 'bg-red-500', icon: XCircle },
};

export const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUser(userId);
    }
  }, [userId]);

  const loadUser = async (id: string) => {
    try {
      setLoading(true);
      const response = await userService.getUser(id);
      setUser(response.user);
    } catch (err) {
      console.error('Failed to load user:', err);
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
      icon: XCircle,
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
          <User className="mx-auto mb-4 text-slate-300 animate-pulse" size={64} />
          <div className="text-slate-500 text-xl">Loading user details...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto mb-4 text-slate-300" size={64} />
          <div className="text-slate-500 text-xl mb-4">User not found</div>
          <Button onClick={() => navigate('/users')}>
            <ArrowLeft className="mr-2" size={18} />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>User Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-slate-900">{user.full_name}</h1>
            {getStatusBadge(user.status)}
          </div>
          <p className="text-slate-600">User profile information</p>
        </div>
        <Button onClick={() => navigate('/users')} variant="outline">
          <ArrowLeft className="mr-2" size={18} />
          Back to Users
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <User size={20} />
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">User ID</div>
              <div className="font-mono text-sm bg-slate-100 p-2 rounded">{user.id}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                <Mail size={14} />
                Email
              </div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                <Phone size={14} />
                Phone
              </div>
              <div className="font-medium">{user.phone}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Role</div>
              <Badge className="capitalize">{user.role}</Badge>
            </div>
          </div>
        </Card>

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
                <div className="text-sm text-slate-600">{formatDate(user.created_at)}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              </div>
              <div className="flex-1">
                <div className="font-medium">Last Updated</div>
                <div className="text-sm text-slate-600">{formatDate(user.updated_at)}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserDetailPage;