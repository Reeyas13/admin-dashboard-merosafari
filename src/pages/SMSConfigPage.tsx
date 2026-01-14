import React, { useState } from 'react';
import { SMSConfigList } from '../components/SMSConfigList';
import { SMSConfigForm } from '../components/SMSConfigForm';
import { SMSConfig } from '../types/thirdParty';

export const SMSConfigPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SMSConfig | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setEditingConfig(undefined);
    setShowForm(true);
  };

  const handleEdit = (config: SMSConfig) => {
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
      <SMSConfigList key={refreshKey} onAdd={handleAdd} onEdit={handleEdit} />

      {showForm && (
        <SMSConfigForm
          config={editingConfig}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default SMSConfigPage;