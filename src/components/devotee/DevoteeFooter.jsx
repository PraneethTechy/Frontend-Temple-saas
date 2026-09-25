import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import templeEmblem from '../../assets/devasetu_temple_emblem.png';
import gwcLogo from '../../assets/gwc_data_ai_logo.png';
import footerSkyline from '../../assets/footer_temple_skyline.png';
import templeFooterSilhouette from '../../assets/temples/temple-footer-silhouette.svg';

export const DevoteeFooter = () => {
  return (
    <footer className="relative w-full bg-[#F9F6EF] text-[#2F211A] pt-1 pb-6 overflow-hidden">
      {/* Subtle South Indian Temple Silhouette Decorative Watermark Backdrop */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 sm:h-28 pointer-events-none select-none opacity-25 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src={templeFooterSilhouette}
          alt=""
          className="w-full h-full object-cover object-bottom"
        />
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: Delicate Sacred Temple Skyline Frieze (Pure transparent, seamless into #F9F6EF) */}
        <div
          className="w-full h-8 sm:h-10 md:h-11 overflow-hidden select-none pointer-events-none mb-5"
          aria-hidden="true"
        >
          <img
            src={footerSkyline}
            alt=""
            className="w-full h-full object-cover object-bottom opacity-80"
          />
        </div>

        {/* Main Footer Row: 3-Column Composition */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-4 items-center pb-5">
          {/* LEFT: Logo & Tagline (lg:col-span-3) */}
          <div className="flex items-center gap-3 lg:col-span-3 justify-center md:justify-start">
            <img src={templeEmblem} alt="DevaSetu" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span
                className="font-bold text-[#1E130E] text-lg sm:text-xl tracking-tight block leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                DevaSetu
              </span>
              <p className="text-[11px] text-[#7A6A5E] font-medium">
                Temples Closer to You
              </p>
            </div>
          </div>

          {/* CENTER: Navigation Links (Visually centered, Register Temple removed) (lg:col-span-5) */}
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 lg:col-span-5 text-xs sm:text-[13px] font-semibold text-[#4A382D]"
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
          </nav>

          {/* RIGHT: Social Media & Copyright / GWC Attribution (lg:col-span-4) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5 lg:col-span-4">
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
            <div className="flex items-center gap-2 text-[11px] text-[#6B5A4E] border-l border-[#D8C7B5] pl-3">
              <span>© {new Date().getFullYear()} DevaSetu. Powered by</span>
              <img src={gwcLogo} alt="GWC Data.AI" className="h-5 w-auto max-w-[110px] object-contain shrink-0 opacity-95" />
            </div>
          </div>
        </div>

        {/* Bottom: Subtle Divider, Centered Om Element & Centered Blessing Quote */}
        <div className="pt-4 border-t border-[#EADBCC]/60 flex flex-col items-center justify-center gap-1.5 text-xs text-center">
          {/* Sacred Om Mantra Flourish */}
          <div className="flex items-center justify-center gap-2 text-[#BA771E] font-medium text-xs">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#BA771E]/60" />
            <span className="tracking-wider text-sm font-serif">― || ॐ || ―</span>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#BA771E]/60" />
          </div>

          {/* Peace Blessing - Centered below Om */}
          <p
            className="italic text-xs text-[#7A6A5E] font-normal text-center"
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
