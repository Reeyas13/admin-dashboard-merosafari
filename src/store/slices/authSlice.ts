import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authServices from 'src/services/authServices';
import { LoginResponse, User, LoginCredentials } from 'src/types/auth';
// Company type
interface Company {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  website: string;
  is_active: boolean;
  status: string;
  approval_notes: string;
  subscription_tier: string;
  subscription_expiry: string;
  max_users: number;
  max_grievances: number;
  qr_code: string;
  qr_code_token: string;
  qr_code_path: string;
}

// Company context type
interface CompanyContext {
  company: Company;
  is_active: boolean;
  is_owner: boolean;
  joined_at: string;
}

// Menu type matching backend response
export interface MenuItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  path: string;
  order: number;
  items: MenuItem[];
}

interface AuthState {
  user: User | null;
  company: Company | null;
  companyContext: CompanyContext | null;
  menus: MenuItem[]; // ← NEW: Store menus
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  company: null,
  companyContext: null,
  menus: [], // ← Initialize empty
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};



// Login thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authServices.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authServices.logout();
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.company = null;
      state.companyContext = null;
      state.menus = [];
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Pending
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Login Success
      .addCase(loginUser.fulfilled, (state, action) => {
        const payload = action.payload;
        console.log({state,action})
        state.loading = false;
        state.user = payload.user;
        state.token = payload.access_token;
        state.refreshToken = payload.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
        
      })
      // Login Failed
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.company = null;
        state.companyContext = null;
        state.menus = [];
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, updateToken, clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectors for easy access
export const selectIsOwner = (state: { auth: AuthState }) => 
  state.auth.companyContext?.is_owner ?? false;

export const selectCompany = (state: { auth: AuthState }) => 
  state.auth.company;

export const selectUser = (state: { auth: AuthState }) => 
  state.auth.user;

export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  state.auth.isAuthenticated;

export const selectMenus = (state: { auth: AuthState }) => 
  state.auth.menus;