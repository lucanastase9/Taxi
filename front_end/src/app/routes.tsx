import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import ClientLayout from "./components/ClientLayout";
import DriverLayout from "./components/DriverLayout";
import ClientAccount from "./pages/client/Account";
import ClientNewRide from "./pages/client/NewRide";
import ClientTrips from "./pages/client/Trips";
import ClientReviews from "./pages/client/Reviews";
import DriverAccount from "./pages/driver/Account";
import DriverRides from "./pages/driver/Rides";
import DriverHistory from "./pages/driver/History";
import AdminLayout from "./AdminLayout";
import AdminClients from "./pages/admin/AdminClients";
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import DriverReviews from "./pages/driver/Review";

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: <AdminLogin />
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />
      },
      {
        path: 'clients',
        element: <AdminClients />
      },
      {
        path: 'drivers',
        element: <AdminDrivers />
      },
      {
        path: 'discounts',
        element: <AdminDiscounts />
      }
    ]
  },
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/client",
    Component: ClientLayout,
    children: [
      { index: true, Component: ClientAccount },
      { path: "account", Component: ClientAccount },
      { path: "new-ride", Component: ClientNewRide },
      { path: "trips", Component: ClientTrips },
      { path: "reviews", Component: ClientReviews },
    ],
  },
  {
    path: "/driver",
    Component: DriverLayout,
    children: [
      { index: true, Component: DriverAccount },
      { path: "account", Component: DriverAccount },
      { path: "rides", Component: DriverRides },
      { path: "history", Component: DriverHistory },
      { path: "reviews", Component: DriverReviews },
    ],
  },
]);
