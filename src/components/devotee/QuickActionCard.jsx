import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useGetMyBookingsQuery } from '../../store/api/bookingApi.js';
import { useGetSavedTemplesQuery } from '../../store/api/devoteeApi.js';
import mandalaShade from '../../assets/mandala_corner_shade.png';

// High-Fidelity Indian Temple Mandir Illustration for 'Book Darshan'
const HighFidelityMandirIcon = () => (
  <svg viewBox="8.5 2.5 31 31" width="20" height="20" className="w-5 h-5" fill="none">
    {/* Golden Spire / Kalasam Top */}
    <circle cx="24" cy="6.5" r="1.6" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
    <path d="M23 7L24 4L25 7Z" fill="#D97706" />
    <ellipse cx="24" cy="8.5" rx="2.8" ry="1.6" fill="#FBBF24" stroke="#B45309" strokeWidth="0.8" />

    {/* Top Golden Spire Tier */}
    <path d="M20.5 10C20.5 9 27.5 9 27.5 10L28.5 13.5H19.5L20.5 10Z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.7" />
    <rect x="17.5" y="11.5" width="2.5" height="2" rx="0.5" fill="#881337" />
    <rect x="28" y="11.5" width="2.5" height="2" rx="0.5" fill="#881337" />

    {/* Middle Tier with Maroon Side Wings */}
    <path d="M18.5 13.5H29.5L31 18.5H17L18.5 13.5Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.7" />
    <line x1="21.5" y1="13.5" x2="21" y2="18.5" stroke="#D97706" strokeWidth="0.8" />
    <line x1="24" y1="13.5" x2="24" y2="18.5" stroke="#D97706" strokeWidth="0.8" />
    <line x1="26.5" y1="13.5" x2="27" y2="18.5" stroke="#D97706" strokeWidth="0.8" />
    <path d="M15 15.5C15 14.5 17.5 14.5 17.5 15.5V18.5H15V15.5Z" fill="#9F1239" />
    <path d="M30.5 15.5C30.5 14.5 33 14.5 33 15.5V18.5H30.5V15.5Z" fill="#9F1239" />

    {/* Lower Tier / Main Mandir Shikhara Body */}
    <path d="M15.5 18.5H32.5L34.5 25.5H13.5L15.5 18.5Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
    <line x1="19" y1="18.5" x2="18.5" y2="25.5" stroke="#D97706" strokeWidth="0.9" />
    <line x1="29" y1="18.5" x2="29.5" y2="25.5" stroke="#D97706" strokeWidth="0.9" />
    <path d="M12.5 20.5C12.5 19 15.5 19 15.5 20.5V25.5H12.5V20.5Z" fill="#881337" />
    <path d="M32.5 20.5C32.5 19 35.5 19 35.5 20.5V25.5H32.5V20.5Z" fill="#881337" />

    {/* Base Plinth / Mandapa Foundation */}
    <path d="M11.5 25.5H36.5V30H11.5V25.5Z" fill="#881337" stroke="#4C0519" strokeWidth="0.8" />
    <rect x="10.5" y="30" width="27" height="2.5" fill="#6B2724" />

    {/* Golden Grand Entrance Doorway */}
    <path d="M19.5 30V22.5C19.5 20.3 28.5 20.3 28.5 22.5V30H19.5Z" fill="#FDE68A" stroke="#B45309" strokeWidth="0.9" />
    <path d="M21 30V23.5C21 22 27 22 27 23.5V30H21Z" fill="#2E1005" />
  </svg>
);

