import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MapPin,
  Calendar,
  Compass,
  Landmark,
  Heart,
  Loader2,
} from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';
import {
  useGetSavedTemplesQuery,
  useSaveTempleMutation,
  useUnsaveTempleMutation,
} from '../../../store/api/devoteeApi.js';

export const TempleHero = ({ temple, onBookDarshan, onScrollToSection }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = Boolean(user);
  const isDevotee = user?.role === 'DEVOTEE';

  const templeId = temple?._id;

  const { data: savedRes } = useGetSavedTemplesQuery(undefined, {
    skip: !isAuthenticated || !isDevotee,
  });

  const isSaved = useMemo(() => {
    if (!templeId || !savedRes?.data?.items) return false;
    return savedRes.data.items.some((item) => (item._id || item.id) === templeId);
  }, [templeId, savedRes]);

  const [saveTempleMutation, { isLoading: isSaving }] = useSaveTempleMutation();
  const [unsaveTempleMutation, { isLoading: isUnsaving }] = useUnsaveTempleMutation();
  const [saveError, setSaveError] = useState('');
  const isPending = isSaving || isUnsaving;

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!isDevotee || !templeId || isPending) return;

    setSaveError('');
    try {
      if (isSaved) {
        await unsaveTempleMutation(templeId).unwrap();
      } else {
        await saveTempleMutation(templeId).unwrap();
      }
    } catch (err) {
      setSaveError(
        isSaved
          ? 'Unable to remove this temple. Please try again.'
          : 'Unable to save this temple. Please try again.'
      );
      setTimeout(() => setSaveError(''), 3500);
    }
  };

  // Real banner or cover image from MongoDB
  const bannerImg =
    temple?.coverImage?.url ||
    temple?.gallery?.find((img) => img.isBanner)?.url ||
    temple?.gallery?.[0]?.url ||
    null;

  const categoryName =
    temple?.categories?.[0]?.name || temple?.templeType || 'Traditional Heritage';

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-spiritual-md bg-stone-900 h-[300px] sm:h-[320px] lg:h-[340px] flex flex-col justify-end">
      {/* Background Image / Banner */}
      {bannerImg ? (
        <img
          src={bannerImg}
          alt={temple.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950" />
      )}

      {/* Subtle readability gradient - soft dark-to-transparent overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-white max-w-3xl space-y-2.5">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[11px] font-semibold tracking-wide text-amber-200 border border-white/20">
          <Landmark className="w-3 h-3 text-amber-300" />
          <span>{categoryName}</span>
        </div>

        {/* Temple Name */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
          {temple.name}
        </h1>

        {/* Location Subtitle */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-200">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium">
            {temple.city}, {temple.state}
          </span>
        </div>

        {/* Short Real Description (max 2 lines) */}
        {temple.description && (
          <p className="text-xs text-stone-300/95 line-clamp-2 max-w-2xl leading-relaxed pt-0.5">
            {temple.description}
          </p>
        )}

        {/* Action Error message if any */}
        {saveError && (
          <div className="text-xs text-rose-300 bg-rose-950/80 px-3 py-1 rounded-lg border border-rose-800/80 inline-block">
            {saveError}
          </div>
        )}

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBookDarshan}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Darshan</span>
          </button>

          <button
            type="button"
            onClick={() => onScrollToSection('plan-section')}
            className="px-5 py-2.5 bg-black/35 hover:bg-black/50 text-white text-xs sm:text-sm font-medium rounded-xl border border-white/30 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Plan Your Visit</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSave}
            disabled={isPending}
            className={`px-4 py-2.5 rounded-xl border backdrop-blur-xs text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 ${
              isSaved
                ? 'bg-rose-500/25 border-rose-400/80 text-rose-200 hover:bg-rose-500/35'
                : 'bg-black/35 hover:bg-black/50 text-stone-200 border-white/30'
            }`}
            aria-label={isSaved ? 'Remove from saved' : 'Save temple'}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <Heart
                className={`w-4 h-4 ${
                  isSaved ? 'fill-rose-400 text-rose-400' : 'text-stone-200'
                }`}
              />
            )}
            <span>{isSaved ? 'Saved' : 'Save Temple'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default TempleHero;
