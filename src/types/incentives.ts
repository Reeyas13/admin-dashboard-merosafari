// types/incentives.ts

export type ProgramType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type RewardType = 'FIXED_AMOUNT' | 'PERCENTAGE' | 'PER_RIDE_BONUS';

export interface IncentiveProgram {
  id: string;
  location_boundary_id: string;
  program_name: string;
  program_type: ProgramType;
  target_rides?: number;
  target_earnings?: number;
  reward_type: RewardType;
  reward_amount: number;
  start_date: string;
  end_date: string;
  description?: string;
  terms_and_conditions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateIncentiveRequest {
  location_boundary_id: string;
  program_name: string;
  program_type: ProgramType;
  target_rides?: number;
  target_earnings?: number;
  reward_type: RewardType;
  reward_amount: number;
  start_date: string;
  end_date: string;
  description?: string;
  terms_and_conditions?: string;
  is_active: boolean;
}

export interface CreateIncentiveResponse {
  message: string;
  program: IncentiveProgram;
}

export interface IncentiveProgramsResponse {
  programs: IncentiveProgram[];
  total_count: number;
}

export interface UpdateIncentiveRequest {
  program_name?: string;
  target_rides?: number;
  target_earnings?: number;
  reward_amount?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  terms_and_conditions?: string;
  is_active?: boolean;
}