import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import mandalaShade from '../../assets/mandala_corner_shade.png';

// Refined Sacred Mandir Icon for 'Book Darshan' (Balanced w-6 h-6 size)
const TempleThemeMandirIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#BA771E]" fill="none">
    {/* Golden Kalasam Spire Top */}
    <circle cx="12" cy="2.5" r="1.1" fill="#D97706" stroke="#8C2D19" strokeWidth="0.5" />
    <path d="M12 3.8L14.2 7H9.8L12 3.8Z" fill="#BA771E" stroke="#8C2D19" strokeWidth="0.5" />
    {/* Upper Shikhara Tier */}
    <path d="M8.5 7.5H15.5L16.8 11.5H7.2L8.5 7.5Z" fill="#D97706" />
    <line x1="12" y1="7.5" x2="12" y2="11.5" stroke="#FDE68A" strokeWidth="0.9" />
    {/* Main Sanctum Plinth in Temple Maroon */}
    <path d="M6 12H18V17H6V12Z" fill="#8C2D19" />
    <rect x="4.5" y="17" width="15" height="2.5" rx="0.5" fill="#6B2724" />
    {/* Sacred Sanctum Doorway */}
    <path d="M9.5 17V13.5C9.5 12.5 14.5 12.5 14.5 13.5V17H9.5Z" fill="#FDF4E3" stroke="#BA771E" strokeWidth="0.75" />
  </svg>
);

// Refined Sacred Experience / Jyoti & Sparkle Icon for 'Discover Experiences' (Balanced w-6 h-6 size)
const TempleThemeExperienceIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
    {/* Sacred Diya Bowl Base */}
    <path
      d="M4.5 13.5C4.5 17 7.8 19.5 12 19.5C16.2 19.5 19.5 17 19.5 13.5H4.5Z"
      fill="#8C2D19"
      stroke="#BA771E"
      strokeWidth="0.8"
    />
    <ellipse cx="12" cy="13.5" rx="7.5" ry="1.8" fill="#BA771E" />
    {/* Radiant Divine Jyoti (Flame) */}
    <path
      d="M12 3.5C12 3.5 9.2 7.8 9.2 10.2C9.2 11.8 10.5 13 12 13C13.5 13 14.8 11.8 14.8 10.2C14.8 7.8 12 3.5 12 3.5Z"
      fill="#D97706"
    />
    <path
      d="M12 6.5C12 6.5 10.5 8.8 10.5 10.2C10.5 11 11.2 11.7 12 11.7C12.8 11.7 13.5 11 13.5 10.2C13.5 8.8 12 6.5 12 6.5Z"
      fill="#FDE68A"
    />
    {/* Devotional Aura Sparkles */}
    <path d="M5.5 6L6.5 7.5L5.5 9L4.5 7.5L5.5 6Z" fill="#D97706" />
    <path d="M18.5 6L19.5 7.5L18.5 9L17.5 7.5L18.5 6Z" fill="#D97706" />
  </svg>
);

// Refined Calendar Icon for 'Plan Your Visit' (Balanced w-6 h-6 size)
const TempleThemeCalendarIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#BA771E" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="16" rx="3.5" />
    <line x1="8" y1="2" x2="8" y2="6.5" stroke="#8C2D19" strokeWidth="2.4" />
    <line x1="16" y1="2" x2="16" y2="6.5" stroke="#8C2D19" strokeWidth="2.4" />
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.6" />
    <circle cx="7.5" cy="13.5" r="1.1" fill="#BA771E" stroke="none" />
    <circle cx="12" cy="13.5" r="1.1" fill="#BA771E" stroke="none" />
    <circle cx="16.5" cy="13.5" r="1.1" fill="#BA771E" stroke="none" />
    <circle cx="7.5" cy="17" r="1.1" fill="#BA771E" stroke="none" />
    <circle cx="12" cy="17" r="1.1" fill="#BA771E" stroke="none" />
    <circle cx="16.5" cy="17" r="1.1" fill="#BA771E" stroke="none" />
  </svg>
);

