import React, { type ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DevoteeNavbar from '../components/devotee/DevoteeNavbar.jsx';
import DevoteeFooter from '../components/devotee/DevoteeFooter.jsx';
import { ROUTES } from '../constants/routes.js';

export const DevoteeLayout = (): ReactElement => {
  const location = useLocation();
  const isHome =
    location.pathname === ROUTES.HOME ||
    location.pathname === '/' ||
    location.pathname === ROUTES.PUBLIC_HOME ||
    location.pathname === ROUTES.DASHBOARD;
  const isPlanYourVisit = location.pathname === ROUTES.PLAN_YOUR_VISIT;

  return (
    <div
      className={`min-h-screen flex flex-col bg-spiritual-bg text-spiritual-text overflow-x-hidden ${
        isPlanYourVisit ? 'lg:h-screen lg:overflow-hidden' : ''
      }`}
    >
      {/* Devotee Horizontal Navbar */}
      <DevoteeNavbar />

      {/* Main Content Area */}
      {isHome ? (
        <main className="flex-1 w-full flex flex-col">
          <Outlet />
        </main>
      ) : isPlanYourVisit ? (
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:overflow-hidden flex flex-col min-h-0">
          <Outlet />
        </main>
      ) : (
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      )}

      {/* Devotee Trust Strip & Footer (Rendered here for all pages; for PlanYourVisit on desktop, it sits within the scrollable right workspace) */}
      {!isPlanYourVisit && <DevoteeFooter />}
    </div>
  );
};

export default DevoteeLayout;
