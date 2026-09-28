import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import TempleCard, { type TempleCardServiceItem } from './TempleCard';
import { ROUTES } from '../../constants/routes.js';
import { useGetTemplesQuery } from '../../store/api/devoteeApi.js';
import type { Temple, CloudinaryImage } from '@shared/types/index.js';

interface GalleryThumbnailImage extends CloudinaryImage {
  isThumbnail?: boolean;
}

interface TempleWithServices extends Temple {
  services?: Array<string | TempleCardServiceItem>;
}

export const FeaturedTemplesSection: React.FC = () => {
  const { data: templesRes, isLoading, isError, error, refetch, isFetching } = useGetTemplesQuery({ limit: 12 });
  const liveTemples: TempleWithServices[] = (templesRes?.data?.items as TempleWithServices[]) || [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setCanScrollLeft] = useState<boolean>(false);
  const [, setCanScrollRight] = useState<boolean>(true);

  const checkScrollState = (): void => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScrollState();
  }, [liveTemples]);

  const handleScrollLeft = (): void => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.firstElementChild as HTMLElement | null;
    const scrollAmount = card ? card.offsetWidth + 16 : 280;
    if (scrollRef.current.scrollLeft <= 10) {
      // Loop around to end of carousel
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = (): void => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.firstElementChild as HTMLElement | null;
    const scrollAmount = card ? card.offsetWidth + 16 : 280;
    if (scrollRef.current.scrollLeft + scrollRef.current.clientWidth >= scrollRef.current.scrollWidth - 10) {
      // Loop around to beginning of carousel
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const apiError = error as { data?: { message?: string } } | undefined;
  const errorMessage =
    apiError?.data?.message ||
    'Please check your connection and try again.';

  return (
    <div className="flex flex-col h-full relative">
      {/* 1. Header Level-Aligned with Upcoming Booking (54px fixed height) */}
      <div className="h-[54px] flex items-end justify-between mb-4">
        <div>
          <h2
            className="font-bold text-2xl sm:text-[26px] text-[#1E130E] leading-tight tracking-tight whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Featured Temples
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6055] font-normal mt-0.5">
            Explore India's most sacred destinations
          </p>
        </div>

        <Link
          to={ROUTES.TEMPLES}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#B45309] hover:text-[#78350F] transition-colors pb-0.5 whitespace-nowrap"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* State 1: Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#EADBCC]/70 rounded-[20px] p-3.5 flex flex-col justify-between h-[380px] animate-pulse"
            >
              <div className="h-48 bg-[#EADBCC]/30 rounded-xl"></div>
              <div className="space-y-2 pt-3">
                <div className="h-3.5 bg-[#EADBCC]/40 rounded w-3/4"></div>
                <div className="h-3 bg-[#EADBCC]/30 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* State 2: Error State */}
      {!isLoading && isError && (
        <div className="p-8 text-center bg-white border border-[#EADBCC]/80 rounded-[20px] flex-1 flex flex-col items-center justify-center space-y-3 h-[380px]">
          <AlertCircle className="w-7 h-7 text-[#6B2724]" />
          <p className="text-sm font-semibold text-[#2F211A]">Unable to load temples</p>
          <p className="text-xs text-[#6F6259] max-w-sm">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#B45309] hover:bg-[#78350F] shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* State 3: Empty State (0 Temples in Database) */}
      {!isLoading && !isError && liveTemples.length === 0 && (
        <div className="h-[380px] bg-white border border-[#EADBCC]/80 rounded-[20px] p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_rgba(47,33,26,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#FAF0E1] border border-[#EEDBBA] flex items-center justify-center text-[#B45309] mb-3">
            <span className="text-xl">🛕</span>
          </div>
          <h4
            className="font-bold text-base text-[#1E130E] mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            No Temples Registered Yet
          </h4>
          <p className="text-xs text-[#6F6055] max-w-sm mb-4">
            Sacred shrines will appear here once onboarded to DevaSetu.
          </p>
          <Link
            to={ROUTES.REGISTER_TEMPLE}
            className="px-4 py-2 bg-gradient-to-r from-[#B46A18] to-[#965410] text-white text-xs font-semibold rounded-xl hover:from-[#965410] hover:to-[#78350F] shadow-sm transition-all"
          >
            Register Your Temple
          </Link>
        </div>
      )}

      {/* State 4: Success with Real Data - Smooth Sliding Carousel with 3 Cards on lg */}
      {!isLoading && !isError && liveTemples.length > 0 && (
        <div className="relative group/carousel">
          {/* Floating Left Carousel Navigation Arrow */}
          <button
            type="button"
            onClick={handleScrollLeft}
            aria-label="Previous temples"
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white shadow-md border border-[#EADBCC] flex items-center justify-center text-[#B45309] hover:bg-[#FAF3E8] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Smooth Sliding Carousel Track */}
          <div
            ref={scrollRef}
            onScroll={checkScrollState}
            className="flex gap-4 overflow-x-auto scroll-smooth py-1 px-0.5 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {liveTemples.map((temple, idx) => {
              const galleryList = temple.gallery as GalleryThumbnailImage[] | undefined;
              const thumbnail =
                galleryList?.find((img) => img.isThumbnail)?.url ||
                temple.coverImage?.url ||
                galleryList?.[0]?.url;

              const templeServices = temple.services && temple.services.length > 0
                ? temple.services
                : idx === 0
                ? ['Darshan', 'Seva', 'Special']
                : idx % 2 === 1
                ? ['Darshan', 'Pooja']
                : ['Darshan', 'Seva'];

              return (
                <div
                  key={temple._id}
                  className="shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] snap-start"
                >
                  <TempleCard
                    id={temple._id}
                    slug={temple.slug}
                    name={temple.name}
                    location={`${temple.city}, ${temple.state}`}
                    image={thumbnail}
                    badge={idx === 0 ? 'Most Visited' : undefined}
                    services={templeServices}
                  />
                </div>
              );
            })}
          </div>

          {/* Floating Right Carousel Navigation Arrow */}
          <button
            type="button"
            onClick={handleScrollRight}
            aria-label="Next temples"
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white shadow-md border border-[#EADBCC] flex items-center justify-center text-[#B45309] hover:bg-[#FAF3E8] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedTemplesSection;
