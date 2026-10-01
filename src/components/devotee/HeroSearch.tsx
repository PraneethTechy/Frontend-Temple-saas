import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Sparkles, MapPin, Loader2, Building2, ArrowRight } from 'lucide-react';
import heroBg from '../../assets/Hero_Section_bg.png';
import { ROUTES } from '../../constants/routes.js';
import { useGetTemplesQuery } from '../../store/api/devoteeApi.js';
import type { Temple } from '@shared/types/index.js';

export const HeroSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularSearches: string[] = ['Tirupati', 'Srisailam', 'Kashi', 'Meenakshi', 'Somnath'];

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const trimmedQuery = debouncedSearch.trim();
  const shouldQuery = trimmedQuery.length >= 2;

  // Real API RTK Query (limit to top 5 results)
  const { data, isFetching, isLoading } = useGetTemplesQuery(
    { search: trimmedQuery, limit: 5 },
    { skip: !shouldQuery }
  );

  const suggestions: Temple[] = (data?.data?.items as Temple[]) || [];

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectTemple = useCallback(
    (temple: Temple): void => {
      setIsOpen(false);
      setSearchTerm(temple.name);
      navigate(`/temples/${temple.slug || temple._id}`);
    },
    [navigate]
  );

  const handleSearch = (e?: React.FormEvent): void => {
    e?.preventDefault?.();
    setIsOpen(false);
    if (searchTerm.trim()) {
      navigate(`/temples?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(ROUTES.TEMPLES);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!isOpen || trimmedQuery.length < 2) {
      if (e.key === 'ArrowDown' && searchTerm.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        handleSelectTemple(suggestions[selectedIndex]);
      } else {
        handleSearch(e);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handlePopularSearch = (term: string): void => {
    setSearchTerm(term);
    setIsOpen(false);
    navigate(`/temples?search=${encodeURIComponent(term)}`);
  };

  const handleScrollDown = (): void => {
    const navbarHeight = window.innerWidth >= 640 ? 81 : 73;
    window.scrollTo({
      top: window.innerHeight - navbarHeight,
      behavior: 'smooth',
    });
  };

  const showDropdown = isOpen && searchTerm.trim().length >= 2;
  const isPendingInitialQuery = shouldQuery && (isFetching || isLoading) && suggestions.length === 0;

  return (
    <section
      aria-label="DevaSetu Sacred Hero"
      className="w-full relative overflow-x-clip overflow-y-visible bg-[#FAF8F3] m-0 p-0 h-[calc(100vh-73px)] sm:h-[calc(100vh-81px)] [@supports(height:100dvh)]:h-[calc(100dvh-73px)] sm:[@supports(height:100dvh)]:h-[calc(100dvh-81px)] min-h-[580px] sm:min-h-[620px] flex items-center"
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
      <div className="relative z-30 w-full max-w-[1440px] mx-auto h-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10 flex items-center">
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

          {/* Search Container with Autocomplete Dropdown */}
          <div ref={containerRef} className="relative w-full max-w-[500px] sm:max-w-[540px] z-30">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center bg-white rounded-full shadow-[0_6px_28px_rgba(28,18,14,0.12)] border border-[#E5DDD0] px-2 w-full h-[52px] sm:h-[58px] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#BA771E] focus-within:border-[#BA771E]"
            >
              <div className="pl-3 sm:pl-4 pr-2 text-[#7A6D63] shrink-0">
                <Search className="w-5 h-5 text-[#BA771E]" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search temples, cities, services (e.g., Somnath, Darshan, Pooja...)"
                className="w-full h-full px-1 text-xs sm:text-sm text-[#1C120E] bg-transparent placeholder-[#7A6D63]/80 focus:outline-none"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
              />

              <button
                type="submit"
                className="shrink-0 px-6 sm:px-7 h-10 sm:h-11 bg-gradient-to-r from-[#BA771E] to-[#A06214] hover:from-[#A06214] hover:to-[#6B2724] text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center active:scale-[0.98] cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Premium Solid Autocomplete Recommendation Dropdown */}
            {showDropdown && (
              <div
                className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-[#FFFFFF] rounded-[18px] sm:rounded-[20px] shadow-[0_16px_36px_-6px_rgba(42,24,16,0.16),0_6px_16px_-4px_rgba(42,24,16,0.08)] border border-[#E8DED0] overflow-hidden transition-all duration-150 ease-out"
                role="listbox"
                aria-label="Temple search recommendations"
              >
                {isPendingInitialQuery ? (
                  <div className="py-6 px-4 flex items-center justify-center gap-2.5 text-xs text-[#7A6D63] bg-white">
                    <Loader2 className="w-4 h-4 animate-spin text-[#BA771E]" />
                    <span className="font-medium text-[#5A3822]">Searching temples...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="bg-white">
                    {/* Compact Refined Header */}
                    <div className="px-4 py-2 flex items-center justify-between border-b border-[#F0EAE1] bg-[#FAF8F4]/80 text-[11px] font-semibold text-[#8C6D53] tracking-wider uppercase select-none">
                      <span>Matching Temples · {suggestions.length}</span>
                      {isFetching && (
                        <span className="flex items-center gap-1.5 lowercase font-normal text-[10px] text-[#BA771E]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>updating</span>
                        </span>
                      )}
                    </div>

                    {/* Result Rows with Comfortable Compact Height (64-72px) */}
                    <div className="max-h-[360px] sm:max-h-[380px] overflow-y-auto">
                      {suggestions.map((temple, idx) => {
                        const isSelected = selectedIndex === idx;
                        const thumbnail = temple.gallery?.[0]?.url || temple.coverImage?.url;
                        const locationParts = [temple.city, temple.state].filter(Boolean);
                        const locationStr = locationParts.join(', ');
                        const secondaryText = [locationStr, temple.templeType].filter(Boolean).join(' · ');

                        return (
                          <div
                            key={String(temple._id || idx)}
                            role="option"
                            aria-selected={isSelected}
                            onMouseDown={(e) => {
                              // onMouseDown ensures click fires before input onBlur
                              e.preventDefault();
                              handleSelectTemple(temple);
                            }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`group flex items-center gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-colors duration-150 border-b border-[#F4EFEA] last:border-b-0 ${
                              isSelected ? 'bg-[#FAF5ED]' : 'bg-white hover:bg-[#FAF6EF]'
                            }`}
                          >
                            {/* Consistent 38-40px Rounded Thumbnail */}
                            <div className="w-10 h-10 rounded-[10px] sm:rounded-xl overflow-hidden shrink-0 border border-[#E8DED0]/90 bg-[#FAF8F3] flex items-center justify-center text-[#BA771E] shadow-2xs">
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                                    if (next) next.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-full h-full items-center justify-center"
                                style={{ display: thumbnail ? 'none' : 'flex' }}
                              >
                                <Building2 className="w-4 h-4 text-[#BA771E]" />
                              </div>
                            </div>

                            {/* Temple Name (Primary) & Secondary Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="text-[14px] sm:text-[15px] font-semibold text-[#1C120E] group-hover:text-[#BA771E] transition-colors truncate leading-tight">
                                {temple.name}
                              </div>
                              {secondaryText && (
                                <div className="flex items-center gap-1.5 text-[12px] text-[#7A6D63] mt-1 truncate leading-none">
                                  <MapPin className="w-3.5 h-3.5 text-[#BA771E]/90 shrink-0" />
                                  <span className="truncate">{secondaryText}</span>
                                </div>
                              )}
                            </div>

                            {/* Subtle Right Arrow with 2px Hover Shift */}
                            <div className="shrink-0 text-[#C5BBAE] group-hover:text-[#BA771E] group-hover:translate-x-0.5 transition-all duration-200 pl-1">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-5 px-4 text-center bg-white">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF5ED] text-[#BA771E] mb-2">
                      <Search className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#3D291D]">
                      No temples found
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#7A6D63] mt-0.5">
                      Try another temple name, deity, or city
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

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
