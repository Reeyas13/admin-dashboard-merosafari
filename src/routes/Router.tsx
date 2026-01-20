// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import EmailConfigPage from 'src/pages/EmailConfigPage';
import SMSConfigPage from 'src/pages/SMSConfigPage';
import VehicleTypesPage from 'src/pages/VehicleTypesPage';
import BoundariesPage from 'src/pages/BoundariesPage';
import VehicleManagementPage from 'src/pages/VehicleManagementPage';
import PricingManagementPage from 'src/pages/PricingManagementPage';
import IncentivesManagementPage from 'src/pages/IncentivesManagementPage';
import DriverVerificationList from 'src/views/driver-verification/DriverVerificationList';
import DocumentReview from 'src/views/driver-verification/DocumentReview';
import ZonesPage from 'src/pages/ZonesPage'; // Add this import
import RidesListPage from 'src/pages/RidesListPage';
import RideDetailPage from 'src/pages/RideDetailPage';
import DriversListPage from 'src/pages/DriversListPage';
import DriverDetailPage from 'src/pages/DriverDetailPage';
import UsersListPage from 'src/pages/UsersListPage';
import UserDetailPage from 'src/pages/UserDetailPage';
/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// authentication
const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login')));
const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

// Dashboards
const Modern = Loadable(lazy(() => import('../views/dashboards/Modern')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/admin', exact: true, element: <Modern /> },

      //3rd party
      { path: '/email-config', element: <EmailConfigPage /> },
      { path: '/sms-config', element: <SMSConfigPage /> },

      //vehicle
      { path: '/vehicle-type', element: <VehicleTypesPage /> },
      { path: '/drivers', element: <DriversListPage /> },
      { path: '/drivers/:driverId', element: <DriverDetailPage /> },
      { path: '/users', element: <UsersListPage /> },
      { path: '/users/:userId', element: <UserDetailPage /> },
      //map & zones
      { path: '/map', element: <BoundariesPage /> },
      { path: '/zones', element: <ZonesPage /> }, // Add this route

      { path: '/vehicle-management', element: <VehicleManagementPage /> },
      { path: '/pricing', element: <PricingManagementPage /> },
      { path: '/incentives', element: <IncentivesManagementPage /> },
      {
        path: '/driver-verification',
        element: <DriverVerificationList />,
      },

      {
        path: '/rides',
        element: <RidesListPage />,
      },
      {
        path: '/rides/:rideId',
        element: <RideDetailPage />,
      },
      {
        path: '/driver-verification/:verificationId',
        element: <DocumentReview />,
      },

      //not found
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/auth2/login', element: <Login2 /> },
      { path: '/auth/auth2/register', element: <Register2 /> },
      { path: '/auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
