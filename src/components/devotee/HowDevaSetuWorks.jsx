import React from 'react';
import { Search, Calendar, Users, Ticket } from 'lucide-react';
import panoramicBg from '../../assets/how_works_panoramic_bg.jpg';

export const HowDevaSetuWorks = () => {
  const steps = [
    {
      stepNumber: '1',
      title: '1. Explore',
      description: 'Search and learn about temples',
      icon: Search,
    },
    {
      stepNumber: '2',
      title: '2. Choose',
      description: 'Select darshan, pooja or seva',
      icon: Calendar,
    },
    {
      stepNumber: '3',
      title: '3. Book & Pay',
      description: 'Select date, time and complete booking',
      icon: Users,
    },
    {
      stepNumber: '4',
      title: '4. Get Your Ticket',
      description: 'Receive e-ticket with QR code',
      icon: Ticket,
    },
    {
      stepNumber: '5',
      title: '5. Visit & Receive',
      description: 'Have a divine experience',
      isTempleIcon: true,
    },
  ];

  return (
    <section
      aria-label="How DevaSetu Works"
      className="relative w-full overflow-hidden rounded-[24px] bg-[#FAF6EF] border border-[#EADBCC]/70 py-10 sm:py-12 px-5 sm:px-8 lg:px-12 shadow-[0_4px_20px_rgba(47,33,26,0.03)]"
    >
      {/* 1. Full-Height Panoramic Temple Landscape Background (Covers 100% from top to bottom with zero margin) */}
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-25 mix-blend-multiply"
        aria-hidden="true"
      >
        <img
          src={panoramicBg}
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* 2. Soft Horizontal Gradient Mask to Keep Center Clean for Steps */}
      <div
        className="absolute inset-0 pointer-events-none select-none bg-gradient-to-r from-transparent via-[#FAF6EF]/70 via-45% to-transparent"
        aria-hidden="true"
      />

      {/* 3. Section Header: Title with Golden Accent & Subtitle */}
      <div className="relative z-10 mb-8 sm:mb-10 text-left pl-2 sm:pl-4">
        <h2
          className="font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#1E130E] leading-tight tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          How DevaSetu{' '}
          <span className="bg-gradient-to-r from-[#B46A18] via-[#C98A22] to-[#965410] bg-clip-text text-transparent">
            Works
          </span>
          ?
        </h2>
        <p className="text-xs sm:text-sm text-[#6F6055] mt-1 font-normal">
          Your spiritual journey in 5 simple steps
        </p>
      </div>

      {/* 4. Main Composition: 5 Connected Steps with Moving Motion Dotted Line + Quote */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* The 5 Connected Steps */}
        <div className="lg:col-span-9 xl:col-span-10">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
            {/* Desktop Animated Moving Motion Dotted Line */}
            <div
              className="hidden sm:block absolute top-[27px] left-[10%] right-[10%] h-[3px] pointer-events-none z-0 overflow-hidden"
              aria-hidden="true"
            >
              <svg className="w-full h-full" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="1.5"
                  x2="100%"
                  y2="1.5"
                  stroke="#C9922E"
                  strokeWidth="2.5"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  className="animate-flow-dash"
                />
              </svg>
            </div>

            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  {/* Circular Warm Ivory Badge with Gold Border */}
                  <div className="w-14 h-14 rounded-full bg-[#FFFDF8] border border-[#EADBCC] shadow-[0_3px_10px_rgba(180,106,24,0.08)] flex items-center justify-center text-[#8C5D23] mb-3 group-hover:scale-105 group-hover:border-[#C9A26A] transition-all">
                    {step.isTempleIcon ? (
                      /* Miniature Glowing Golden Mandir Icon */
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#B46A18] drop-shadow-xs">
                        <path d="M12 2L14 6H10L12 2Z" />
                        <path d="M8 6H16V9H8V6Z" />
                        <path d="M6 9H18V13H6V9Z" />
                        <path d="M4 13H20V21H4V13Z" />
                        <path d="M10 21V16H14V21H10Z" fill="#FFFDF8" />
                      </svg>
                    ) : (
                      <Icon className="w-5 h-5 text-[#8C5D23] stroke-[1.75]" />
                    )}
                  </div>

                  {/* Step Title in Bold */}
                  <h3 className="font-bold text-xs sm:text-sm text-[#1E130E] leading-snug mb-1">
                    {step.title}
                  </h3>

                  {/* Step Subtext */}
                  <p className="text-[11px] sm:text-xs text-[#6F6055] leading-relaxed max-w-[135px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Spiritual Quote */}
        <div className="lg:col-span-3 xl:col-span-2 flex flex-col items-center lg:items-end justify-center text-center lg:text-right pr-2">
          <p
            className="italic text-xs sm:text-sm text-[#8C6D53] leading-relaxed max-w-[170px]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            “Temples are not just places, they are experiences.”
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[#BA771E]/60">
            <span className="w-6 h-[1px] bg-gradient-to-r from-transparent to-[#BA771E]/60" />
            <span className="text-[8px] text-[#BA771E]">✦</span>
            <span className="w-6 h-[1px] bg-gradient-to-l from-transparent to-[#BA771E]/60" />
          </div>
        </div>
      </div>

      {/* Embedded CSS for Moving Motion on Dotted Line */}
      <style>{`
        @keyframes flowDash {
          from {
            stroke-dashoffset: 28;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-flow-dash {
          animation: flowDash 1.2s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default HowDevaSetuWorks;
