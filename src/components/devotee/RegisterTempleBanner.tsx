import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import goldenGopuram from '../../assets/golden_gopuram_highlighted.png';
import sacredKalash from '../../assets/sacred_golden_kalash.png';

export const RegisterTempleBanner: React.FC = () => {
  return (
    <section
      aria-label="Register Temple"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#521714] p-5 sm:p-7 lg:p-8 shadow-[0_8px_24px_rgba(68,17,14,0.18)] border border-[#8C3A27]/40"
    >
      {/* Main Content: Balanced 3-Part Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 xl:gap-8">
        {/* Left: Highlighted Glowing Golden Gopuram + Heading & Subtitle */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
          {/* Prominent Golden Temple Gopuram with Warm Golden Aura */}
          <div className="shrink-0 w-16 sm:w-20 lg:w-22 flex items-center justify-center">
            <img
              src={goldenGopuram}
              alt="Sacred Golden Temple Gopuram"
              className="w-full h-auto object-contain filter drop-shadow-[0_0_18px_rgba(245,190,75,0.45)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div className="min-w-0">
            <h3
              className="font-bold text-xl sm:text-2xl lg:text-[25px] text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Is Your Temple Not on DevaSetu?
            </h3>
            <p className="text-xs sm:text-[13px] text-[#F5EDE3]/90 mt-1.5 leading-relaxed font-normal max-w-lg">
              Bring your sacred temple online to reach devotees, manage darshan queues, and enable authentic sevas.
            </p>

            {/* Mobile/Tablet Value Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 lg:hidden">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3B0E0B]/80 border border-[#E5B560]/30 text-[10px] text-[#EED8BA]">
                ✦ Direct Devotee Connect
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3B0E0B]/80 border border-[#E5B560]/30 text-[10px] text-[#EED8BA]">
                ✦ Digital Darshan & Seva
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3B0E0B]/80 border border-[#E5B560]/30 text-[10px] text-[#EED8BA]">
                ✦ 100% Free Onboarding
              </span>
            </div>
          </div>
        </div>

        {/* Center: Sacred Golden Kalash Asset & Key Temple Value Pillars */}
        <div className="hidden lg:flex items-center gap-4.5 px-5 py-2.5 rounded-2xl bg-[#3E110F]/70 border border-[#8C3A27]/50 shadow-[inset_0_1px_4px_rgba(0,0,0,0.25)] shrink-0">
          {/* Sacred Golden Kalash Asset with divine golden glow */}
          <div className="shrink-0 w-14 xl:w-16 flex items-center justify-center">
            <img
              src={sacredKalash}
              alt="Sacred Golden Kalash"
              className="w-full h-auto object-contain filter drop-shadow-[0_0_14px_rgba(245,190,75,0.45)] hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* 3 Pillar Checklist */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-[#F5EDE3] font-medium whitespace-nowrap">
              <span className="w-3.5 h-3.5 rounded-full bg-[#B46A18]/40 border border-[#E5B560]/60 flex items-center justify-center text-[#E5B560] text-[8px] shrink-0">✦</span>
              <span>Reach Devotees Nationwide</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#F5EDE3] font-medium whitespace-nowrap">
              <span className="w-3.5 h-3.5 rounded-full bg-[#B46A18]/40 border border-[#E5B560]/60 flex items-center justify-center text-[#E5B560] text-[8px] shrink-0">✦</span>
              <span>Digital Darshan & Seva Passes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#F5EDE3] font-medium whitespace-nowrap">
              <span className="w-3.5 h-3.5 rounded-full bg-[#B46A18]/40 border border-[#E5B560]/60 flex items-center justify-center text-[#E5B560] text-[8px] shrink-0">✦</span>
              <span>100% Free Verified Onboarding</span>
            </div>
          </div>
        </div>

        {/* Right: Golden Amber CTA Button + Helper Note */}
        <div className="shrink-0 flex flex-col items-center justify-center w-full lg:w-auto">
          <Link
            to={ROUTES.REGISTER_TEMPLE}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#B46A18] via-[#C98A22] to-[#965410] hover:from-[#965410] hover:to-[#78350F] shadow-[0_4px_16px_rgba(180,106,24,0.35)] border border-[#E5B560]/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap w-full sm:w-auto text-center"
          >
            <span>Register Your Temple</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
          <span className="text-[11px] text-[#E8D7C8]/85 mt-1.5 font-normal text-center whitespace-nowrap">
            For temple administrators & trusts
          </span>
        </div>
      </div>
    </section>
  );
};

export default RegisterTempleBanner;
