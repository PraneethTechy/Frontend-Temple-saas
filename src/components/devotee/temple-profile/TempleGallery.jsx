import React, { useState } from 'react';
import { Image as ImageIcon, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const TempleGallery = ({ temple }) => {
  const [activeImageModal, setActiveImageModal] = useState(null);
  const galleryList = Array.isArray(temple?.gallery) ? temple.gallery : [];

  if (galleryList.length === 0) {
    return null;
  }

  // Large primary photo + up to 4 smaller photos
  const primaryImage = galleryList[0];
  const secondaryImages = galleryList.slice(1, 5);

  return (
    <div className="spiritual-card bg-white border border-amber-200/60 rounded-2xl shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-serif font-bold text-base sm:text-lg text-stone-800">
            Temple Gallery
          </h2>
        </div>

        {galleryList.length > 1 && (
          <button
            type="button"
            onClick={() => setActiveImageModal(galleryList[0])}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({galleryList.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Editorial Grid: 1 Large + 4 Small in 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 h-[220px]">
        {/* Large Primary Photo (6 cols) */}
        <div
          onClick={() => setActiveImageModal(primaryImage)}
          className="sm:col-span-6 h-full rounded-xl overflow-hidden bg-stone-900 cursor-pointer group relative shadow-2xs"
        >
          <img
            src={primaryImage?.url}
            alt={primaryImage?.alt || temple.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
            <Eye className="w-4 h-4" />
            <span>View</span>
          </div>
        </div>

        {/* 4 Small Photos in 2x2 Grid (6 cols) */}
        <div className="sm:col-span-6 grid grid-cols-2 gap-2 h-full">
          {secondaryImages.map((img, idx) => (
            <div
              key={img._id || idx}
              onClick={() => setActiveImageModal(img)}
              className="h-[105px] rounded-lg overflow-hidden bg-stone-900 cursor-pointer group relative shadow-2xs"
            >
              <img
                src={img.url}
                alt={img.alt || `${temple.name} photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-medium">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}

          {/* If fewer than 4 secondary images, fill empty slots with subtle placeholder or stretch */}
          {secondaryImages.length === 0 && (
            <div className="col-span-2 h-full rounded-lg bg-amber-50/50 border border-dashed border-amber-200 flex items-center justify-center text-xs text-stone-400">
              More photos coming soon
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setActiveImageModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeImageModal.url}
              alt={activeImageModal.alt || temple.name}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {activeImageModal.alt && (
              <p className="text-white/80 text-xs mt-3 text-center">
                {activeImageModal.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TempleGallery;
