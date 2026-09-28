import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import {
  useGetTempleBySlugQuery,
  useGetTempleServicesQuery,
  useGetTempleReviewsQuery,
} from '../../store/api/devoteeApi.js';
import type { Temple, Service } from '@shared/types/index.js';
import type { TempleQuickInfoReviewSummary } from '../../components/devotee/temple-profile/TempleQuickInfo.js';

// Modular Sub-components matching final editorial structure
import TempleHero from '../../components/devotee/temple-profile/TempleHero.js';
import TempleQuickInfo from '../../components/devotee/temple-profile/TempleQuickInfo.js';
import MainContentGrid from '../../components/devotee/temple-profile/MainContentGrid.js';
import DevotionalOfferings from '../../components/devotee/temple-profile/DevotionalOfferings.js';
import PlanYourVisit from '../../components/devotee/temple-profile/PlanYourVisit.js';
import TempleGallery from '../../components/devotee/temple-profile/TempleGallery.js';
import VisitingGuidelines from '../../components/devotee/temple-profile/VisitingGuidelines.js';
import MobileFloatingBookingBar from '../../components/devotee/temple-profile/MobileFloatingBookingBar.js';
import TempleBookingDrawer from '../../components/devotee/temple-profile/TempleBookingDrawer.js';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    const data = (err as Record<string, unknown>).data;
    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as Record<string, unknown>).message === 'string'
    ) {
      return (data as Record<string, unknown>).message as string;
    }
  }
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as Record<string, unknown>).message === 'string'
  ) {
    return (err as Record<string, unknown>).message as string;
  }
  return fallback;
}

export interface TempleDetailCategory {
  _id?: string;
  name: string;
  slug?: string;
}

export interface TempleDetailData extends Omit<Temple, 'categories'> {
  categories?: TempleDetailCategory[];
}

export const TempleDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // 1. Fetch Temple Details by Slug
  const {
    data: templeRes,
    isLoading: templeLoading,
    isError: templeError,
    error: templeErr,
  } = useGetTempleBySlugQuery(slug || '');
  const temple = templeRes?.data as TempleDetailData | undefined;

  // 2. Fetch Active Services for this Temple
  const { data: servicesRes } = useGetTempleServicesQuery(temple?._id || '', {
    skip: !temple?._id,
  });
  const services: Service[] = (servicesRes?.data as Service[]) || [];

  // 3. Fetch Real Approved Reviews for Summary
  const { data: reviewsRes } = useGetTempleReviewsQuery(temple?._id || '', {
    skip: !temple?._id,
  });
  const reviewSummary: TempleQuickInfoReviewSummary =
    (reviewsRes?.data && typeof reviewsRes.data === 'object' && 'summary' in reviewsRes.data
      ? (reviewsRes.data as unknown as { summary?: TempleQuickInfoReviewSummary }).summary
      : undefined) || { averageRating: null, totalReviews: 0 };

  // 4. Inline Selected Service & Date
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // 5. Unified Booking Drawer State
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState<boolean>(false);
  const [drawerServiceId, setDrawerServiceId] = useState<string>('');
  const [drawerDate, setDrawerDate] = useState<string>('');
  const [drawerSlotId, setDrawerSlotId] = useState<string>('');

  const handleOpenBookingDrawer = (
    serviceIdToUse?: string,
    dateToUse?: string,
    slotIdToUse?: string
  ): void => {
    setDrawerServiceId(serviceIdToUse || selectedServiceId || services[0]?._id || '');
    setDrawerDate(dateToUse || selectedDate);
    setDrawerSlotId(slotIdToUse || '');
    setIsBookingDrawerOpen(true);
  };

  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading Skeleton matching final compact layout
  if (templeLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-[320px] bg-stone-200/80 rounded-3xl" />
        <div className="h-16 bg-stone-200/60 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-56 bg-stone-200/50 rounded-2xl" />
          <div className="lg:col-span-4 h-56 bg-stone-200/50 rounded-2xl" />
          <div className="lg:col-span-4 h-56 bg-stone-200/50 rounded-2xl" />
        </div>
        <div className="h-44 bg-stone-200/50 rounded-2xl" />
      </div>
    );
  }

  // Not Found or Error State
  if (templeError || !temple) {
    return (
      <div className="spiritual-card p-10 text-center max-w-lg mx-auto my-16 bg-white border border-amber-200/60 rounded-3xl shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-xl text-stone-800 mb-2">
          Temple Not Found
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          {extractErrorMessage(
            templeErr,
            'The requested temple profile could not be found or is currently not active on DevaSetu.'
          )}
        </p>
        <Link
          to="/temples"
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-block"
        >
          Return to Temples Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7 pb-20">
      {/* 1. Immersive Temple Hero (280-340px desktop) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <TempleHero
          temple={temple}
          onBookDarshan={() => handleOpenBookingDrawer()}
          onScrollToSection={scrollToSection}
        />
      </div>

      {/* 2. Temple Quick Information Strip (60-75px desktop) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TempleQuickInfo temple={temple} reviewSummary={reviewSummary} />
      </div>

      {/* 3. Main Content Grid (Announcements Ticker | About Sacred Place | Darshan Availability) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MainContentGrid
          temple={temple}
          services={services}
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onOpenAvailabilityModal={handleOpenBookingDrawer}
        />
      </div>

      {/* 4. Devotional Offerings (3 clean cards in one row, no images) */}
      {services.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DevotionalOfferings
            services={services}
            slug={slug}
            selectedServiceId={selectedServiceId}
            onOpenAvailabilityModal={handleOpenBookingDrawer}
          />
        </div>
      )}

      {/* 5. Lower Content Grid (Plan Your Visit with Map preview + Temple Gallery) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          <div className={Array.isArray(temple.gallery) && temple.gallery.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <PlanYourVisit temple={temple} />
          </div>
          {Array.isArray(temple.gallery) && temple.gallery.length > 0 && (
            <div className="lg:col-span-5">
              <TempleGallery temple={temple} />
            </div>
          )}
        </div>
      </div>

      {/* 6. Guidelines & Amenities (One compact card at bottom) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <VisitingGuidelines temple={temple} />
      </div>

      {/* 7. Mobile Sticky Floating Booking Bar */}
      <MobileFloatingBookingBar
        temple={temple}
        hasServices={services.length > 0}
        onBookClick={() => handleOpenBookingDrawer()}
      />

      {/* 8. Unified Booking Drawer (Unifies all entry points without page navigation) */}
      <TempleBookingDrawer
        isOpen={isBookingDrawerOpen}
        onClose={() => setIsBookingDrawerOpen(false)}
        temple={temple}
        services={services}
        initialServiceId={drawerServiceId}
        initialDate={drawerDate}
        initialSlotId={drawerSlotId}
      />
    </div>
  );
};

export default TempleDetails;
