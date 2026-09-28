import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import templeEmblem from '../../assets/devasetu_temple_emblem.png';
import gwcLogo from '../../assets/gwc_data_ai_logo.png';
import footerSkyline from '../../assets/footer_temple_skyline.png';

export const DevoteeFooter: React.FC = () => {
  return (
    <footer className="relative w-full bg-[#F9F6EF] text-[#2F211A] border-t border-[#EADBCC]/70 pt-6 sm:pt-7 pb-5 overflow-hidden">
      {/* 1. Subtle Panoramic Temple Skyline Watermark Layer in Background */}
      <div
        className="absolute inset-x-0 bottom-0 h-20 sm:h-24 overflow-hidden select-none pointer-events-none opacity-20 mix-blend-multiply"
        aria-hidden="true"
      >
        <img
          src={footerSkyline}
          alt=""
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2. Main Horizontal Footer Row: Brand, Navigation, Socials & Attribution */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 pb-4">
          {/* Left: Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <img src={templeEmblem} alt="DevaSetu" className="w-8 h-8 object-contain" />
            <div>
              <span
                className="font-bold text-[#1E130E] text-lg sm:text-xl tracking-tight block leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                DevaSetu
              </span>
              <p className="text-[11px] text-[#7A6A5E] font-normal">
                Temples Closer to You
              </p>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs sm:text-[13px] font-medium text-[#5C4D44]"
          >
            <Link to="/" className="hover:text-[#B45309] transition-colors">
              Home
            </Link>
            <Link to={ROUTES.TEMPLES} className="hover:text-[#B45309] transition-colors">
              Temples
            </Link>
            <Link to={ROUTES.EXPERIENCES} className="hover:text-[#B45309] transition-colors">
              Experiences
            </Link>
            <Link to={ROUTES.PLAN_YOUR_VISIT} className="hover:text-[#B45309] transition-colors">
              Plan Your Visit
            </Link>
            <Link to={ROUTES.REGISTER_TEMPLE} className="hover:text-[#B45309] transition-colors">
              Register Temple
            </Link>
          </nav>

          {/* Right: Social Media & Copyright/Attribution */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Social Media Circular Badges */}
            <div className="flex items-center gap-2">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[12px] font-bold shadow-xs hover:scale-110 transition-transform"
              >
                f
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center p-1 shadow-xs hover:scale-110 transition-transform"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-6 h-6 rounded-full bg-[#FF0000] text-white flex items-center justify-center p-1 shadow-xs hover:scale-110 transition-transform"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M10 15l5-3-5-3v6z" />
                </svg>
              </a>
            </div>

            {/* Copyright & GWC Attribution */}
            <div className="flex items-center gap-2 text-[11px] text-[#7A6A5E] border-l border-[#EADBCC] pl-4">
              <span>© {new Date().getFullYear()} DevaSetu. Powered by</span>
              <img src={gwcLogo} alt="GWC Data.AI" className="h-5 w-auto object-contain opacity-95" />
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: Sacred Om Divider & Peace Blessing */}
        <div className="pt-3 border-t border-[#EADBCC]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="hidden sm:block w-32" />

          {/* Sacred Om Mantra Flourish */}
          <div className="flex items-center gap-2 text-[#BA771E] font-medium text-xs">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#BA771E]/60" />
            <span className="tracking-wider text-sm font-serif">― || ॐ || ―</span>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#BA771E]/60" />
          </div>

          {/* Peace Blessing */}
          <p
            className="italic text-xs text-[#8C7667] text-center sm:text-right"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            May Your Path Be Filled With Peace
          </p>
        </div>
      </div>
    </footer>
  );
};

export default DevoteeFooter;
