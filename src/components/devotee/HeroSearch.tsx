import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Sparkles } from 'lucide-react';
import heroBg from '../../assets/Hero_Section_bg.png';
import { ROUTES } from '../../constants/routes.js';

export const HeroSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const popularSearches: string[] = ['Tirupati', 'Srisailam', 'Kashi', 'Meenakshi', 'Somnath'];

  const handleSearch = (e?: React.FormEvent): void => {
    e?.preventDefault?.();
    if (searchTerm.trim()) {
      navigate(`/temples?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(ROUTES.TEMPLES);
    }
  };

  const handlePopularSearch = (term: string): void => {
    setSearchTerm(term);
    navigate(`/temples?search=${encodeURIComponent(term)}`);
  };

  const handleScrollDown = (): void => {
    const navbarHeight = window.innerWidth >= 640 ? 81 : 73;
    window.scrollTo({
      top: window.innerHeight - navbarHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section
      aria-label="DevaSetu Sacred Hero"
      className="w-full relative overflow-hidden bg-[#FAF8F3] m-0 p-0 h-[calc(100vh-73px)] sm:h-[calc(100vh-81px)] [@supports(height:100dvh)]:h-[calc(100dvh-73px)] sm:[@supports(height:100dvh)]:h-[calc(100dvh-81px)] min-h-[520px] flex items-center"
      style={{ margin: 0, padding: 0 }}
    >
      {/* 1. Full-Bleed Panoramic Hero Artwork Layer - Real temple photograph */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroBg}
          alt="DevaSetu Sacred Temple Sanctuary at Golden Sunrise"
          className="w-full h-full object-cover object-[75%_center] sm:object-[80%_center] xl:object-[85%_center] select-none"
        />
      </div>

      {/* 2. Balanced Atmospheric Readability Gradient (Gentle warm ivory lighting, allows temple scenery to shine through) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none select-none"
        style={{
          background:
            'linear-gradient(to right, rgba(250, 248, 243, 0.92) 0%, rgba(250, 248, 243, 0.80) 30%, rgba(250, 248, 243, 0.35) 54%, rgba(250, 248, 243, 0) 75%)',
        }}
        aria-hidden="true"
      />

      {/* 3. Subtle bottom transition into page content */}
      <div
        className="absolute inset-x-0 bottom-0 h-10 pointer-events-none select-none z-[2]"
        style={{
          background: 'linear-gradient(to top, rgba(249, 246, 239, 0.7) 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* 4. Left Content Area (Balanced typography and search container) */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto h-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10 flex items-center">
        <div className="w-full lg:w-[48%] xl:w-[45%] max-w-[540px] flex flex-col justify-center">
          
          {/* Eyebrow: Spiritual Journey with Sacred Sparkle Badge */}
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-3.5 self-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E5DDD0]/90 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#BA771E]" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#6B4423] uppercase leading-tight">
                Spiritual Journeys &nbsp;•&nbsp; A Brighter You
              </span>
            </span>
          </div>

          {/* Heading: "Discover India's" + Primary "Sacred Temples" */}
          <div className="mb-3.5">
            <span
              className="block font-serif text-2xl sm:text-3xl lg:text-[34px] font-semibold text-[#5A3822] tracking-tight leading-snug drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Discover India's
            </span>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-bold text-[#1C120E] tracking-tight leading-[1.06] mt-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Sacred Temples
            </h1>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#3D291D] leading-[1.6] max-w-[490px] mb-7 font-normal drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
            Explore temples, book darshan, participate in sevas and experience the divine, all in one place.
          </p>

          {/* Search Bar: White Pill with Gold Search Button */}
          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white rounded-full shadow-[0_6px_28px_rgba(28,18,14,0.12)] border border-[#E5DDD0] px-2 w-full max-w-[500px] sm:max-w-[540px] h-[52px] sm:h-[58px] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#BA771E] focus-within:border-[#BA771E]"
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
              className="shrink-0 px-6 sm:px-7 h-10 sm:h-11 bg-gradient-to-r from-[#BA771E] to-[#A06214] hover:from-[#A06214] hover:to-[#6B2724] text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center active:scale-[0.98] cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Popular Searches Row */}
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 mt-4 pl-0">
            <span className="text-xs font-bold text-[#2A1810] tracking-wide shrink-0">
              Popular searches:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handlePopularSearch(term)}
                  className="px-3 py-1 rounded-full bg-white/95 hover:bg-white text-[#2B1B15] text-[11px] font-semibold shadow-xs border border-[#E5DDD0]/80 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 5. Innovative & Balanced Floating Explore Capsule */}
      <div className="absolute bottom-6 sm:bottom-8 lg:bottom-9 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          onClick={handleScrollDown}
          className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/92 hover:bg-white backdrop-blur-md border border-[#E5DDD0]/90 shadow-[0_4px_20px_rgba(36,28,22,0.10)] hover:shadow-[0_8px_25px_rgba(186,119,30,0.22)] hover:border-[#BA771E]/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          title="Scroll down to explore sacred shrines and sevas"
          aria-label="Scroll down to explore sacred shrines and sevas"
        >
          {/* Golden pulsing aura dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BA771E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BA771E]" />
          </span>

          {/* Refined spiritual label */}
          <span className="text-xs font-semibold text-[#3D291D] group-hover:text-[#BA771E] tracking-wider uppercase transition-colors">
            Explore Sacred Shrines
          </span>

          {/* Animated down chevron badge */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FDF7ED] to-[#F5EAD4] border border-[#E8C878]/60 flex items-center justify-center text-[#BA771E] group-hover:bg-[#BA771E] group-hover:text-white transition-all duration-200">
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default HeroSearch;
