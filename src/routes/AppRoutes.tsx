import React, { type ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { USER_ROLES } from '../constants/roles.js';

// Layouts
import DevoteeLayout from '../layouts/DevoteeLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthorityLayout from '../layouts/AuthorityLayout';

// Route Guards
import RoleRoute from './RoleRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import RootRoute from './RootRoute';

// Common Pages
import Unauthorized from '../pages/common/Unauthorized';

// Devotee Pages
import Home from '../pages/devotee/Home.jsx';
import Temples from '../pages/devotee/Temples.jsx';
import Experiences from '../pages/devotee/Experiences.jsx';
import PlanYourVisit from '../pages/devotee/PlanYourVisit.jsx';
import RegisterTemple from '../pages/devotee/RegisterTemple.jsx';
import Login from '../pages/devotee/Login';
import Register from '../pages/devotee/Register';
import TempleDetails from '../pages/devotee/TempleDetails.jsx';
import Profile from '../pages/devotee/Profile.jsx';
import MyBookings from '../pages/devotee/MyBookings.jsx';
import BookingDetails from '../pages/devotee/BookingDetails.jsx';
import BookService from '../pages/devotee/BookService.jsx';
import Notifications from '../pages/devotee/Notifications.jsx';
import SavedTemples from '../pages/devotee/SavedTemples.jsx';
import BookingVerify from '../pages/public/BookingVerify.jsx';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminTempleRegistrations from '../pages/admin/AdminTempleRegistrations.jsx';
import AdminRegistrationDetails from '../pages/admin/AdminRegistrationDetails.jsx';
import AdminTemples from '../pages/admin/AdminTemples.jsx';
import AdminTempleDetails from '../pages/admin/AdminTempleDetails.jsx';
import AdminCategories from '../pages/admin/AdminCategories.jsx';
import AdminAuthorities from '../pages/admin/AdminAuthorities.jsx';
import AdminUsers from '../pages/admin/AdminUsers.jsx';
import AdminDevotees from '../pages/admin/AdminDevotees.jsx';
import AdminBookings from '../pages/admin/AdminBookings.jsx';
import AdminPayments from '../pages/admin/AdminPayments.jsx';
import AdminFeedbackReviews from '../pages/admin/AdminFeedbackReviews.jsx';
import AdminAnalytics from '../pages/admin/AdminAnalytics.jsx';
import AdminAudit from '../pages/admin/AdminAudit.jsx';

// Authority Pages
import AuthorityDashboard from '../pages/authority/AuthorityDashboard.jsx';
import AuthorityLogin from '../pages/authority/AuthorityLogin';
import AuthorityTempleProfile from '../pages/authority/AuthorityTempleProfile.jsx';
import AuthorityGallery from '../pages/authority/AuthorityGallery.jsx';
import AuthorityServices from '../pages/authority/AuthorityServices.jsx';
import AuthorityTimeSlots from '../pages/authority/AuthorityTimeSlots.jsx';
import AuthorityBookings from '../pages/authority/AuthorityBookings.jsx';
import AuthorityDevotees from '../pages/authority/AuthorityDevotees.jsx';
import AuthorityAnalytics from '../pages/authority/AuthorityAnalytics.jsx';
import AuthorityNotifications from '../pages/authority/AuthorityNotifications.jsx';
import AuthoritySettings from '../pages/authority/AuthoritySettings.jsx';
import AuthorityAnnouncements from '../pages/authority/AuthorityAnnouncements.jsx';

export const AppRoutes = (): ReactElement => {
  return (
    <Routes>
      {/* 1. Application Entry Route: Directs to role dashboard if authenticated, or /login if unauthenticated */}
      <Route path={ROUTES.HOME} element={<RootRoute />} />

      {/* 2. Devotee / Public Routes */}
      <Route element={<DevoteeLayout />}>
        {/* Public landing page alternative */}
        <Route path={ROUTES.PUBLIC_HOME} element={<Home />} />

        {/* Protected Devotee Dashboard (Primary landing for DEVOTEE) */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <RoleRoute allowedRoles={[USER_ROLES.DEVOTEE]}>
              <Home />
            </RoleRoute>
          }
        />

        {/* Public Browsing Routes */}
        <Route path={ROUTES.TEMPLES} element={<Temples />} />
        <Route path={ROUTES.TEMPLE_DETAILS} element={<TempleDetails />} />
        <Route path={ROUTES.EXPERIENCES} element={<Experiences />} />
        <Route path={ROUTES.REGISTER_TEMPLE} element={<RegisterTemple />} />
        <Route path={ROUTES.VERIFY_BOOKING} element={<BookingVerify />} />

        {/* Public Authentication Screens (Redirects authenticated users to their role dashboard) */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Devotee Routes */}
        <Route
          path={ROUTES.PROFILE}
          element={
            <RoleRoute allowedRoles={[USER_ROLES.DEVOTEE]}>
              <Profile />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.MY_BOOKINGS}
          element={
            <RoleRoute allowedRoles={[USER_ROLES.DEVOTEE]}>
              <MyBookings />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.BOOKING_DETAILS}
          element={
            <RoleRoute allowedRoles={[USER_ROLES.DEVOTEE]}>
              <BookingDetails />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.BOOK_SERVICE}
          element={
            <RoleRoute allowedRoles={[USER_ROLES.DEVOTEE]}>
              <BookService />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.PLAN_YOUR_VISIT}
          element={
            <RoleRoute allowedRoles={[USER_ROLES.DEVOTEE]}>
              <PlanYourVisit />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.SAVED_TEMPLES}
          element={
            <RoleRoute allowedRoles={[USER_ROLES.DEVOTEE]}>
              <SavedTemples />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.NOTIFICATIONS}
          element={
            <RoleRoute allowedRoles={[USER_ROLES.DEVOTEE]}>
              <Notifications />
            </RoleRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* 3. Admin Authentication: Redirects to universal login */}
      <Route path={ROUTES.ADMIN_LOGIN} element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* 4. Protected Admin Management Routes (requires role = ADMIN) */}
      <Route
        path={ROUTES.ADMIN}
        element={
          <RoleRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="registrations" element={<AdminTempleRegistrations />} />
        <Route path="registrations/:id" element={<AdminRegistrationDetails />} />
        <Route path="temples" element={<AdminTemples />} />
        <Route path="temples/:id" element={<AdminTempleDetails />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="authorities" element={<AdminAuthorities />} />
        <Route path="devotees" element={<AdminDevotees />} />
        <Route path="users" element={<Navigate to={`${ROUTES.ADMIN}/devotees`} replace />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="feedback" element={<AdminFeedbackReviews />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="audit" element={<AdminAudit />} />
      </Route>

      {/* 5. Temple Authority Authentication: Redirects to universal login */}
      <Route path={ROUTES.AUTHORITY_LOGIN} element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* 6. Protected Temple Authority Routes (requires role = TEMPLE_AUTHORITY) */}
      <Route
        path={ROUTES.AUTHORITY}
        element={
          <RoleRoute allowedRoles={[USER_ROLES.TEMPLE_AUTHORITY]}>
            <AuthorityLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AuthorityDashboard />} />
        <Route path="dashboard" element={<AuthorityDashboard />} />
        <Route path="temple" element={<AuthorityTempleProfile />} />
        <Route path="announcements" element={<AuthorityAnnouncements />} />
        <Route path="gallery" element={<AuthorityGallery />} />
        <Route path="services" element={<AuthorityServices />} />
        <Route path="time-slots" element={<AuthorityTimeSlots />} />
        <Route path="bookings" element={<AuthorityBookings />} />
        <Route path="devotees" element={<AuthorityDevotees />} />
        <Route path="analytics" element={<AuthorityAnalytics />} />
        <Route path="notifications" element={<AuthorityNotifications />} />
        <Route path="settings" element={<AuthoritySettings />} />
        <Route path="change-password" element={<AuthoritySettings />} />
      </Route>

      {/* 7. Fallback: redirects to RootRoute which safely determines destination */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;
