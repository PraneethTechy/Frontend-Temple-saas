import React from 'react';
import { Landmark, Compass, Sparkles } from 'lucide-react';

export const TempleStory = ({ temple }) => {
  if (!temple?.description) return null;

  return (
    <section id="story-section" className="scroll-mt-28 space-y-6">
      <div className="spiritual-card p-6 sm:p-10 lg:p-12 bg-white border border-amber-200/60 rounded-3xl shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Heading & Cultural Context */}
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5" />
              <span>Sacred Kshetra</span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-spiritual-text leading-tight">
              About this sacred place
            </h2>

            <div className="pt-2 border-t border-amber-200/50 space-y-2 text-xs text-spiritual-muted">
              <div>
                <span className="font-semibold text-spiritual-text">Sanctum: </span>
                <span>{temple.name}</span>
              </div>
              <div>
                <span className="font-semibold text-spiritual-text">Location: </span>
                <span>{temple.city}, {temple.state}</span>
              </div>
              {temple.templeType && (
                <div>
                  <span className="font-semibold text-spiritual-text">Architecture & Heritage: </span>
                  <span>{temple.templeType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Authentic Editorial Description from Database */}
          <div className="lg:col-span-8 space-y-4">
            <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed sm:leading-loose whitespace-pre-line font-normal">
              {temple.description}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TempleStory;
