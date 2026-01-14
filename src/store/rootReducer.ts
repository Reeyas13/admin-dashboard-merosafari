// store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
// import your slices
import authSlice from './slices/authSlice';
// import otherSlice from './slices/otherSlice';

const rootReducer = combineReducers({
  auth: authSlice,
  // other: otherSlice,
});

export default rootReducer;