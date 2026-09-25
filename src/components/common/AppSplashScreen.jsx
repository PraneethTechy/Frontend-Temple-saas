import React from 'react';
import templeEmblem from '../../assets/devasetu_temple_emblem.png';
import flowerLoader from '../../assets/devasetu_flower_loader.png';
import gwcLogo from '../../assets/gwc_data_ai_logo.png';
import splashBg from '../../assets/devasetu_splash_bg.jpg';

/**
 * AppSplashScreen - DevaSetu Application Startup & Splash Loading Screen
 * 
 * Composition:
 * 1. Warm ivory background (#FAF7F0) with serene temple silhouettes and brass bells
 * 2. DevaSetu temple emblem with graceful entrance animation
 * 3. Classic serif branding ("DevaSetu - Temples Closer to You")
 * 4. Subtle ornamental gold divider
 * 5. Powered by GWC Data.AI with the official company logo
 * 6. Four-petal golden flower rotating smoothly (6s per rotation)
 * 7. "Preparing your spiritual journey..." with pulsing golden dots
 * 8. Subtle spiritual mantra: "DISCOVER • BOOK • VISIT • BE CLOSER"
 * 
 * @param {boolean} isVisible - Controls visibility of the splash screen
 * @param {boolean} isFading - Triggers the smooth exit fade transition
 * @param {string} statusMessage - Optional contextual status message
 */
export const AppSplashScreen = ({
  isVisible = true,
  isFading = false,
  statusMessage = 'Preparing your spiritual journey...',
}) => {
  if (!isVisible) return null;

  return (
    <div
      id="devasetu-app-splash"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-[100dvh] w-full overflow-hidden bg-[#FAF7F0] select-none transition-all duration-700 ease-out ${
        isFading ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `url(${splashBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-label="DevaSetu application loading screen"
      role="status"
    >
      {/* Central Brand & Loader Column */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-lg w-full -mt-2 sm:-mt-6">
        
        {/* 1. DevaSetu Sacred Temple Emblem */}
        <div className="relative mb-2 sm:mb-3 flex items-center justify-center animate-temple-entrance">
          {/* Subtle soft golden aura backdrop */}
          <div className="absolute w-32 h-32 rounded-full bg-[#E8C878]/20 blur-2xl pointer-events-none" />
          <img
            src={templeEmblem}
            alt="DevaSetu Sacred Emblem"
            className="w-24 h-auto sm:w-28 object-contain drop-shadow-[0_4px_12px_rgba(201,146,46,0.22)]"
          />
        </div>

        {/* 2. Brand Title */}
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#5A3825] tracking-tight leading-none mb-1">
          DevaSetu
        </h1>

        {/* 3. Subtitle */}
        <p className="text-xs sm:text-sm font-serif tracking-[0.22em] text-[#8A5A2B] uppercase">
          Temples Closer to You
        </p>

        {/* 4. Subtle Ornamental Gold Flourish Divider */}
        <div className="flex items-center justify-center my-2 sm:my-3">
          <svg
            className="w-24 sm:w-28 h-4 text-[#C9922E]"
            viewBox="0 0 120 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 10 H44 M76 10 H110"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M60 4 C56 7 51 10 47 10 C51 10 56 13 60 16 C64 13 69 10 73 10 C69 10 64 7 60 4 Z"
              fill="currentColor"
              opacity="0.85"
            />
            <circle cx="60" cy="10" r="1.5" fill="#FAF7F0" />
          </svg>
        </div>

        {/* 5. Powered by Official GWC Data.AI Company Logo */}
        <div className="flex items-center justify-center gap-2.5 my-1.5 px-3.5 py-1.5 rounded-full bg-white/45 backdrop-blur-[2px] border border-[#C9922E]/20 shadow-[0_1px_6px_rgba(138,90,43,0.05)]">
          <span className="text-[11px] sm:text-xs font-medium text-[#7A6D62] tracking-wide">
            Powered by
          </span>
          <img
            src={gwcLogo}
            alt="GWC Data.AI"
            className="h-6 sm:h-7 w-auto object-contain"
          />
        </div>

        {/* 6. Four-Petal Golden Flower Loader */}
        <div className="relative my-4 sm:my-5 flex items-center justify-center">
          {/* Subtle golden breathing halo behind flower */}
          <div className="absolute w-20 h-20 rounded-full bg-[#E8C878]/30 blur-xl pointer-events-none animate-pulse" />
          <img
            src={flowerLoader}
            alt="Rotating sacred flower"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain animate-flower-spin drop-shadow-[0_2px_10px_rgba(201,146,46,0.25)]"
          />
        </div>

        {/* 7. Status Message */}
        <p className="text-xs sm:text-sm font-serif italic text-[#7A624E] tracking-wide mb-1.5">
          {statusMessage}
        </p>

        {/* 8. Pulsing Soft Gold Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-3" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E] animate-bounce-subtle" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E]/60 animate-bounce-subtle" style={{ animationDelay: '250ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E]/40 animate-bounce-subtle" style={{ animationDelay: '500ms' }} />
        </div>

        {/* 9. Subtle Spiritual Pillars Motto */}
        <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-[0.26em] text-[#8A5A2B]/65 uppercase">
          DISCOVER &bull; BOOK &bull; VISIT &bull; BE CLOSER
        </span>
      </div>

      {/* Scoped CSS Animations */}
      <style>{`
        @keyframes templeEntrance {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.94);
            filter: drop-shadow(0 0 0px rgba(201, 146, 46, 0));
          }
          60% {
            opacity: 1;
            transform: translateY(0) scale(1.0);
            filter: drop-shadow(0 4px 18px rgba(201, 146, 46, 0.4));
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1.0);
            filter: drop-shadow(0 4px 12px rgba(201, 146, 46, 0.22));
          }
        }

        @keyframes flowerSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes bounceSubtle {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        .animate-temple-entrance {
          animation: templeEntrance 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-flower-spin {
          animation: flowerSpin 6s linear infinite;
        }

        .animate-bounce-subtle {
          animation: bounceSubtle 1.4s ease-in-out infinite;
        }

        /* Respect prefers-reduced-motion accessibility */
        @media (prefers-reduced-motion: reduce) {
          .animate-temple-entrance {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .animate-flower-spin {
            animation: none !important;
            transform: rotate(0deg) !important;
          }
          .animate-bounce-subtle {
            animation: none !important;
            opacity: 0.8 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AppSplashScreen;
