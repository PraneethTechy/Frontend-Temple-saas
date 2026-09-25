import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useGetCategoriesQuery } from '../../store/api/categoryApi.js';
import { ROUTES } from '../../constants/routes.js';

/**
 * Devotional Emblem Placeholder when a category has no image uploaded
 */
const DevotionalEmblem = ({ name }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF9EE] via-[#FAF3E8] to-[#F5EADB] text-[#B45309]">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 opacity-85"
      >
        {/* Sacred Kalash / Lotus stylized icon */}
        <circle cx="24" cy="24" r="21" stroke="#DFC67F" strokeWidth="1.5" strokeDasharray="2 3" />
        <path
          d="M24 8 C22 13 18 16 18 20 C18 23.3 20.7 26 24 26 C27.3 26 30 23.3 30 20 C30 16 26 13 24 8 Z"
          fill="url(#goldGrad)"
          stroke="#B45309"
          strokeWidth="1.2"
        />
        <path
          d="M16 25 C14 28 15 32 18 34 C21 36 27 36 30 34 C33 32 34 28 32 25"
          stroke="#B45309"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M21 34 L21 38 H27 L27 34" stroke="#B45309" strokeWidth="1.5" />
        <defs>
          <linearGradient id="goldGrad" x1="18" y1="8" x2="30" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[10px] font-serif font-bold text-[#8B5E34] mt-1 tracking-wider uppercase">
        {name ? name.slice(0, 3) : 'OM'}
      </span>
    </div>
  );
};

export const DeityCategorySection = () => {
  const { data: categoriesRes, isLoading, isError, error, refetch, isFetching } = useGetCategoriesQuery();
  const categories = categoriesRes?.data || [];

  const scrollRef = useRef(null);

  const handleScrollLeft = () => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.firstElementChild;
    const scrollAmount = card ? card.offsetWidth + 16 : 240;
    if (scrollRef.current.scrollLeft <= 10) {
      // Loop around to end of carousel
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.firstElementChild;
    const scrollAmount = card ? card.offsetWidth + 16 : 240;
    if (scrollRef.current.scrollLeft + scrollRef.current.clientWidth >= scrollRef.current.scrollWidth - 10) {
      // Loop around to beginning of carousel
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const showSlidingControls = categories.length > 5;

  return (
    <section aria-label="Find Temples by Deity" className="w-full flex flex-col">
      {/* 1. Header (Level-aligned styling) */}
      <div className="h-[54px] flex items-end justify-between mb-4">
        <div>
          <h2
            className="font-bold text-2xl sm:text-[26px] text-[#1E130E] leading-tight tracking-tight whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Find Temples by Deity
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6055] font-normal mt-0.5">
            Discover sacred temples dedicated to the divine you seek
          </p>
        </div>

        {categories.length > 0 && (
          <Link
            to={ROUTES.TEMPLES}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#B45309] hover:text-[#78350F] transition-colors pb-0.5 whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="py-1">
        {/* State 1: Loading Skeleton (5 cards on desktop) */}
        {isLoading && (
          <div className="flex gap-4 overflow-hidden py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="shrink-0 w-[calc((100%-16px)/2)] sm:w-[calc((100%-32px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] bg-white border border-[#EADBCC]/70 rounded-2xl p-4 flex flex-col items-center animate-pulse"
              >
                <div className="w-20 h-20 rounded-full bg-[#EADBCC]/40 mb-3" />
                <div className="h-4 bg-[#EADBCC]/50 rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#EADBCC]/30 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* State 2: Error State */}
        {!isLoading && isError && (
          <div className="bg-white border border-[#EADBCC]/80 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-2.5">
            <AlertCircle className="w-6 h-6 text-[#6B2724]" />
            <p className="text-xs font-semibold text-[#2F211A]">Unable to load temple categories</p>
            <p className="text-[11px] text-[#6F6259]">
              {error?.data?.message || 'Please check your connection and try again.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#B45309] hover:bg-[#78350F] shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* State 3: Empty State (When MongoDB has zero categories) */}
        {!isLoading && !isError && categories.length === 0 && (
          <div className="bg-white border border-[#EADBCC]/70 rounded-2xl p-7 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FAF0E1] border border-[#EEDBBA] flex items-center justify-center text-[#B45309] mb-2.5">
              <span className="font-serif text-lg font-bold">🕉️</span>
            </div>
            <h4
              className="font-bold text-sm text-[#1E130E] mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              No temple categories available yet
            </h4>
            <p className="text-xs text-[#6F6055] max-w-sm leading-relaxed">
              Temple categories will appear here once configured by the platform administrator.
            </p>
          </div>
        )}

        {/* State 4: Active Categories Sliding Carousel (Exactly 5 cards on desktop) */}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="relative group/carousel">
            {/* Floating Left Carousel Navigation Arrow */}
            {showSlidingControls && (
              <button
                type="button"
                onClick={handleScrollLeft}
                aria-label="Previous categories"
                className="absolute -left-3.5 sm:-left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-[#EADBCC] flex items-center justify-center text-[#B45309] hover:bg-[#FAF3E8] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            )}

            {/* Smooth Sliding Carousel Track */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth py-1 px-0.5 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => {
                const targetUrl = `/temples?category=${encodeURIComponent(cat.slug)}`;

                return (
                  <div
                    key={cat._id}
                    className="shrink-0 snap-start w-[calc((100%-16px)/2)] sm:w-[calc((100%-32px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)]"
                  >
                    <Link
                      to={targetUrl}
                      className="group/card w-full h-full bg-white border border-[#EADBCC]/70 hover:border-[#C98A22]/80 rounded-[20px] p-4 sm:p-5 flex flex-col items-center text-center shadow-[0_2px_10px_rgba(47,33,26,0.03)] hover:shadow-[0_8px_22px_rgba(201,138,34,0.13)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer block select-none"
                    >
                      {/* Portrait/Circular Visual Container */}
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-[#EEDBBA] shadow-xs mb-3 shrink-0 bg-[#FAF8F3]">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <DevotionalEmblem name={cat.name} />
                        )}
                      </div>

                      {/* Category Name */}
                      <h3
                        className="font-bold text-sm sm:text-base text-[#1E130E] group-hover/card:text-[#B45309] transition-colors leading-tight line-clamp-1 w-full"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {cat.name}
                      </h3>

                      {/* Real MongoDB Temple Count */}
                      <span className="text-[11px] font-medium text-[#78350F] bg-[#FAF0E1] px-2.5 py-0.5 rounded-full mt-2 border border-[#EEDBBA]/60">
                        {cat.templeCount || 0} {cat.templeCount === 1 ? 'Temple' : 'Temples'}
                      </span>

                      {/* Action link */}
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] group-hover/card:text-[#78350F] transition-colors mt-2.5">
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3 group-hover/card:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Floating Right Carousel Navigation Arrow */}
            {showSlidingControls && (
              <button
                type="button"
                onClick={handleScrollRight}
                aria-label="Next categories"
                className="absolute -right-3.5 sm:-right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-[#EADBCC] flex items-center justify-center text-[#B45309] hover:bg-[#FAF3E8] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DeityCategorySection;
