// components/EmailConfigForm.tsx

import React, { useState } from 'react';
import { emailConfigService } from '../services/emailConfigService';
import {
  CreateEmailConfigRequest,
  EmailConfig,
  EmailProvider,
} from '../types/thirdParty';
import { Button } from 'src/components/ui/button';
import { X } from 'lucide-react';

interface EmailConfigFormProps {
  config?: EmailConfig;
  onSuccess: () => void;
  onCancel: () => void;
}

const EMAIL_PROVIDERS: { value: EmailProvider; label: string }[] = [
  { value: 'test', label: 'Test Provider' },
  { value: 'mailtrap', label: 'Mailtrap' },
  { value: 'smtp', label: 'Custom SMTP' },
];

export const EmailConfigForm: React.FC<EmailConfigFormProps> = ({
  config,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateEmailConfigRequest>({
    name: config?.name || '',
    provider: config?.provider || 'test',
    from_email: config?.from_email || '',
    from_name: config?.from_name || '',
    api_key: config?.api_key || '',
    smtp_host: config?.smtp_host || '',
    smtp_port: config?.smtp_port || 587,
    username: config?.username || '',
    password: config?.password || '',
    is_test: config?.is_test ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as EmailProvider;
    const defaults = getProviderDefaults(provider);
    setFormData((prev) => ({
      ...prev,
      provider,
      ...defaults,
    }));
  };

  const getProviderDefaults = (
    provider: EmailProvider
  ): Partial<CreateEmailConfigRequest> => {
    switch (provider) {
      case 'test':
        return {
          is_test: true,
          smtp_host: '',
          smtp_port: 0,
          username: '',
          password: '',
        };
      case 'mailtrap':
        return {
          smtp_host: 'sandbox.smtp.mailtrap.io',
          smtp_port: 2525,
          is_test: true,
        };
      case 'smtp':
        return {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          is_test: false,
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (config) {
        await emailConfigService.updateConfig(config.id, formData);
      } else {
        await emailConfigService.createConfig(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save Email configuration');
    } finally {
      setLoading(false);
    }
  };

  const requiresSMTP = ['mailtrap', 'smtp'].includes(formData.provider);
  const requiresApiKey = formData.provider === 'test';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-foreground">
            {config ? 'Edit Email Configuration' : 'Add Email Provider'}
          </h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-error bg-lighterror p-4">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Provider <span className="text-error">*</span>
              </label>
              <select
                name="provider"
                value={formData.provider}
                onChange={handleProviderChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {EMAIL_PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Configuration Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., Production Email Provider"
              />
            </div>

            {/* From Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                From Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                name="from_email"
                value={formData.from_email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="noreply@example.com"
              />
            </div>

            {/* From Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                From Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="from_name"
                value={formData.from_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="MeroSafari"
              />
            </div>

            {/* API Key (for test provider) */}
            {requiresApiKey && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  API Key <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleChange}
                  required={requiresApiKey}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                  placeholder="test-key"
                />
              </div>
            )}

            {/* SMTP Settings */}
            {requiresSMTP && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      SMTP Host <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="smtp_host"
                      value={formData.smtp_host}
                      onChange={handleChange}
                      required={requiresSMTP}
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      SMTP Port <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      name="smtp_port"
                      value={formData.smtp_port}
                      onChange={handleChange}
                      required={requiresSMTP}
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Username <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required={requiresSMTP}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="your-email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password <span className="text-error">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={requiresSMTP}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use app-specific password for Gmail
                  </p>
                </div>
              </>
            )}

            {/* Is Test */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_test"
                  id="is_test"
                  checked={formData.is_test}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="is_test"
                  className="ml-2 block text-sm text-foreground"
                >
                  Test Mode (Emails won't be sent to actual recipients)
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : config ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailConfigForm;