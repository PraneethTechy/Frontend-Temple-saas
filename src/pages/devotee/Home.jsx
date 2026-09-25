import React from 'react';
import HeroSearch from '../../components/devotee/HeroSearch.jsx';
import QuickActionsSection from '../../components/devotee/QuickActionCard.jsx';
import FeaturedTemplesSection from '../../components/devotee/FeaturedTemplesSection.jsx';
import UpcomingBookingCard from '../../components/devotee/UpcomingBookingCard.jsx';
import DeityCategorySection from '../../components/devotee/DeityCategorySection.jsx';
import HowDevaSetuWorks from '../../components/devotee/HowDevaSetuWorks.jsx';
import RegisterTempleBanner from '../../components/devotee/RegisterTempleBanner.jsx';
import TrustSection from '../../components/devotee/TrustSection.jsx';

export const Home = () => {
  return (
    <div className="w-full flex flex-col bg-[#F9F6EF]">
      {/* 1. Full-Bleed Sacred Temple Hero across 100% viewport width */}
      <HeroSearch />

      {/* Main Content Container with strict section rhythm and cohesive hierarchy */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2. Hero → Quick Actions: 24–30px */}
        <div className="mt-6 sm:mt-7">
          <QuickActionsSection />
        </div>

        {/* 3. Quick Actions → Featured Temples + Upcoming Booking: 50–64px */}
        <div className="mt-12 sm:mt-14">
          <section
            aria-label="Sacred Shrines & Bookings"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Featured Temples: 9 cols on lg (~75% width for balanced cards) */}
            <div className="lg:col-span-9 flex flex-col">
              <FeaturedTemplesSection />
            </div>

            {/* Upcoming Booking: 3 cols on lg (~25% width, matching card scale) */}
            <div className="lg:col-span-3 flex flex-col">
              <UpcomingBookingCard />
            </div>
          </section>
        </div>

        {/* 4. Find Temples by Deity (100% Dynamic Category Discovery) */}
        <div className="mt-12 sm:mt-14">
          <DeityCategorySection />
        </div>

        {/* 5. Featured → Guided Journey (How DevaSetu Works): 60–80px */}
        <div className="mt-16 sm:mt-20">
          <HowDevaSetuWorks />
        </div>

        {/* 5. Guided Journey → Temple Registration CTA */}
        <div className="mt-12 sm:mt-14">
          <RegisterTempleBanner />
        </div>

        {/* 6. CTA → Trust (36–40px) & Trust → Footer (36–48px) */}
        <div className="mt-9 sm:mt-10 mb-9 sm:mb-11">
          <TrustSection />
        </div>
      </div>
    </div>
  );
};

export default Home;
