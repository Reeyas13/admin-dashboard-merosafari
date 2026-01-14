// components/SMSConfigForm.tsx

import React, { useState } from 'react';
import { smsConfigService } from '../services/smsConfigService';
import { CreateSMSConfigRequest, SMSConfig, SMSProvider } from '../types/thirdParty';
import { Button } from 'src/components/ui/button';
import { X } from 'lucide-react';

interface SMSConfigFormProps {
  config?: SMSConfig;
  onSuccess: () => void;
  onCancel: () => void;
}

const SMS_PROVIDERS: { value: SMSProvider; label: string }[] = [
  { value: 'test', label: 'Test Provider' },
  { value: 'smspasal', label: 'SMSPasal' },
  { value: 'samayasms', label: 'SamayaSMS' },
  { value: 'sparrow', label: 'Sparrow SMS' },
];

export const SMSConfigForm: React.FC<SMSConfigFormProps> = ({
  config,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateSMSConfigRequest>({
    name: config?.name || '',
    provider: config?.provider || 'test',
    api_key: config?.api_key || '',
    api_url: config?.api_url || '',
    sender_id: config?.sender_id || '',
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as SMSProvider;
    setFormData((prev) => ({
      ...prev,
      provider,
      api_url: getDefaultApiUrl(provider),
      is_test: provider === 'test',
    }));
  };

  const getDefaultApiUrl = (provider: SMSProvider): string => {
    const urls: Record<SMSProvider, string> = {
      test: '',
      smspasal: 'https://api.smspasal.com/api/v1/send',
      samayasms: 'https://api.samayasms.com/api/v1/send',
      sparrow: 'https://api.sparrowsms.com/v2/sms',
    };
    return urls[provider] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (config) {
        await smsConfigService.updateConfig(config.id, formData);
      } else {
        await smsConfigService.createConfig(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save SMS configuration');
    } finally {
      setLoading(false);
    }
  };

  const requiresSenderId = ['samayasms', 'sparrow'].includes(formData.provider);
  const requiresApiUrl = formData.provider !== 'test';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-foreground">
            {config ? 'Edit SMS Configuration' : 'Add SMS Provider'}
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
                {SMS_PROVIDERS.map((provider) => (
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
                placeholder="e.g., Production SMS Provider"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                API Key <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                placeholder="Enter your API key"
              />
            </div>

            {/* API URL */}
            {requiresApiUrl && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  API URL <span className="text-error">*</span>
                </label>
                <input
                  type="url"
                  name="api_url"
                  value={formData.api_url}
                  onChange={handleChange}
                  required={requiresApiUrl}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="https://api.example.com/send"
                />
              </div>
            )}

            {/* Sender ID */}
            {requiresSenderId && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sender ID <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="sender_id"
                  value={formData.sender_id}
                  onChange={handleChange}
                  required={requiresSenderId}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., MeroSafari"
                  maxLength={11}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum 11 characters
                </p>
              </div>
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
                  Test Mode (Messages won't be sent to actual recipients)
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

export default SMSConfigForm;