// High-Fidelity Sacred Lotus Illustration for 'Pooja & Seva'
const SacredLotusIcon = () => (
  <svg viewBox="8 7.5 32 32" width="20" height="20" className="w-5 h-5" fill="none">
    <ellipse cx="24" cy="27" rx="3.5" ry="5.5" fill="#FBBF24" />
    <path d="M24 10C24 10 20.5 18 20.5 25C20.5 29.5 22 32 24 32C26 32 27.5 29.5 27.5 25C27.5 18 24 10 24 10Z" fill="#E11D48" />
    <path d="M24 32C19.5 32 15.5 29 14.5 24.5C13.5 20 16 16 18 14C18 18 19 23 24 28" fill="#F43F5E" />
    <path d="M24 32C28.5 32 32.5 29 33.5 24.5C34.5 20 32 16 30 14C30 18 29 23 24 28" fill="#F43F5E" />
    <path d="M24 32C18 32 12 28.5 10 24C8.5 20.5 10.5 18 12.5 18C14.5 21.5 17 25.5 24 30" fill="#FB7185" />
    <path d="M24 32C30 32 36 28.5 38 24C39.5 20.5 37.5 18 35.5 18C33.5 21.5 31 25.5 24 30" fill="#FB7185" />
    <path d="M13 31C16.5 34 20 35 24 35C28 35 31.5 34 35 31C31.5 36 27 37 24 37C21 37 16.5 36 13 31Z" fill="#BE123C" />
  </svg>
);

// High-Fidelity Calendar Icon for 'Plan Your Visit'
const BlueCalendarIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" className="w-5 h-5" fill="none" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="10" width="32" height="30" rx="6" />
    <line x1="16" y1="6" x2="16" y2="13" strokeWidth="3" />
    <line x1="32" y1="6" x2="32" y2="13" strokeWidth="3" />
    <line x1="8" y1="20" x2="40" y2="20" strokeWidth="2.2" />
    <circle cx="16" cy="27" r="1.5" fill="#2563EB" stroke="none" />
    <circle cx="24" cy="27" r="1.5" fill="#2563EB" stroke="none" />
    <circle cx="32" cy="27" r="1.5" fill="#2563EB" stroke="none" />
    <circle cx="16" cy="34" r="1.5" fill="#2563EB" stroke="none" />
    <circle cx="24" cy="34" r="1.5" fill="#2563EB" stroke="none" />
  </svg>
);

// High-Fidelity Compass Emblem Icon for 'Explore Temples'
const GreenCompassIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" className="w-5 h-5" fill="none" stroke="#16A34A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="17" />
    <polygon points="32 16 27 27 16 32 21 21 32 16" fill="#16A34A" fillOpacity="0.25" strokeWidth="2" />
    <circle cx="24" cy="24" r="2.5" fill="#16A34A" stroke="none" />
  </svg>
);

// High-Fidelity Purple Heart Icon for 'Saved Temples'
const PurpleHeartIcon = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" className="w-5 h-5" fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M37 20c2.8-2.7 5.5-6 5.5-10.5A10.5 10.5 0 0 0 32 0c-3.3 0-5.8 1-8 4-2.2-3-4.7-4-8-4A10.5 10.5 0 0 0 5.5 9.5c0 4.5 2.7 7.8 5.5 10.5L24 34Z" transform="translate(0, 5) scale(1)" />
  </svg>
);

export const QuickActionCard = ({
  icon: IconComponent,
  title,
  subtitle,
  to,
  iconBgColor,
  iconBorderColor,
}) => {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-[22px] bg-white border border-[#EADBCC]/75 p-4 sm:p-4.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(201,138,34,0.05),0_2px_6px_rgba(47,33,26,0.03)] hover:shadow-[0_8px_24px_rgba(201,138,34,0.11)] hover:-translate-y-0.5 transition-all duration-200 h-[168px]"
    >
      {/* 100% Transparent Corner Mandala Lotus Artwork - Zero Background Tint / No Seams */}
      <img
        src={mandalaShade}
        alt=""
        className="absolute top-0 right-0 w-32 h-32 object-contain object-top pointer-events-none select-none opacity-60 group-hover:opacity-80 transition-opacity"
      />

      {/* Top Row: Refined Compact Squircle Action Badge */}
      <div className="relative z-10">
        <div
          className={`w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs border ${iconBgColor} ${iconBorderColor}`}
        >
          <IconComponent />
        </div>
      </div>

      {/* Bottom Row: Title, Subtitle, and Aligned Circular Arrow CTA */}
      <div className="relative z-10 flex items-end justify-between mt-auto pt-2">
        <div className="flex flex-col min-w-0 pr-1">
          <span
            className="font-bold text-[15px] sm:text-[16px] text-[#1E130E] leading-snug tracking-tight whitespace-nowrap overflow-visible"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title}
          </span>
          <span className="text-[11px] sm:text-[12px] text-[#6F6055] font-normal mt-0.5 leading-tight truncate max-w-[140px]">
            {subtitle}
          </span>
        </div>

        {/* Circular Action Arrow Button */}
        <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-[#FFFBF2] to-[#FFEED4] border border-[#EEDBBA] shadow-2xs flex items-center justify-center text-[#B45309] group-hover:scale-105 transition-all duration-200 shrink-0 ml-1.5">
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] text-[#B45309]" />
        </div>
      </div>
    </Link>
  );
};

