// components/EmailConfigList.tsx

import React, { useEffect, useState } from 'react';
import { emailConfigService } from '../services/emailConfigService';
import { EmailConfig } from '../types/thirdParty';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'src/components/ui/breadcrumb';
import { Plus, Edit, Trash2, CheckCircle, Mail } from 'lucide-react';

interface EmailConfigListProps {
  onEdit?: (config: EmailConfig) => void;
  onAdd?: () => void;
}

export const EmailConfigList: React.FC<EmailConfigListProps> = ({
  onEdit,
  onAdd,
}) => {
  const [configs, setConfigs] = useState<EmailConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailConfigService.getAllConfigs();
      // console.log({response})
      if(Array.isArray(response.configs)){
        
        setConfigs(response.configs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Email configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await emailConfigService.activateConfig(id);
      fetchConfigs();
    } catch (err: any) {
      alert(err.message || 'Failed to activate configuration');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this Email configuration?')) {
      try {
        await emailConfigService.deleteConfig(id);
        fetchConfigs();
      } catch (err: any) {
        alert(err.message || 'Failed to delete configuration');
      }
    }
  };

  const getProviderBadgeVariant = (provider: string) => {
    const variants: Record<string, any> = {
      test: 'lightWarning',
      mailtrap: 'lightPrimary',
      smtp: 'lightSuccess',
    };
    return variants[provider] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading Email configurations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error bg-lighterror p-4">
        <p className="text-error font-medium">Error: {error}</p>
        <Button variant="outline" size="sm" onClick={fetchConfigs} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Email Configuration</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Email Configurations
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage email service providers for notifications
          </p>
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Email Provider
          </Button>
        )}
      </div>

      {/* Configurations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configs.map((config) => (
          <div
            key={config.id}
            className={`rounded-lg border bg-card hover:shadow-lg transition-shadow ${
              config.is_active ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {config.name}
                    </h3>
                    {config.is_active && (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getProviderBadgeVariant(config.provider)}>
                      {config.provider.toUpperCase()}
                    </Badge>
                    {config.is_test && <Badge variant="warning">Test Mode</Badge>}
                  </div>
                </div>
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">From Email:</span>
                  <span className="font-medium text-xs">{config.from_email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">From Name:</span>
                  <span className="font-medium">{config.from_name}</span>
                </div>
                {config.smtp_host && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SMTP Host:</span>
                    <span className="text-xs">{config.smtp_host}</span>
                  </div>
                )}
                {config.smtp_port && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SMTP Port:</span>
                    <span className="font-medium">{config.smtp_port}</span>
                  </div>
                )}
                {config.username && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="text-xs truncate max-w-[200px]">
                      {config.username}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-xs">
                    {new Date(config.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                {!config.is_active && (
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleActivate(config.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="lightprimary"
                    size="sm"
                    className={config.is_active ? 'flex-1' : ''}
                    onClick={() => onEdit(config)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="lighterror"
                  size="sm"
                  onClick={() => handleDelete(config.id)}
                  disabled={config.is_active}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="text-center py-12 rounded-lg border bg-card">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Email configurations found
          </h3>
          <p className="text-muted-foreground mb-6">
            Add your first Email provider to start sending notifications
          </p>
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Email Provider
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailConfigList;