import React from 'react';
import { Search, CalendarCheck, CreditCard, QrCode } from 'lucide-react';
import panoramicBg from '../../assets/how_works_panoramic_bg.jpg';

// Auspicious Golden Mandir Sanctum Icon for Step 5: 'Visit & Receive'
const SanctumMandirIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#BA771E]" fill="none">
    {/* Golden Kalasam Spire Top */}
    <circle cx="12" cy="2.5" r="0.9" fill="#D97706" stroke="#8C2D19" strokeWidth="0.5" />
    <path d="M12 3.8L14 6.5H10L12 3.8Z" fill="#BA771E" stroke="#8C2D19" strokeWidth="0.5" />
    {/* Shikhara Body */}
    <path d="M9.5 7H14.5L15.5 11H8.5L9.5 7Z" fill="#D97706" />
    <line x1="12" y1="7" x2="12" y2="11" stroke="#FDE68A" strokeWidth="0.8" />
    {/* Base Plinth */}
    <path d="M7 11.5H17V17H7V11.5Z" fill="#8C2D19" />
    <rect x="4.5" y="17" width="15" height="2.5" rx="0.5" fill="#6B2724" />
    {/* Sanctum Entrance */}
    <path d="M10 17V14C10 13.2 14 13.2 14 14V17H10Z" fill="#FDF4E3" stroke="#BA771E" strokeWidth="0.5" />
  </svg>
);

export const HowDevaSetuWorks: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Explore',
      description: 'Search & learn about sacred temples',
      icon: Search,
    },
    {
      number: '2',
      title: 'Choose',
      description: 'Select darshan, pooja or special seva',
      icon: CalendarCheck,
    },
    {
      number: '3',
      title: 'Book & Pay',
      description: 'Select date, slot & complete booking',
      icon: CreditCard,
    },
    {
      number: '4',
      title: 'Get Ticket',
      description: 'Receive instant digital pass with QR code',
      icon: QrCode,
    },
    {
      number: '5',
      title: 'Visit & Receive',
      description: 'Experience divine darshan & blessings',
      isCustomIcon: true,
      customIcon: SanctumMandirIcon,
    },
  ];

  return (
    <section
      aria-label="How DevaSetu Works"
      className="relative w-full overflow-hidden rounded-[26px] bg-[#FAF6EF] border border-[#EADBCC]/85 py-8 sm:py-10 px-5 sm:px-8 lg:px-10 shadow-[0_4px_24px_rgba(47,33,26,0.04)]"
    >
      {/* 1. Full-Height Panoramic Temple Landscape Background */}
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-20 mix-blend-multiply"
        aria-hidden="true"
      >
        <img
          src={panoramicBg}
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* 2. Soft Horizontal Gradient Mask */}
      <div
        className="absolute inset-0 pointer-events-none select-none bg-gradient-to-r from-transparent via-[#FAF6EF]/80 via-45% to-transparent"
        aria-hidden="true"
      />

      {/* 3. Section Header: Title with Golden Accent & Subtitle */}
      <div className="relative z-10 mb-8 sm:mb-9 text-left pl-1 sm:pl-2">
        <h2
          className="font-bold text-2xl sm:text-[28px] lg:text-[32px] text-[#1E130E] leading-tight tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          How DevaSetu{' '}
          <span className="bg-gradient-to-r from-[#B46A18] via-[#C98A22] to-[#965410] bg-clip-text text-transparent">
            Works
          </span>
          ?
        </h2>
        <p className="text-xs sm:text-sm text-[#6F6055] mt-1 font-normal">
          Your spiritual journey in 5 simple, seamless steps
        </p>
      </div>

      {/* 4. Main Composition: 5 Connected Steps with Dynamic Traveling Flow + Perfectly Aligned Quote */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        {/* The 5 Connected Steps Grid */}
        <div className="lg:col-span-9 xl:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative">
            
            {/* Desktop Animated Dynamic Connector Track */}
            <div
              className="hidden sm:block absolute top-[28px] sm:top-[32px] left-[10%] right-[10%] h-[3px] pointer-events-none z-0"
              aria-hidden="true"
            >
              {/* Background Guide Line */}
              <div className="absolute inset-0 border-b-2 border-dashed border-[#EADBCC]" />

              {/* Animated Flowing Gold Line */}
              <svg className="w-full h-full overflow-hidden absolute inset-0" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="1.5"
                  x2="100%"
                  y2="1.5"
                  stroke="#BA771E"
                  strokeWidth="2.5"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  className="animate-flow-dash"
                />
              </svg>
            </div>

            {/* 5 Step Nodes */}
            {steps.map((step) => {
              const Icon = step.icon;
              const CustomIcon = step.customIcon;

              return (
                <div
                  key={step.number}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  {/* Circular Node with Step Number Badge */}
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-[#E8C878] shadow-[0_4px_14px_rgba(186,119,30,0.12)] flex items-center justify-center text-[#BA771E] group-hover:scale-108 group-hover:border-[#BA771E] group-hover:shadow-[0_8px_22px_rgba(186,119,30,0.22)] transition-all duration-300">
                      {step.isCustomIcon && CustomIcon ? (
                        <CustomIcon />
                      ) : (
                        Icon && <Icon className="w-6 h-6 text-[#BA771E] stroke-[1.8]" />
                      )}
                    </div>

                    {/* Auspicious Step Number Badge Pill */}
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-r from-[#BA771E] to-[#8C2D19] text-white text-[11px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Title in Bold */}
                  <h3
                    className="font-bold text-[14px] sm:text-[15px] text-[#1E130E] group-hover:text-[#BA771E] transition-colors leading-snug mt-3 sm:mt-4 whitespace-nowrap"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {step.title}
                  </h3>

                  {/* Step Subtext */}
                  <p className="text-[11px] sm:text-[11.5px] text-[#6F6055] leading-relaxed max-w-[130px] sm:max-w-[140px] mt-1">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sacred Spiritual Quote - Strictly Vertically Centered at Right */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col items-center justify-center lg:items-center self-center my-auto">
          <div className="relative pl-5 sm:pl-6 border-l-2 border-[#BA771E]/35 py-2 flex flex-col justify-center text-left max-w-[220px]">
            {/* Auspicious Golden Quote Mark */}
            <span className="font-serif text-3xl sm:text-4xl text-[#BA771E]/40 leading-none select-none -mb-1">
              “
            </span>
            <p
              className="font-serif italic text-[13.5px] sm:text-[14.5px] text-[#5A3822] leading-[1.65] font-medium"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Temples are not just places, they are divine experiences.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-5 h-[1.5px] bg-[#BA771E]/50 rounded-full" />
              <span className="text-[10px] font-bold text-[#8C5D23] uppercase tracking-[0.2em]">
                DevaSetu
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowDevaSetuWorks;
