import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import heroBg from '../../assets/Hero_Section_bg.png';
import { ROUTES } from '../../constants/routes.js';

export const HeroSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const popularSearches = ['Tirupati', 'Srisailam', 'Kashi', 'Meenakshi', 'Somnath'];

  const handleSearch = (e) => {
    e?.preventDefault?.();
    if (searchTerm.trim()) {
      navigate(`/temples?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(ROUTES.TEMPLES);
    }
  };

  const handlePopularSearch = (term) => {
    setSearchTerm(term);
    navigate(`/temples?search=${encodeURIComponent(term)}`);
  };

  return (
    <section
      aria-label="DevaSetu Sacred Hero"
      className="w-full relative overflow-hidden bg-[#FAF8F3] min-h-[500px] sm:min-h-[530px] lg:h-[560px] flex items-center"
    >
      {/* 1. Full-Bleed Panoramic Hero Artwork Layer - Clean realistic temple photograph */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroBg}
          alt="DevaSetu Sacred Temple Sanctuary at Golden Sunrise"
          className="w-full h-full object-cover object-[80%_center] lg:object-[85%_center] xl:object-right-center select-none"
        />
      </div>

      {/* 2. Subtle Atmospheric Readability Gradient (Natural warm ivory lighting, dissolves towards center/right) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none select-none"
        style={{
          background: 'linear-gradient(to right, rgba(250, 248, 243, 0.97) 0%, rgba(250, 248, 243, 0.88) 35%, rgba(250, 248, 243, 0.45) 52%, rgba(250, 248, 243, 0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* 3. Natural soft bottom transition into Quick Actions section */}
      <div
        className="absolute inset-x-0 bottom-0 h-6 pointer-events-none select-none z-[2]"
        style={{
          background: 'linear-gradient(to top, #F9F6EF, transparent)',
        }}
        aria-hidden="true"
      />

      {/* 4. Left Content Area (LEFT 45%, RIGHT 55% remains pure clean photograph) */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto h-full px-4 sm:px-8 lg:px-12 py-8 flex items-center">
        <div className="w-full lg:w-[45%] max-w-[530px] flex flex-col justify-center">
          
          {/* Eyebrow: SPIRITUAL JOURNEYS  •  A BRIGHTER YOU */}
          <div className="flex items-center mb-2.5">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.24em] text-[#6B4423] uppercase leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              SPIRITUAL JOURNEYS &nbsp;•&nbsp; A BRIGHTER YOU
            </span>
          </div>

          {/* Heading: "Discover India's" + Primary "Sacred Temples" */}
          <div className="mb-3.5">
            <span
              className="block font-serif text-2xl sm:text-3xl lg:text-[32px] font-semibold text-[#5A3822] tracking-tight leading-snug drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Discover India's
            </span>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-bold text-[#1C120E] tracking-tight leading-[1.08] mt-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Sacred Temples
            </h1>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-[15px] text-[#3D291D] leading-[1.55] max-w-[490px] mb-7 font-normal drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
            Explore temples, book darshan, participate in sevas and experience the divine, all in one place.
          </p>

          {/* Search Bar: White Pill with Gold Search Button (approx 24-28px vertical spacing from description) */}
          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white rounded-full shadow-[0_4px_24px_rgba(28,18,14,0.12)] border border-[#E5DDD0] px-2 w-full max-w-[500px] sm:max-w-[530px] h-[52px] sm:h-[56px] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#BA771E] focus-within:border-[#BA771E]"
          >
            <div className="pl-3 sm:pl-4 pr-2 text-[#7A6D63] shrink-0">
              <Search className="w-5 h-5 text-[#BA771E]" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search temples, cities, services (e.g., Somnath, Darshan, Pooja...)"
              className="w-full h-full px-1 text-xs sm:text-sm text-[#1C120E] bg-transparent placeholder-[#7A6D63]/80 focus:outline-none"
            />

            <button
              type="submit"
              className="shrink-0 px-6 sm:px-7 h-10 sm:h-10.5 bg-gradient-to-r from-[#BA771E] to-[#A06214] hover:from-[#A06214] hover:to-[#6B2724] text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center active:scale-[0.98]"
            >
              Search
            </button>
          </form>

          {/* Popular Searches Row (Left edge aligned with search bar) */}
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 mt-3.5 pl-0">
            <span className="text-xs font-bold text-[#2A1810] tracking-wide shrink-0">
              Popular searches:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handlePopularSearch(term)}
                  className="px-3 py-0.5 rounded-full bg-white/95 hover:bg-white text-[#2B1B15] text-[11px] font-semibold shadow-xs border border-[#E5DDD0]/70 transition-all hover:scale-105 active:scale-95"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