export const QuickActionsSection = () => {
  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = Boolean(user);
  const isDevotee = user?.role === 'DEVOTEE';

  // Read cached bookings for subtle context snippet in 'Plan Your Visit'
  const { data: bookingsRes } = useGetMyBookingsQuery(
    { limit: 20 },
    { skip: !isAuthenticated || !isDevotee }
  );

  // Read cached saved temples for subtle context count in 'Saved Temples'
  const { data: savedRes } = useGetSavedTemplesQuery(undefined, {
    skip: !isAuthenticated || !isDevotee,
  });

  const planVisitSubtitle = useMemo(() => {
    if (!isAuthenticated || !isDevotee) return 'Prepare for your journey';
    const allBookings = bookingsRes?.data?.bookings || [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const upcoming = allBookings
      .filter((b) => {
        if (!b || !b.bookingDate) return false;
        const status = (b.bookingStatus || '').toUpperCase();
        if (status === 'CANCELLED' || status === 'COMPLETED') return false;
        return new Date(b.bookingDate).getTime() >= startOfToday;
      })
      .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())[0];

    if (!upcoming) return 'Prepare for your journey';

    const tName = upcoming.templeId?.name ? upcoming.templeId.name.split(' ')[0] : 'Temple';
    const dateFormatted = new Date(upcoming.bookingDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    return `${tName} · ${dateFormatted}`;
  }, [isAuthenticated, isDevotee, bookingsRes]);

  const savedTemplesSubtitle = useMemo(() => {
    if (!isAuthenticated || !isDevotee) return 'Keep your sacred places';
    const count = savedRes?.data?.total ?? savedRes?.data?.items?.length ?? 0;
    if (count > 0) {
      return `${count} temple${count > 1 ? 's' : ''} saved`;
    }
    return 'Keep your sacred places';
  }, [isAuthenticated, isDevotee, savedRes]);

  const actions = [
    {
      title: 'Book Darshan',
      subtitle: 'Find a sacred time to visit',
      to: '/temples?serviceType=DARSHAN',
      icon: HighFidelityMandirIcon,
      iconBgColor: 'bg-gradient-to-b from-[#FFF5E6] to-[#FFE7C8]',
      iconBorderColor: 'border-[#F3D5A5]',
    },
    {
      title: 'Pooja & Seva',
      subtitle: 'Offer your prayers',
      to: '/temples?serviceType=POOJA,SEVA',
      icon: SacredLotusIcon,
      iconBgColor: 'bg-gradient-to-b from-[#FFF0F3] to-[#FEDFE4]',
      iconBorderColor: 'border-[#FCC7D2]',
    },
    {
      title: 'Plan Your Visit',
      subtitle: planVisitSubtitle,
      to: ROUTES.PLAN_YOUR_VISIT,
      icon: BlueCalendarIcon,
      iconBgColor: 'bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE]',
      iconBorderColor: 'border-[#BFDBFE]',
    },
    {
      title: 'Explore Temples',
      subtitle: 'Discover sacred places',
      to: ROUTES.TEMPLES,
      icon: GreenCompassIcon,
      iconBgColor: 'bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7]',
      iconBorderColor: 'border-[#BBF7D0]',
    },
    {
      title: 'Saved Temples',
      subtitle: savedTemplesSubtitle,
      to: ROUTES.SAVED_TEMPLES,
      icon: PurpleHeartIcon,
      iconBgColor: 'bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF]',
      iconBorderColor: 'border-[#E9D5FF]',
    },
  ];

  return (
    <section aria-label="Quick Actions" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {actions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>
    </section>
  );
};

export default QuickActionsSection;

