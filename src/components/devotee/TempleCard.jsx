import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, ArrowRight, Building2, Heart, Loader2 } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import {
  useGetSavedTemplesQuery,
  useSaveTempleMutation,
  useUnsaveTempleMutation,
} from '../../store/api/devoteeApi.js';

export const TempleCard = ({
  id,
  slug,
  name,
  location,
  image,
  badge,
  services = [],
  isSaved: propIsSaved,
  onToggleSave,
}) => {
  const [imgError, setImgError] = useState(false);
  const [actionError, setActionError] = useState('');
  const hasValidImage = Boolean(image) && !imgError;
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = Boolean(user);
  const isDevotee = user?.role === 'DEVOTEE';

  const { data: savedRes } = useGetSavedTemplesQuery(undefined, {
    skip: !isAuthenticated || !isDevotee,
  });

  const isSaved = useMemo(() => {
    if (propIsSaved !== undefined) return propIsSaved;
    if (!id || !savedRes?.data?.items) return false;
    return savedRes.data.items.some((item) => (item._id || item.id) === id);
  }, [propIsSaved, id, savedRes]);

  const [saveTempleMutation, { isLoading: isSaving }] = useSaveTempleMutation();
  const [unsaveTempleMutation, { isLoading: isUnsaving }] = useUnsaveTempleMutation();
  const isPending = isSaving || isUnsaving;

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onToggleSave) {
      onToggleSave(e, id);
      return;
    }

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!isDevotee) {
      return;
    }

    if (!id || isPending) return;

    setActionError('');
    try {
      if (isSaved) {
        await unsaveTempleMutation(id).unwrap();
      } else {
        await saveTempleMutation(id).unwrap();
      }
    } catch (err) {
      const msg = isSaved
        ? 'Unable to remove this temple. Please try again.'
        : 'Unable to save this temple. Please try again.';
      setActionError(msg);
      setTimeout(() => setActionError(''), 3500);
    }
  };

  const detailUrl = slug ? `/temples/${slug}` : id ? `/temples/${id}` : ROUTES.TEMPLES;

  return (
    <Link
      to={detailUrl}
      className="group relative flex flex-col h-[380px] bg-white border border-[#EADBCC]/70 rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgba(47,33,26,0.04)] hover:shadow-[0_8px_24px_rgba(201,138,34,0.1)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer block select-none"
    >
      {/* Action Error Banner */}
      {actionError && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-1 left-2 right-2 z-30 px-2.5 py-1 bg-red-600 text-white text-[11px] font-medium rounded-lg text-center shadow-md animate-fade-in"
        >
          {actionError}
        </div>
      )}

      {/* 1. Temple Image: Increased height (h-48 = 192px) for rich visual presence */}
      <div className="relative h-48 w-full overflow-hidden bg-[#FAF8F3] shrink-0">
        {hasValidImage ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF8F3] via-[#F5EAD4]/40 to-[#FAF8F3] text-[#C98A22]/60">
            <Building2 className="w-10 h-10 mb-1 text-[#C98A22]/70" />
            <span className="text-[11px] font-serif font-medium text-[#6F6259]">Sacred Mandir</span>
          </div>
        )}

        {/* Dynamic Badge (e.g. Most Visited in warm red) */}
        {badge && typeof badge === 'string' && badge.trim().length > 0 && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#C2410C] text-white text-[10px] font-semibold tracking-wide rounded-md shadow-sm">
            {badge.trim()}
          </div>
        )}

        {/* Favorite/Save Heart Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          disabled={isPending}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-sm flex items-center justify-center text-[#6F6259] hover:text-red-500 transition-all cursor-pointer disabled:opacity-60"
          aria-label={isSaved ? 'Remove from saved' : 'Save temple'}
          title={isSaved ? 'Saved to sacred places' : 'Save temple'}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B45309]" />
          ) : (
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isSaved ? 'fill-red-500 text-red-500' : 'text-[#6F6259]'
              }`}
            />
          )}
        </button>
      </div>


      {/* 2. Information Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1.5">
          {/* Temple Name in Playfair Display Serif */}
          <h3
            className="font-bold text-sm sm:text-base text-[#1E130E] group-hover:text-[#B45309] transition-colors line-clamp-2 leading-snug min-h-[2.4rem]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {name}
          </h3>

          {/* Location Pin */}
          <div className="flex items-center gap-1.5 text-xs text-[#6F6055]">
            <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {/* Service Chips */}
          {Array.isArray(services) && services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {services.map((srv, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#5C4D44] text-[10px] font-medium border border-[#EFE8DF]"
                >
                  {typeof srv === 'string' ? srv : srv?.name || 'Seva'}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* View Temple Link & Arrow */}
        <div className="pt-2.5 border-t border-[#EADBCC]/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-[#4A3B32] group-hover:text-[#B45309] transition-colors flex items-center gap-1">
            <span>View Temple</span>
            <ArrowRight className="w-3 h-3 text-[#B45309] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="w-6 h-6 rounded-full bg-[#FAF5EE] group-hover:bg-[#B45309] group-hover:text-white border border-[#EADBCC] flex items-center justify-center text-[#8C5D23] transition-all">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TempleCard;
