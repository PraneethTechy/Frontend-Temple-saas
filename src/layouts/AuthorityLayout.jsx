import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Building,
  Image as GalleryIcon,
  Sparkles,
  Clock,
  CalendarCheck,
  HeartHandshake,
  BarChart3,
  Bell,
  Settings,
  X,
  LogOut,
  AlertTriangle,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import { useLogoutMutation } from '../store/api/authApi.js';
import { clearCredentials } from '../store/slices/authSlice.js';
import { baseApi } from '../store/api/baseApi.js';
import { useGetAuthorityTempleQuery } from '../store/api/authorityApi.js';
import templeEmblem from '../assets/devasetu_temple_emblem.png';

export const AuthorityLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('devasetu_authority_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  const { data: templeRes } = useGetAuthorityTempleQuery();
  const temple = templeRes?.data;
  const mustChangePassword = Boolean(user?.mustChangePassword);

  useEffect(() => {
    try {
      localStorage.setItem('devasetu_authority_sidebar_collapsed', String(isCollapsed));
    } catch {
      // storage unavailable
    }
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Clean local credentials regardless of server network state
    } finally {
      localStorage.removeItem('devasetu_token');
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      navigate(ROUTES.LOGIN, { replace: true, state: null });
    }
  };

  const authorityNavSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: ROUTES.AUTHORITY_DASHBOARD, icon: LayoutDashboard },
      ],
    },
    {
      title: 'TEMPLE',
      items: [
        { name: 'Temple Profile', path: `${ROUTES.AUTHORITY}/temple`, icon: Building },
        { name: 'Announcements', path: `${ROUTES.AUTHORITY}/announcements`, icon: Megaphone },
        { name: 'Gallery', path: `${ROUTES.AUTHORITY}/gallery`, icon: GalleryIcon },
        { name: 'Services', path: `${ROUTES.AUTHORITY}/services`, icon: Sparkles },
        { name: 'Time Slots', path: `${ROUTES.AUTHORITY}/time-slots`, icon: Clock },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Bookings', path: `${ROUTES.AUTHORITY}/bookings`, icon: CalendarCheck },
        { name: 'Devotees', path: `${ROUTES.AUTHORITY}/devotees`, icon: HeartHandshake },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { name: 'Analytics', path: `${ROUTES.AUTHORITY}/analytics`, icon: BarChart3 },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { name: 'Notifications', path: `${ROUTES.AUTHORITY}/notifications`, icon: Bell },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Settings', path: `${ROUTES.AUTHORITY}/settings`, icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-spiritual-bg text-spiritual-text">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Stationary Fixed Desktop Sidebar (Occupies Full Viewport Height) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 h-screen bg-white border-r border-spiritual-border flex flex-col justify-between transition-[width] duration-200 ease-in-out select-none ${
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]'
        } ${
          mobileOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Area Header (72px height) */}
        <div
          className={`h-[72px] border-b border-spiritual-border/80 bg-white shrink-0 flex items-center ${
            isCollapsed && !mobileOpen ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {!isCollapsed || mobileOpen ? (
            <>
              <Link to={ROUTES.AUTHORITY} className="flex items-center gap-3 min-w-0">
                <img
                  src={templeEmblem}
                  alt="DevaSetu"
                  className="w-8 h-8 object-contain shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif font-bold text-[15px] leading-tight text-spiritual-text tracking-tight truncate">
                    DevaSetu
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-spiritual-accent uppercase">
                    Temple Authority
                  </span>
                </div>
              </Link>

              {/* Desktop Collapse Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex w-7 h-7 rounded-lg text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface border border-spiritual-border/60 items-center justify-center transition-colors cursor-pointer"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 w-full">
              <Link to={ROUTES.AUTHORITY} title="DevaSetu Temple Authority" className="flex items-center justify-center">
                <img
                  src={templeEmblem}
                  alt="DevaSetu"
                  className="w-8 h-8 object-contain shrink-0 hover:scale-105 transition-transform"
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-6 h-6 rounded-md text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface border border-spiritual-border/60 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Assigned Temple Banner */}
        {!isCollapsed || mobileOpen ? (
          <div className="mx-3 my-2.5 p-2.5 rounded-xl bg-spiritual-surface/80 border border-spiritual-border/70 shrink-0">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-spiritual-muted">
              ASSIGNED TEMPLE
            </div>
            <div className="text-xs font-semibold text-spiritual-text truncate mt-0.5" title={temple?.name}>
              {temple?.name || 'Assigned Temple'}
            </div>
            {temple?.city && temple?.state && (
              <div className="text-[10.5px] text-spiritual-muted truncate mt-0.5">
                {temple.city}, {temple.state}
              </div>
            )}
          </div>
        ) : (
          <div className="my-2 flex justify-center shrink-0">
            <div
              className="w-10 h-10 rounded-xl bg-spiritual-surface/80 border border-spiritual-border/70 flex items-center justify-center text-spiritual-primary relative group cursor-default"
              aria-label={temple?.name || 'Assigned Temple'}
            >
              <Building className="w-4.5 h-4.5 text-spiritual-primary" />
              <div className="absolute left-[74px] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
                <span className="font-semibold">{temple?.name || 'Assigned Temple'}</span>
                {temple?.city && temple?.state && (
                  <span className="text-[10px] text-gray-300">{temple.city}, {temple.state}</span>
                )}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation: Compact rhythm, natural vertical layout, no visible scrollbar */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {authorityNavSections.map((section, idx) => (
            <div key={section.title} className={idx > 0 ? 'mt-3.5' : ''}>
              {/* Section Header or Divider */}
              {!isCollapsed || mobileOpen ? (
                <div className="mb-1">
                  {idx > 0 && <div className="h-px bg-spiritual-border/40 mx-1 mb-2.5" />}
                  <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-spiritual-muted/90 block">
                    {section.title}
                  </span>
                </div>
              ) : (
                idx > 0 && <div className="w-8 h-px bg-spiritual-border/70 mx-auto my-2" />
              )}

              {/* Navigation Items (42px height, perfectly aligned) */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isSettings = item.name === 'Settings';
                  const disabled = mustChangePassword && !isSettings;

                  if (disabled) {
                    return (
                      <div
                        key={item.name}
                        title="Password change required"
                        className={`flex items-center h-[42px] rounded-xl my-0.5 text-xs font-medium text-spiritual-muted/40 cursor-not-allowed opacity-50 ${
                          isCollapsed && !mobileOpen ? 'justify-center' : 'px-3'
                        }`}
                      >
                        <div className={`flex items-center justify-center shrink-0 ${
                          isCollapsed && !mobileOpen ? 'w-10 h-10' : 'w-6 h-6'
                        }`}>
                          <Icon className="w-4.5 h-4.5 text-spiritual-muted/30" />
                        </div>
                        {(!isCollapsed || mobileOpen) && (
                          <span className="ml-3 text-[13.5px] leading-none whitespace-nowrap select-none font-medium flex-1">
                            {item.name}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.path === ROUTES.AUTHORITY || item.path === ROUTES.AUTHORITY_DASHBOARD}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `group relative flex items-center h-[42px] transition-all ${
                          isCollapsed && !mobileOpen
                            ? 'justify-center rounded-xl my-0.5'
                            : 'px-3 rounded-xl my-0.5'
                        } ${
                          isActive
                            ? isCollapsed && !mobileOpen
                              ? 'bg-[#FFF9EE] text-[#D97706] border border-amber-300/50 shadow-2xs'
                              : 'bg-[#FFF9EE] text-spiritual-text font-semibold border-l-[3px] border-[#D97706] shadow-2xs'
                            : 'text-spiritual-muted hover:text-spiritual-text hover:bg-spiritual-surface/80 border-l-[3px] border-transparent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Centered Icon Wrapper */}
                          <div className={`flex items-center justify-center shrink-0 ${
                            isCollapsed && !mobileOpen ? 'w-10 h-10' : 'w-6 h-6'
                          }`}>
                            <Icon
                              className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                                isActive ? 'text-[#D97706]' : 'text-spiritual-muted group-hover:text-spiritual-text'
                              }`}
                            />
                          </div>

                          {/* Item Label (Expanded view) */}
                          {(!isCollapsed || mobileOpen) && (
                            <span className="ml-3 text-[13.5px] leading-none whitespace-nowrap select-none font-medium flex-1">
                              {item.name}
                            </span>
                          )}

                          {/* Accessible Floating Tooltip (Collapsed view) */}
                          {isCollapsed && !mobileOpen && (
                            <div className="absolute left-[74px] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                              {item.name}
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pinned Profile / Sign Out Footer (Subtle border, perfectly integrated) */}
        <div className="mt-auto shrink-0 border-t border-spiritual-border/80 bg-[#FCFAF7]">
          {(!isCollapsed || mobileOpen) ? (
            <div className="p-3.5 space-y-2.5">
              {/* Secondary Action: View Public Portal */}
              <Link
                to={ROUTES.HOME}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-spiritual-muted hover:text-spiritual-primary hover:bg-white border border-spiritual-border/40 hover:border-spiritual-border transition-colors"
              >
                <span>View Public Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-spiritual-muted" />
              </Link>

              {/* Profile Details */}
              <div className="flex items-center gap-2.5 px-1 py-1">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300/70 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-spiritual-text text-xs truncate leading-tight">
                    {user?.name || 'Temple Authority'}
                  </span>
                  <span className="text-[11px] text-spiritual-muted truncate leading-tight mt-0.5">
                    {user?.email || 'authority@devasetu.org'}
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="py-3 px-2 flex flex-col items-center gap-2">
              {/* Collapsed View Public Portal */}
              <Link
                to={ROUTES.HOME}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-spiritual-muted hover:text-spiritual-primary hover:bg-white transition-colors relative group border border-transparent hover:border-spiritual-border/50"
                aria-label="View Public Portal"
              >
                <ExternalLink className="w-4 h-4" />
                <div className="absolute left-[74px] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  View Public Portal
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
                </div>
              </Link>

              {/* Collapsed Profile Avatar */}
              <div
                className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300/70 text-amber-800 font-bold text-xs flex items-center justify-center relative group cursor-default"
                aria-label={user?.name || 'Temple Authority'}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                <div className="absolute left-[74px] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  {user?.name || 'Temple Authority'} ({user?.email || ''})
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
                </div>
              </div>

              {/* Collapsed Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-700 hover:bg-rose-50 border border-rose-200/70 transition-colors cursor-pointer relative group"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <div className="absolute left-[74px] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Sign Out
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area (Stationary Sidebar, Independent Page Scrolling) */}
      <div
        className={`min-h-screen flex flex-col transition-[margin] duration-200 ease-in-out ${
          isCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Password Change Alert Banner */}
        {mustChangePassword && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 text-xs text-amber-900 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Action Required:</strong> You are signed in with a temporary password. You must set a permanent password in Settings.
              </span>
            </div>
            <Link
              to={`${ROUTES.AUTHORITY}/settings`}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-semibold hover:bg-amber-700 shrink-0 shadow-xs"
            >
              Go to Settings
            </Link>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet context={{ onOpenMobileSidebar: () => setMobileOpen(true) }} />
        </main>
      </div>
    </div>
  );
};

export default AuthorityLayout;
