import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import {
  useGetTempleBySlugQuery,
  useGetTempleServicesQuery,
  useGetTempleReviewsQuery,
} from '../../store/api/devoteeApi.js';

// Modular Sub-components matching final editorial structure
import TempleHero from '../../components/devotee/temple-profile/TempleHero.jsx';
import TempleQuickInfo from '../../components/devotee/temple-profile/TempleQuickInfo.jsx';
import MainContentGrid from '../../components/devotee/temple-profile/MainContentGrid.jsx';
import DevotionalOfferings from '../../components/devotee/temple-profile/DevotionalOfferings.jsx';
import PlanYourVisit from '../../components/devotee/temple-profile/PlanYourVisit.jsx';
import TempleGallery from '../../components/devotee/temple-profile/TempleGallery.jsx';
import VisitingGuidelines from '../../components/devotee/temple-profile/VisitingGuidelines.jsx';
import MobileFloatingBookingBar from '../../components/devotee/temple-profile/MobileFloatingBookingBar.jsx';
import TempleBookingDrawer from '../../components/devotee/temple-profile/TempleBookingDrawer.jsx';

export const TempleDetails = () => {
  const { slug } = useParams();

  // 1. Fetch Temple Details by Slug
  const {
    data: templeRes,
    isLoading: templeLoading,
    isError: templeError,
    error: templeErr,
  } = useGetTempleBySlugQuery(slug);
  const temple = templeRes?.data;

  // 2. Fetch Active Services for this Temple
  const { data: servicesRes } = useGetTempleServicesQuery(temple?._id, {
    skip: !temple?._id,
  });
  const services = servicesRes?.data || [];

  // 3. Fetch Real Approved Reviews for Summary
  const { data: reviewsRes } = useGetTempleReviewsQuery(temple?._id, {
    skip: !temple?._id,
  });
  const reviewSummary = reviewsRes?.data?.summary || { averageRating: null, totalReviews: 0 };

  // 4. Inline Selected Service & Date
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // 5. Unified Booking Drawer State
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [drawerServiceId, setDrawerServiceId] = useState('');
  const [drawerDate, setDrawerDate] = useState('');

  const handleOpenBookingDrawer = (serviceIdToUse, dateToUse) => {
    setDrawerServiceId(serviceIdToUse || selectedServiceId || services[0]?._id || '');
    setDrawerDate(dateToUse || selectedDate);
    setIsBookingDrawerOpen(true);
  };

  const scrollToSection = (sectionId) => {
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
          {templeErr?.data?.message ||
            'The requested temple profile could not be found or is currently not active on DevaSetu.'}
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
      />
    </div>
  );
};

export default TempleDetails;
