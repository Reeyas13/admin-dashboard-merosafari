// pages/IncentivesManagementPage.tsx

import React, { useState, useEffect } from 'react';
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
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Switch } from 'src/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from 'src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';
import {
  Award,
  Plus,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  RefreshCw,
  MapPin,
  Car,
  Copy,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  IncentiveProgram,
  ProgramType,
  RewardType,
} from '../types/incentives';
import { Boundary } from '../types/boundary';
import { incentiveService } from '../services/incentiveService';
import { boundaryService } from '../services/boundaryService';

export const IncentivesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [selectedBoundary, setSelectedBoundary] = useState<Boundary | null>(null);
  const [programs, setPrograms] = useState<IncentiveProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<IncentiveProgram | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ProgramType | 'ALL'>('ALL');
  const [filterActive, setFilterActive] = useState<boolean | 'ALL'>('ALL');

  const [formData, setFormData] = useState({
    program_name: '',
    program_type: 'WEEKLY' as ProgramType,
    target_rides: 20,
    target_earnings: 5000,
    reward_type: 'FIXED_AMOUNT' as RewardType,
    reward_amount: 500,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    description: '',
    terms_and_conditions: '',
    is_active: true,
  });

  useEffect(() => {
    loadBoundaries();
  }, []);

  useEffect(() => {
    if (selectedBoundary) {
      loadPrograms();
    }
  }, [selectedBoundary]);

  const loadBoundaries = async () => {
    try {
      setLoading(true);
      const response = await boundaryService.getBoundaries();
      const activeBoundaries = response.boundaries.filter((b) => b.is_active);
      setBoundaries(activeBoundaries);
      if (activeBoundaries.length > 0 && !selectedBoundary) {
        setSelectedBoundary(activeBoundaries[0]);
      }
    } catch (error: any) {
      console.error('Failed to load boundaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    if (!selectedBoundary) return;
    try {
      setLoading(true);
      const response = await incentiveService.getIncentivePrograms(
        selectedBoundary.id,
        false
      );
      setPrograms(response.programs);
    } catch (error: any) {
      console.error('Failed to load incentive programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!selectedBoundary) return;
    try {
      await incentiveService.createIncentiveProgram({
        location_boundary_id: selectedBoundary.id,
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      });
      setShowCreateDialog(false);
      loadPrograms();
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Failed to create incentive program');
    }
  };

  const handleUpdateProgram = async () => {
    if (!editingProgram) return;
    try {
      await incentiveService.updateIncentiveProgram(editingProgram.id, {
        program_name: formData.program_name,
        target_rides: formData.target_rides,
        target_earnings: formData.target_earnings,
        reward_amount: formData.reward_amount,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        description: formData.description,
        terms_and_conditions: formData.terms_and_conditions,
        is_active: formData.is_active,
      });
      setEditingProgram(null);
      loadPrograms();
      resetForm();
      setShowCreateDialog(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update incentive program');
    }
  };

  const handleToggleProgram = async (programId: string) => {
    try {
      await incentiveService.toggleIncentiveProgram(programId);
      loadPrograms();
    } catch (error: any) {
      alert(error.message || 'Failed to toggle incentive program');
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this incentive program?')) {
      return;
    }
    try {
      await incentiveService.deleteIncentiveProgram(programId);
      loadPrograms();
    } catch (error: any) {
      alert(error.message || 'Failed to delete incentive program');
    }
  };

  const handleEditProgram = (program: IncentiveProgram) => {
    setEditingProgram(program);
    setFormData({
      program_name: program.program_name,
      program_type: program.program_type,
      target_rides: program.target_rides || 0,
      target_earnings: program.target_earnings || 0,
      reward_type: program.reward_type,
      reward_amount: program.reward_amount,
      start_date: program.start_date.split('T')[0],
      end_date: program.end_date.split('T')[0],
      description: program.description || '',
      terms_and_conditions: program.terms_and_conditions || '',
      is_active: program.is_active,
    });
    setShowCreateDialog(true);
  };

  const handleDuplicateProgram = (program: IncentiveProgram) => {
    setFormData({
      program_name: `${program.program_name} (Copy)`,
      program_type: program.program_type,
      target_rides: program.target_rides || 0,
      target_earnings: program.target_earnings || 0,
      reward_type: program.reward_type,
      reward_amount: program.reward_amount,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      description: program.description || '',
      terms_and_conditions: program.terms_and_conditions || '',
      is_active: false,
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      program_name: '',
      program_type: 'WEEKLY',
      target_rides: 20,
      target_earnings: 5000,
      reward_type: 'FIXED_AMOUNT',
      reward_amount: 500,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      description: '',
      terms_and_conditions: '',
      is_active: true,
    });
    setEditingProgram(null);
  };

  const getProgramTypeBadgeVariant = (type: ProgramType) => {
    const variants: Record<ProgramType, any> = {
      DAILY: 'info',
      WEEKLY: 'success',
      MONTHLY: 'warning',
      CUSTOM: 'default',
    };
    return variants[type] || 'default';
  };

  // const getRewardTypeBadgeVariant = (type: RewardType) => {
  //   const variants: Record<RewardType, any> = {
  //     FIXED_AMOUNT: 'success',
  //     PERCENTAGE: 'info',
  //     PER_RIDE_BONUS: 'warning',
  //   };
  //   return variants[type] || 'default';
  // };

  const filteredBoundaries = boundaries.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrograms = programs.filter((program) => {
    if (filterType !== 'ALL' && program.program_type !== filterType) {
      return false;
    }
    if (filterActive !== 'ALL' && program.is_active !== filterActive) {
      return false;
    }
    return true;
  });

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/map">Locations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Incentive Programs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Award className="h-7 w-7 text-primary" />
              Incentive Programs
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage driver rewards and incentive programs by location
            </p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/vehicle-management')}
                >
                  <Car className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Vehicles</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/pricing')}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Pricing</p>
              </TooltipContent>
            </Tooltip>
            <Button onClick={loadPrograms} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Location Selector */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Select Location
              </h3>
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredBoundaries.map((boundary) => (
                  <div
                    key={boundary.id}
                    className={`p-2 rounded border cursor-pointer text-sm transition-all ${
                      selectedBoundary?.id === boundary.id
                        ? 'border-primary bg-lightprimary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedBoundary(boundary)}
                  >
                    <div className="font-medium">{boundary.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {boundary.district}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Filters */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Filters
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Program Type</Label>
                  <Select
                    value={filterType}
                    onValueChange={(value: any) => setFilterType(value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={String(filterActive)}
                    onValueChange={(value: any) =>
                      setFilterActive(value === 'ALL' ? 'ALL' : value === 'true')
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="true">Active Only</SelectItem>
                      <SelectItem value="false">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Stats */}
            {selectedBoundary && (
              <Card className="p-4 bg-lightprimary border-primary">
                <h4 className="font-semibold text-primary text-sm mb-3">
                  Program Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{programs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active:</span>
                    <span className="font-medium text-success">
                      {programs.filter((p) => p.is_active).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inactive:</span>
                    <span className="font-medium text-error">
                      {programs.filter((p) => !p.is_active).length}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-4">
            {selectedBoundary ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Programs in {selectedBoundary.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {filteredPrograms.length} program
                        {filteredPrograms.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        resetForm();
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Program
                    </Button>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="border rounded-lg p-4 animate-pulse"
                        >
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPrograms.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No programs found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Create incentive programs to reward your drivers
                      </p>
                      <Button
                        onClick={() => {
                          resetForm();
                          setShowCreateDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Program
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredPrograms.map((program) => (
                        <Card
                          key={program.id}
                          className="p-5 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Award className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-foreground text-lg">
                                  {program.program_name}
                                </h3>
                                <Badge
                                  variant={getProgramTypeBadgeVariant(
                                    program.program_type
                                  )}
                                >
                                  {program.program_type}
                                </Badge>
                                <Badge
                                  variant={
                                    program.is_active ? 'success' : 'error'
                                  }
                                >
                                  {program.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>

                              {program.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {program.description}
                                </p>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {program.target_rides && (
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="text-muted-foreground text-xs">
                                        Target Rides
                                      </div>
                                      <div className="font-medium">
                                        {program.target_rides}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {program.target_earnings && (
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="text-muted-foreground text-xs">
                                        Target Earnings
                                      </div>
                                      <div className="font-medium">
                                        NPR {program.target_earnings}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="text-muted-foreground text-xs">
                                      Reward
                                    </div>
                                    <div className="font-medium">
                                      NPR {program.reward_amount}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="text-muted-foreground text-xs">
                                      Duration
                                    </div>
                                    <div className="font-medium text-xs">
                                      {new Date(
                                        program.start_date
                                      ).toLocaleDateString()}{' '}
                                      -{' '}
                                      {new Date(
                                        program.end_date
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditProgram(program)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Program</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDuplicateProgram(program)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Duplicate Program</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={
                                      program.is_active
                                        ? 'lighterror'
                                        : 'lightsuccess'
                                    }
                                    size="icon"
                                    onClick={() =>
                                      handleToggleProgram(program.id)
                                    }
                                  >
                                    {program.is_active ? (
                                      <X className="h-4 w-4" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {program.is_active
                                      ? 'Deactivate'
                                      : 'Activate'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="lighterror"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteProgram(program.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete Program</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select a Location
                </h3>
                <p className="text-muted-foreground">
                  Choose a location from the sidebar to manage incentive programs
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? 'Edit Program' : 'Create Incentive Program'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="program_name">Program Name</Label>
                <Input
                  id="program_name"
                  value={formData.program_name}
                  onChange={(e) =>
                    setFormData({ ...formData, program_name: e.target.value })
                  }
                  placeholder="e.g., Weekend Warrior"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program_type">Program Type</Label>
                  <Select
                    value={formData.program_type}
                    onValueChange={(value: ProgramType) =>
                      setFormData({ ...formData, program_type: value })
                    }
                    disabled={!!editingProgram}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reward_type">Reward Type</Label>
                  <Select
                    value={formData.reward_type}
                    onValueChange={(value: RewardType) =>
                      setFormData({ ...formData, reward_type: value })
                    }
                    disabled={!!editingProgram}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="PER_RIDE_BONUS">
                        Per Ride Bonus
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_rides">Target Rides</Label>
                  <Input
                    id="target_rides"
                    type="number"
                    value={formData.target_rides}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_rides: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_earnings">Target Earnings (NPR)</Label>
                  <Input
                    id="target_earnings"
                    type="number"
                    value={formData.target_earnings}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_earnings: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_amount">Reward Amount (NPR)</Label>
                <Input
                  id="reward_amount"
                  type="number"
                  step="0.01"
                  value={formData.reward_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reward_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the incentive program..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms_and_conditions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terms_and_conditions: e.target.value,
                    })
                  }
                  placeholder="Program terms and conditions..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Activate program immediately</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  editingProgram ? handleUpdateProgram : handleCreateProgram
                }
                disabled={!formData.program_name}
              >
                {editingProgram ? 'Update Program' : 'Create Program'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default IncentivesManagementPage;