// Refined Compass Icon for 'Explore Temples' (Balanced w-6 h-6 size)
const TempleThemeCompassIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#BA771E" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.2" />
    <polygon points="16.5 7.5 13.2 13.8 7.5 16.5 10.8 10.2 16.5 7.5" fill="#BA771E" fillOpacity="0.25" stroke="#BA771E" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1.5" fill="#8C2D19" stroke="none" />
  </svg>
);

// Refined Devotional Heart Icon for 'Saved Temples' (Balanced w-6 h-6 size)
const TempleThemeHeartIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#BA771E" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path
      d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
      fill="#BA771E"
      fillOpacity="0.22"
    />
  </svg>
);

export interface QuickActionCardProps {
  icon: React.ComponentType;
  title: string;
  subtitle: string;
  to: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: IconComponent,
  title,
  subtitle,
  to,
}) => {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-[24px] bg-white border border-[#EADBCC]/85 p-5 sm:p-5.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(201,138,34,0.06),0_2px_6px_rgba(47,33,26,0.03)] hover:shadow-[0_10px_28px_rgba(186,119,30,0.14)] hover:border-[#BA771E]/40 hover:-translate-y-1 transition-all duration-300 h-[200px] sm:h-[212px]"
    >
      {/* High-Resolution Corner Mandala Lotus Shade */}
      <img
        src={mandalaShade}
        alt=""
        className="absolute top-0 right-0 w-36 h-36 object-cover object-top pointer-events-none select-none mix-blend-multiply opacity-45 group-hover:opacity-60 transition-opacity duration-300"
      />

      {/* Top Row: Refined Sacred Temple Badge with Even, Balanced Icon Sizing */}
      <div className="relative z-10">
        <div className="w-12 h-12 sm:w-12.5 sm:h-12.5 rounded-[16px] bg-gradient-to-br from-[#FFF9EE] to-[#F5EAD4] border border-[#E8C878]/70 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:border-[#BA771E]/70 transition-all duration-200">
          <IconComponent />
        </div>
      </div>

      {/* Bottom Row: Typography Hierarchy & High-Contrast Aligned Arrow Button */}
      <div className="relative z-10 flex items-center justify-between mt-auto pt-3">
        <div className="flex flex-col min-w-0 flex-1 pr-1">
          <span
            className="font-bold text-[15px] sm:text-[16px] text-[#1E130E] group-hover:text-[#BA771E] transition-colors leading-tight tracking-tight line-clamp-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title}
          </span>
          <span className="text-[11.5px] sm:text-[12px] text-[#6B5E55] font-normal mt-1 leading-tight line-clamp-1">
            {subtitle}
          </span>
        </div>

        {/* Circular Action Arrow Button - Perfectly Centered Before and During Hover */}
        <div className="w-8 h-8 rounded-full bg-[#FFFBF2] border border-[#EEDBBA] group-hover:bg-[#BA771E] group-hover:border-[#BA771E] group-hover:text-white text-[#B45309] shadow-2xs flex items-center justify-center shrink-0 ml-1.5 transition-all duration-200">
          <ArrowRight className="w-4 h-4 stroke-[2.4] text-current" />
        </div>
      </div>
    </Link>
  );
};

export const QuickActionsSection: React.FC = () => {
  const actions: QuickActionCardProps[] = [
    {
      title: 'Book Darshan',
      subtitle: 'Plan your visit easily',
      to: `${ROUTES.TEMPLES}?serviceType=DARSHAN`,
      icon: TempleThemeMandirIcon,
    },
    {
      title: 'Discover Experiences',
      subtitle: 'See what devotees experienced',
      to: ROUTES.EXPERIENCES,
      icon: TempleThemeExperienceIcon,
    },
    {
      title: 'Plan Your Visit',
      subtitle: 'Check timings & slots',
      to: ROUTES.PLAN_YOUR_VISIT,
      icon: TempleThemeCalendarIcon,
    },
    {
      title: 'Explore Temples',
      subtitle: 'Discover sacred places',
      to: ROUTES.TEMPLES,
      icon: TempleThemeCompassIcon,
    },
    {
      title: 'Saved Temples',
      subtitle: 'Keep your favorites',
      to: ROUTES.SAVED_TEMPLES,
      icon: TempleThemeHeartIcon,
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
