import { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import Sidebar from './vertical/sidebar/Sidebar';
import Header from './vertical/header/Header';
import {  useSelector } from 'react-redux';
interface AuthState {
  user: { role: string } | null;
  loading: boolean;
}
const FullLayout: FC = () => {
  
  const location = useLocation();
  
  const { user, loading } = useSelector((state: { auth: AuthState }) => state.auth);

  // ────────────────────────────────────────────────
  // 1. Still loading → show loader (prevents flash)
  // ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading authentication...</div>
        {/* You can use a nice spinner component here */}
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // 2. Not logged in → redirect to login + preserve current location
  // ────────────────────────────────────────────────
  if (!user) {
    return <Navigate to="/auth/auth2/login" replace state={{ from: location }} />;
  }

  // ────────────────────────────────────────────────
  // 3. Logged in but wrong role → redirect or show access denied
  // ────────────────────────────────────────────────
  if (user.role !== 'admin') {
    // Option A: Redirect to home / dashboard
    // return <Navigate to="/" replace />;

    // Option B: Show nice "Access Denied" page (recommended for UX)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-4xl font-bold">Access Denied</h1>
        <p className="text-xl text-gray-600">This area is reserved for administrators only.</p>
        <button
          onClick={() => window.history.back()}
          className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="flex w-full min-h-screen">
        <div className="page-wrapper flex w-full ">
          {/* Header/sidebar */}
          <div className="xl:block hidden">
            <Sidebar />
          </div>
          <div className="body-wrapper w-full bg-white dark:bg-dark">
            {/* Top Header  */}
            <Header />

            {/* Body Content  */}
            <div className={'container mx-auto px-6 py-30'}>
              <main className="grow">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FullLayout;
