import React from 'react';
import { ShieldCheck, CreditCard, Headphones, Users } from 'lucide-react';

export const TrustSection = () => {
  const trustItems = [
    {
      title: 'Authentic Information',
      description: 'Verified temple details',
      icon: ShieldCheck,
    },
    {
      title: 'Secure Payments',
      description: '100% safe & secure',
      icon: CreditCard,
    },
    {
      title: '24/7 Support',
      description: "We're here to help",
      icon: Headphones,
    },
    {
      title: 'Trusted Platform',
      description: 'Serving devotees across India',
      icon: Users,
    },
  ];

  return (
    <section aria-label="Platform Highlights" className="w-full">
      <div className="w-full rounded-2xl bg-white border border-[#EADBCC]/80 py-4 px-5 sm:px-6 shadow-[0_2px_12px_rgba(47,33,26,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3.5 min-w-0"
              >
                {/* Warm Gold Squircle Icon Badge */}
                <div className="w-11 h-11 rounded-xl bg-[#FAF2E6] border border-[#EEDBBA] flex items-center justify-center text-[#B45309] shrink-0 shadow-xs">
                  <Icon className="w-5 h-5 text-[#B45309] stroke-[1.75]" />
                </div>

                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className="font-bold text-xs sm:text-sm text-[#1E130E] leading-snug truncate">
                    {item.title}
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#6F6055] leading-snug mt-0.5 truncate">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
