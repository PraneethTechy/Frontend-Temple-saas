import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useGetSavedTemplesQuery } from '../../store/api/devoteeApi.js';
import { TempleCard } from '../../components/devotee/TempleCard.js';
import { ROUTES } from '../../constants/routes.js';
import type { Temple } from '@shared/types/index.js';

const extractErrorMessage = (err: unknown, fallback = 'We encountered an error retrieving your saved shrines. Please try again.'): string => {
  if (err && typeof err === 'object' && 'data' in err) {
    const errorData = (err as { data?: { message?: string } }).data;
    if (errorData?.message) return errorData.message;
  }
  return fallback;
};

export const SavedTemples: React.FC = () => {
  const { data: response, isLoading, isError, error, refetch } = useGetSavedTemplesQuery();

  const savedTemples: Temple[] = response?.data?.items || [];
  const totalCount = response?.data?.pagination?.total ?? savedTemples.length;

  return (
    <div className="w-full min-h-screen bg-[#F9F6EF] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EADBCC]/60 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-medium border border-purple-200/60">
              <Heart className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
              <span>Sacred Bookmarks</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E130E] tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Saved Temples
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6055] max-w-xl">
              Keep the sacred places you wish to visit close at hand.
            </p>
          </div>

          {savedTemples.length > 0 && (
            <div className="text-xs sm:text-sm text-[#8C5D23] font-medium bg-[#FFFBF2] px-4 py-2 rounded-xl border border-[#EADBCC]/70 self-start sm:self-auto">
              <span className="font-bold text-[#B45309]">{totalCount}</span> {totalCount === 1 ? 'Sacred Temple' : 'Sacred Temples'} Saved
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-[380px] bg-white/70 border border-[#EADBCC]/60 rounded-[20px] overflow-hidden p-4 flex flex-col justify-between"
              >
                <div className="h-48 bg-stone-200/60 rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-stone-200/60 rounded w-3/4" />
                  <div className="h-3 bg-stone-200/40 rounded w-1/2" />
                </div>
                <div className="h-8 bg-stone-200/40 rounded mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="p-8 text-center max-w-md mx-auto my-12 bg-white border border-rose-200 rounded-3xl shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1E130E]">Unable to Load Saved Temples</h3>
            <p className="text-xs text-[#6F6055]">
              {extractErrorMessage(error)}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="px-5 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && savedTemples.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-[#EADBCC]/70 rounded-[24px] shadow-[0_4px_20px_rgba(201,138,34,0.04)] max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-[#B45309] mb-4">
              <Heart className="w-7 h-7 stroke-[1.7] text-[#B45309]" />
            </div>
            <h3
              className="font-bold text-xl sm:text-2xl text-[#1E130E] mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              No Saved Temples Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6055] max-w-sm mb-6 leading-relaxed">
              Save temples you would like to visit later.
            </p>
            <Link
              to={ROUTES.TEMPLES}
              className="px-6 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Temples</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Saved Temples Grid */}
        {!isLoading && !isError && savedTemples.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedTemples.map((temple) => (
              <TempleCard
                key={temple._id}
                id={temple._id}
                slug={temple.slug}
                name={temple.name}
                location={temple.city && temple.state ? `${temple.city}, ${temple.state}` : temple.address || 'India'}
                image={
                  temple.coverImage?.url ||
                  temple.gallery?.[0]?.url ||
                  undefined
                }
                badge={temple.templeType}
                services={temple.facilities || []}
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTemples;
