import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Ticket,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useGetDevoteeNotificationsQuery } from '../../store/api/devoteeApi.js';
import { useLogoutMutation } from '../../store/api/authApi.js';
import { clearCredentials } from '../../store/slices/authSlice.js';
import { baseApi } from '../../store/api/baseApi.js';
import templeEmblem from '../../assets/devasetu_temple_emblem.png';

export const DevoteeNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = Boolean(user);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Unread notification query for authenticated users - real data only
  const { data: notifRes } = useGetDevoteeNotificationsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000,
  });
  const unreadCount = notifRes?.data?.unreadCount || 0;

  const [triggerLogout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await triggerLogout().unwrap();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('devasetu_token');
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      setUserDropdownOpen(false);
      navigate(ROUTES.LOGIN, { replace: true, state: null });
    }
  };

  const navLinks = [
    { name: 'Home', path: isAuthenticated ? ROUTES.DASHBOARD : ROUTES.PUBLIC_HOME },
    { name: 'Temples', path: ROUTES.TEMPLES },
    { name: 'Experiences', path: ROUTES.EXPERIENCES },
    { name: 'Plan Your Visit', path: ROUTES.PLAN_YOUR_VISIT },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2D5] shadow-[0_2px_10px_rgba(36,28,22,0.04)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        {/* LEFT: Brand Identity matching reference */}
        <div className="flex-1 flex items-center justify-start">
          <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.PUBLIC_HOME} className="flex items-center gap-3 shrink-0 focus:outline-none group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF9EE] to-[#F5EAD4] border border-[#C9922E]/30 flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <img src={templeEmblem} alt="DevaSetu Emblem" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-2xl font-bold text-[#241C16] tracking-tight group-hover:text-[#B7791F] transition-colors leading-tight">
                DevaSetu
              </span>
              <span className="text-[11px] font-medium text-[#756B63] tracking-wide">
                Temples Closer to You
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Navigation Links (Centered group) */}
        <nav className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-2" aria-label="Devotee Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-[#C9922E] font-semibold bg-[#FDF7ED] border border-[#E8C878]/60 shadow-[0_1px_3px_rgba(201,146,46,0.1)]'
                    : 'text-[#3B281E] hover:text-[#B7791F] hover:bg-[#FAF7F0]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: Notifications & Devotee Profile Menu */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 shrink-0">
          {/* Notification Bell */}
          <Link
            to={ROUTES.NOTIFICATIONS}
            className="relative p-2.5 rounded-full text-[#756B63] hover:text-[#241C16] hover:bg-[#FAF7F0] border border-[#E8E2D5] transition-all"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#8C2D19] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Devotee Profile / Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-[#FAF7F0] hover:bg-[#F5EAD4]/50 border border-[#E8E2D5] transition-all text-left shadow-sm focus:outline-none"
              >
                {/* Circular Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5EAD4] to-[#E8C878] border border-[#C9922E]/40 text-[#5A3825] flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || (
                    <User className="w-4 h-4 text-[#5A3825]" />
                  )}
                </div>

                {/* User Info Label */}
                <div className="flex flex-col">
                  <span className="text-[10px] leading-tight text-[#756B63] font-medium">Devotee</span>
                  <span className="text-xs font-semibold text-[#241C16] flex items-center gap-1">
                    {user.name?.split(' ')[0] || user.email?.split('@')[0] || 'My Account'}
                    <ChevronDown className="w-3 h-3 text-[#756B63]" />
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E8E2D5] rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-xs">
                  <div className="px-4 py-2 border-b border-[#F0EBE1]">
                    <p className="font-bold text-[#241C16] truncate">{user.name || 'Devotee'}</p>
                    <p className="text-[11px] text-[#756B63] truncate">{user.email}</p>
                  </div>

                  <Link
                    to={ROUTES.PROFILE}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF7F0] text-[#3B281E] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#C9922E]" /> Profile Settings
                  </Link>

                  <Link
                    to={ROUTES.MY_BOOKINGS}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF7F0] text-[#3B281E] transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-[#C9922E]" /> My Bookings
                  </Link>

                  <Link
                    to={ROUTES.NOTIFICATIONS}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF7F0] text-[#3B281E] transition-colors"
                  >
                    <Bell className="w-4 h-4 text-[#C9922E]" /> Notifications
                  </Link>

                  <div className="border-t border-[#F0EBE1] mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-[#C9922E] hover:bg-[#9B6416] text-white shadow-sm transition-all text-xs font-semibold active:scale-[0.98]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#756B63] hover:text-[#241C16] hover:bg-[#FAF7F0] border border-[#E8E2D5]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D5] bg-white px-4 py-4 space-y-3 animate-fade-in shadow-md">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-[#FDF7ED] text-[#C9922E] font-semibold border border-[#E8C878]/60'
                      : 'text-[#3B281E] hover:bg-[#FAF7F0]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8E2D5] space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-[#241C16] hover:bg-[#FAF7F0] rounded-lg"
                >
                  My Profile ({user.name || user.email})
                </Link>
                <Link
                  to={ROUTES.MY_BOOKINGS}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-[#241C16] hover:bg-[#FAF7F0] rounded-lg"
                >
                  My Bookings
                </Link>
                <Link
                  to={ROUTES.NOTIFICATIONS}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-semibold text-[#241C16] hover:bg-[#FAF7F0] rounded-lg"
                >
                  Notifications
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-semibold text-white bg-[#C9922E] hover:bg-[#9B6416] rounded-xl block shadow-sm"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default DevoteeNavbar;
