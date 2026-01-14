import React, { useState } from 'react';
import { VehicleTypesList } from '../components/VehicleTypesList';
import { VehicleTypeForm } from '../components/VehicleTypeForm';
import { VehicleType } from '../types/vehicleTypes';

export const VehicleTypesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingVehicleType, setEditingVehicleType] = useState<
    VehicleType | undefined
  >();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setEditingVehicleType(undefined);
    setShowForm(true);
  };

  const handleEdit = (vehicleType: VehicleType) => {
    setEditingVehicleType(vehicleType);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVehicleType(undefined);
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVehicleType(undefined);
  };

  const handleDelete = () => {
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  return (
    <div className="p-6">
      <VehicleTypesList
        key={refreshKey}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <VehicleTypeForm
          vehicleType={editingVehicleType}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default VehicleTypesPage;