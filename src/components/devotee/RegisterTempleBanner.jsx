import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import goldenGopuram from '../../assets/golden_gopuram_highlighted.png';

export const RegisterTempleBanner = () => {
  return (
    <section
      aria-label="Register Temple"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#521714] py-5 px-6 sm:px-8 lg:px-10 shadow-[0_6px_20px_rgba(68,17,14,0.12)] border border-[#8C3A27]/40"
    >
      {/* Subtle sacred gopuram watermark in background for authentic spiritual depth */}
      <div
        className="absolute -right-8 -bottom-8 w-52 h-52 pointer-events-none select-none opacity-5 text-[#E3B75D]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
          <path d="M100 15 L100 35 M90 35 L110 35 M85 45 L115 45 M80 55 L120 55 M75 70 L125 70 M70 85 L130 85 M65 105 L135 105 M60 125 L140 125 M50 150 L150 150 M45 180 L155 180" />
          <path d="M96 15 L100 8 L104 15 Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M85 180 L85 150 C85 140 115 140 115 150 L115 180 Z" />
        </svg>
      </div>

      {/* Clean 3-Column Horizontal Composition: Left (Illustration), Center (Text), Right (CTA) */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 lg:gap-8">
        {/* Column 1 (Left): Sacred Golden Gopuram Illustration */}
        <div className="shrink-0 w-20 sm:w-22 lg:w-24 flex items-center justify-center">
          <img
            src={goldenGopuram}
            alt="Sacred Golden Temple Gopuram"
            className="w-full h-auto object-contain filter drop-shadow-[0_0_18px_rgba(245,190,75,0.45)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
          />
        </div>

        {/* Column 2 (Center): Heading & Description */}
        <div className="flex-1 text-center lg:text-left">
          <h3
            className="font-bold text-lg sm:text-xl lg:text-[22px] text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Is Your Temple Not on DevaSetu?
          </h3>
          <p className="text-xs sm:text-[13px] text-[#F5EDE3]/90 mt-1.5 leading-relaxed max-w-2xl font-normal">
            Bring your sacred temple online to reach devotees, manage darshan queues, and enable authentic sevas.
          </p>
        </div>

        {/* Column 3 (Right): Register Button & Subtext */}
        <div className="shrink-0 flex flex-col items-center lg:items-end w-full lg:w-auto">
          <Link
            to={ROUTES.REGISTER_TEMPLE}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#B46A18] via-[#C98A22] to-[#965410] hover:from-[#965410] hover:to-[#78350F] shadow-[0_4px_14px_rgba(180,106,24,0.3)] border border-[#E5B560]/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <span>Register Your Temple</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
          <span className="text-[10px] sm:text-[11px] text-[#E8D7C8]/80 mt-1.5 font-normal text-center lg:text-right whitespace-nowrap">
            For temple administrators and authorized representatives
          </span>
        </div>
      </div>
    </section>
  );
};

export default RegisterTempleBanner;
