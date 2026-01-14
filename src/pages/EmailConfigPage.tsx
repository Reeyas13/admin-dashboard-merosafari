import React, { useState } from 'react';
import { EmailConfigList } from '../components/EmailConfigList';
import { EmailConfigForm } from '../components/EmailConfigForm';
import { EmailConfig } from '../types/thirdParty';

export const EmailConfigPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EmailConfig | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setEditingConfig(undefined);
    setShowForm(true);
  };

  const handleEdit = (config: EmailConfig) => {
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingConfig(undefined);
    setRefreshKey((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConfig(undefined);
  };

  return (
    <div className="p-6">
      <EmailConfigList key={refreshKey} onAdd={handleAdd} onEdit={handleEdit} />

      {showForm && (
        <EmailConfigForm
          config={editingConfig}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default EmailConfigPage;