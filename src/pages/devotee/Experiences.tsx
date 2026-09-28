import React, { useState, useId, useRef, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Star,
  Camera,
  X,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  MoreHorizontal,
  PenTool,
} from 'lucide-react';
import {
  useGetPublicReviewsQuery,
  useGetEligibleBookingsQuery,
  useSubmitReviewMutation,
} from '../../store/api/reviewApi.js';
import { useAppSelector } from '../../store/hooks.js';
import { ROUTES } from '../../constants/routes.js';
import heroImage from '../../assets/experiences/experiences-hero.jpg';
import DEMO_REVIEWS from '../../data/demoReviews.js';

export interface ReviewCardItem {
  id: string;
  name: string;
  date: string;
  rating: number;
  comment: string;
  photos: string[];
  templeName: string;
  templeCity: string;
  isDemo?: boolean;
  status?: string;
  isOwnReview?: boolean;
}

interface ReviewCardProps {
  review: ReviewCardItem;
}

// Standardized ReviewCard Component with Fixed Media Region & Text Rhythm
const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setFailedIndices((prev) => ({ ...prev, [index]: true }));
  };

  const validPhotos = (review.photos || []).filter((_, idx) => !failedIndices[idx]);
  const hasPhotos = validPhotos.length > 0;

  const commentText = review.comment || '';
  const isLong = commentText.length > 150;

  const templeDisplayName = review.templeCity
    ? `${review.templeName}, ${review.templeCity}`
    : review.templeName;

  return (
    <article className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-300 p-4 sm:p-4.5 shadow-2xs hover:shadow-spiritual-xs transition-all flex flex-col h-full justify-between">
      {/* Top Section */}
      <div className="space-y-3 flex-1 flex flex-col">
        {/* Author Header: Predictable height and alignment */}
        <div className="flex items-start justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center justify-center font-bold text-xs shrink-0 font-serif">
              {review.name ? review.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-xs sm:text-sm text-stone-900 truncate leading-tight" title={review.name}>
                  {review.name}
                </h3>
                {review.isOwnReview && review.status === 'PENDING' && (
                  <span className="shrink-0 text-[9px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded-full">
                    Pending
                  </span>
                )}
                {review.isOwnReview && review.status === 'APPROVED' && (
                  <span className="shrink-0 text-[9px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 block truncate">
                {review.date}
              </span>
            </div>
          </div>

          {/* Stars: shrink-0 so long names never push stars */}
          <div className="flex items-center gap-0.5 shrink-0 pt-0.5" aria-label={`${review.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-3.5 h-3.5 ${
                  starIdx <= review.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Consistent Review Text Region */}
        <div className="flex-1 min-h-[4.5rem]">
          <p className={`text-xs text-stone-700 leading-relaxed font-normal ${!isExpanded ? 'line-clamp-4 sm:line-clamp-5' : ''}`}>
            "{commentText}"
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-1 text-[11px] font-semibold text-amber-800 hover:underline cursor-pointer block"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Fixed Media Region: ALWAYS exactly h-[148px] */}
        <div className="h-[148px] w-full shrink-0 mt-auto">
          {!hasPhotos ? (
            /* ZERO PHOTOS: Soft Devotional Placeholder Panel */
            <div className="w-full h-full bg-[#FAF6EE] border border-amber-200/50 rounded-xl flex flex-col items-center justify-center p-3 text-center select-none">
              <span className="text-xl mb-1 filter drop-shadow-xs" role="img" aria-label="Devotional diya">🪔</span>
              <span className="text-[11px] font-medium text-amber-900/75 tracking-wide font-serif">
                Shared with devotion
              </span>
              <span className="text-[9px] text-stone-400 mt-0.5">
                Sacred community blessing
              </span>
            </div>
          ) : validPhotos.length === 1 ? (
            /* 1 PHOTO: Full reserved media area */
            <div className="w-full h-full rounded-xl overflow-hidden border border-stone-200/80 bg-stone-50">
              <img
                src={validPhotos[0]}
                alt={`${review.name}'s temple experience photo`}
                loading="lazy"
                onError={() => handleImageError(0)}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : validPhotos.length === 2 ? (
            /* 2 PHOTOS: 2 equal columns */
            <div className="grid grid-cols-2 gap-1.5 w-full h-full">
              {validPhotos.slice(0, 2).map((photoUrl, idx) => (
                <div key={idx} className="relative w-full h-full rounded-lg overflow-hidden border border-stone-200/80 bg-stone-50">
                  <img
                    src={photoUrl}
                    alt={`${review.name}'s temple experience photo ${idx + 1}`}
                    loading="lazy"
                    onError={() => handleImageError(idx)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            /* 3 OR MORE PHOTOS: Compact gallery within h-[148px] */
            <div className="grid grid-cols-5 gap-1.5 w-full h-full">
              <div className="col-span-3 relative h-full rounded-lg overflow-hidden border border-stone-200/80 bg-stone-50">
                <img
                  src={validPhotos[0]}
                  alt={`${review.name}'s temple experience photo 1`}
                  loading="lazy"
                  onError={() => handleImageError(0)}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="col-span-2 grid grid-rows-2 gap-1.5 h-full">
                <div className="relative h-full rounded-lg overflow-hidden border border-stone-200/80 bg-stone-50">
                  <img
                    src={validPhotos[1]}
                    alt={`${review.name}'s temple experience photo 2`}
                    loading="lazy"
                    onError={() => handleImageError(1)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="relative h-full rounded-lg overflow-hidden border border-stone-200/80 bg-stone-50">
                  <img
                    src={validPhotos[2]}
                    alt={`${review.name}'s temple experience photo 3`}
                    loading="lazy"
                    onError={() => handleImageError(2)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {validPhotos.length > 3 && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-xs pointer-events-none">
                      +{validPhotos.length - 2}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Bottom: Temple / Visit info (aligned with mt-auto) */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <span className="text-xs text-amber-700 shrink-0" role="img" aria-label="Temple">🛕</span>
          <span className="truncate font-medium text-stone-700" title={templeDisplayName}>
            {templeDisplayName}
          </span>
        </div>
        <MoreHorizontal className="w-4 h-4 text-stone-300 shrink-0" />
      </div>
    </article>
  );
};

export interface EligibleBookingDetails {
  _id: string;
  bookingReference?: string;
  bookingDate: string;
  temple?: {
    _id?: string;
    name?: string;
    city?: string;
    state?: string;
    slug?: string;
    coverImage?: unknown;
  } | null;
  service?: {
    _id?: string;
    name?: string;
  } | null;
  timeSlot?: {
    _id?: string;
    startTime?: string;
    endTime?: string;
  } | null;
  hasReview?: boolean;
  existingReview?: {
    _id?: string;
    status?: string;
    rating?: number;
    comment?: string;
  } | null;
}

interface RawApiReview {
  _id?: string;
  id?: string;
  name?: string;
  userName?: string;
  date?: string;
  createdAt?: string;
  rating?: number | string;
  comment?: string;
  photos?: Array<string | { url?: string }>;
  templeName?: string;
  templeCity?: string;
  templeId?: {
    name?: string;
    city?: string;
  };
  isDemo?: boolean;
  status?: string;
  isOwnReview?: boolean;
}

interface ReviewsResponseData {
  reviews?: RawApiReview[];
  items?: RawApiReview[];
}

interface EligibleBookingsResponseData {
  eligibleBookings?: EligibleBookingDetails[];
}

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
  message?: string;
}

export const Experiences: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = Boolean(user);
  const isDevotee = user?.role === 'DEVOTEE';

  const [searchParams] = useSearchParams();
  const queryBookingId = searchParams.get('bookingId');

  // Sorting state: 'recent' | 'rating'
  const [sortOrder, setSortOrder] = useState<'recent' | 'rating'>('recent');

  // Form states for Share Your Experience
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputId = useId();

  // RTK Query: Public approved reviews from backend
  const {
    data: reviewsResponse,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
  } = useGetPublicReviewsQuery({ sort: sortOrder });

  // RTK Query: Devotee's eligible bookings (skipped if not authenticated devotee)
  const {
    data: eligibleBookingsRes,
    isLoading: isEligibleLoading,
  } = useGetEligibleBookingsQuery(undefined, {
    skip: !isAuthenticated || !isDevotee,
  });

  const [submitReviewMutation, { isLoading: isSubmitting }] = useSubmitReviewMutation();

  const reviewsData = reviewsResponse?.data as ReviewsResponseData | undefined;
  const realReviews: RawApiReview[] = reviewsData?.reviews || reviewsData?.items || [];

  const eligibleData = eligibleBookingsRes?.data as EligibleBookingsResponseData | undefined;
  const eligibleBookings: EligibleBookingDetails[] = eligibleData?.eligibleBookings || [];

  // Auto-select booking: prioritizes query param bookingId if eligible, else first unreviewed
  useEffect(() => {
    if (eligibleBookings.length > 0) {
      if (queryBookingId) {
        const found = eligibleBookings.find((b) => b._id === queryBookingId);
        if (found) {
          setSelectedBookingId(found._id);
          // Smooth scroll to the review panel
          setTimeout(() => {
            const el = document.getElementById('share-experience-panel');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
          return;
        }
      }
      if (!selectedBookingId) {
        const firstUnreviewed = eligibleBookings.find((b) => !b.hasReview);
        if (firstUnreviewed) {
          setSelectedBookingId(firstUnreviewed._id);
        } else {
          setSelectedBookingId(eligibleBookings[0]._id);
        }
      }
    }
  }, [eligibleBookings, queryBookingId, selectedBookingId]);

  // Combined and normalized list of reviews: Real approved reviews + 12 demo reviews
  const normalizedReviews: ReviewCardItem[] = useMemo(() => {
    const mappedReal: ReviewCardItem[] = realReviews.map((rev) => {
      const id = rev._id || rev.id || '';
      const name = rev.name || rev.userName || 'Devotee';
      const date =
        rev.date ||
        (rev.createdAt
          ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '');
      const numRating = Number(rev.rating) || 5;
      const commentStr = rev.comment || '';

      let photos: string[] = [];
      if (Array.isArray(rev.photos)) {
        photos = rev.photos
          .map((p) => (typeof p === 'string' ? p : p?.url))
          .filter((p): p is string => Boolean(p));
      }

      const templeName = rev.templeName || rev.templeId?.name || 'Sacred Temple';
      const templeCity = rev.templeCity || rev.templeId?.city || '';

      return {
        id,
        name,
        date,
        rating: numRating,
        comment: commentStr,
        photos,
        templeName,
        templeCity,
        isDemo: Boolean(rev.isDemo),
        status: rev.status,
        isOwnReview: Boolean(rev.isOwnReview),
      };
    });

    const mappedDemo: ReviewCardItem[] = DEMO_REVIEWS.map((rev) => ({
      id: rev.id,
      name: rev.name,
      date: rev.date,
      rating: rev.rating,
      comment: rev.comment,
      photos: rev.photos,
      templeName: rev.templeName,
      templeCity: rev.templeCity,
      isDemo: true,
      status: 'APPROVED',
      isOwnReview: false,
    }));

    const list: ReviewCardItem[] = [...mappedReal, ...mappedDemo];

    if (sortOrder === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [realReviews, sortOrder]);

  // Handle Photo File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 5) {
      setFormError('You can upload a maximum of 5 photos.');
      return;
    }

    setFormError(null);
    const newFiles = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(newFiles);

    // Create object URLs for preview
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews].slice(0, 5));
  };

  // Remove Photo from selection
  const removePhoto = (idx: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== idx);
    const updatedPreviews = previewUrls.filter((_, i) => i !== idx);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
    setFormError(null);
  };

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedBookingId) {
      setFormError('Please select which temple visit you are reviewing.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setFormError('Please select a star rating between 1 and 5.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 3) {
      setFormError('Please write a brief comment of at least 3 characters.');
      return;
    }

    if (comment.length > 500) {
      setFormError('Review comment cannot exceed 500 characters.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('bookingId', selectedBookingId);
      formData.append('rating', String(rating));
      formData.append('comment', comment.trim());
      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      await submitReviewMutation(formData).unwrap();

      setSubmitSuccess(true);
      setRating(0);
      setComment('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      console.error('[Experiences] Review submission failed:', err);
      const apiErr = err as ApiErrorResponse;
      const errMsg =
        apiErr?.data?.message || apiErr?.message || 'Failed to submit review. Please try again.';
      setFormError(errMsg);
    }
  };

  const selectedBookingDetails = eligibleBookings.find(
    (b) => b._id === selectedBookingId
  );

  const isQueryBookingInvalid =
    Boolean(queryBookingId) &&
    !isEligibleLoading &&
    !eligibleBookings.some((b) => b._id === queryBookingId);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. HERO BANNER: Calm, devotional, perfectly balanced hero */}
      <section
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#523B2A]/40 shadow-[0_12px_36px_rgba(20,12,6,0.15)] bg-[#120B06] min-h-[360px] sm:min-h-[350px] lg:min-h-[370px] max-h-[420px] flex items-center"
        aria-label="Devotees Share Divine Experiences"
      >
        {/* Background Image: Carefully positioned with diya visual emphasis on the right */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Devotees offering prayers with sacred deepam"
            className="w-full h-full object-cover object-[75%_center] filter brightness-[1.03] contrast-[1.02]"
          />
          {/* Subtle warm translucent overlay */}
          <div className="absolute inset-0 bg-amber-950/15 pointer-events-none mix-blend-multiply" />
          {/* Left-to-right dark warm gradient overlay ensuring 100% contrast for white/cream typography on the left 40-45% */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[68%] md:w-[58%] lg:w-[48%] bg-gradient-to-r from-[#0C0603]/95 via-[#0C0603]/75 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content: Clean, focused left text area */}
        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-12 py-8 sm:py-10 flex flex-col justify-center">
          <div className="max-w-[480px] sm:max-w-[530px] space-y-2.5">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sacred Community Blessings</span>
            </div>

            {/* Heading: Slightly smaller and cleaner */}
            <h1
              className="font-serif font-bold text-2xl sm:text-3xl lg:text-[2.15rem] text-white tracking-tight leading-[1.2] drop-shadow-sm"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Devotees Share
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#FBBF24] to-[#F59E0B]">
                Divine Experiences
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-sm font-medium text-amber-200/95 tracking-wide">
              Real stories · Real blessings · Real people
            </p>

            {/* Sacred ॐ Divider */}
            <div className="flex items-center gap-2 text-xs text-amber-400 py-0.5">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-amber-400/80" />
              <span className="font-bold text-sm">ॐ</span>
              <span className="w-12 h-px bg-gradient-to-r from-amber-400/80 to-transparent" />
            </div>

            {/* Description Text */}
            <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed font-normal drop-shadow-xs">
              Read authentic pilgrimage reflections shared by devotees who visited temples
              through DevaSetu. Share your own sacred journey and inspire fellow devotees.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA: Reviews Grid + Share Your Experience Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT SECTION (lg:col-span-8 or ~72%): Devotee Reviews Grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Row: Title & Sorting */}
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/80 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900 leading-tight">
                  Devotee Reviews
                </h2>
                <p className="text-xs text-stone-500">
                  Real experiences from our sacred community
                </p>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'recent' | 'rating')}
                className="appearance-none bg-white text-xs font-semibold text-stone-700 pl-3 pr-8 py-1.5 rounded-xl border border-stone-200 hover:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer shadow-2xs"
                aria-label="Sort reviews"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reviews Loading State */}
          {isReviewsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="h-64 bg-stone-100 rounded-2xl animate-pulse border border-stone-200"
                />
              ))}
            </div>
          )}

          {/* Reviews Error State */}
          {isReviewsError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Unable to load recent community reviews. Showing sample devotee experiences.</span>
            </div>
          )}

          {/* Reviews Grid: 3 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {normalizedReviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </div>

        {/* RIGHT SECTION (lg:col-span-4 or ~28%): Share Your Experience Panel */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div
            id="share-experience-panel"
            className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-2xs space-y-4 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/60 mt-0.5">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                  Share Your Experience
                </h3>
                <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                  Your visit deserves a memory. Share how your temple experience felt.
                </p>
              </div>
            </div>

            {/* Ineligible queryBookingId banner */}
            {isQueryBookingInvalid && (
              <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>This booking isn't eligible for a review yet.</span>
              </div>
            )}

            {/* Authenticated Check */}
            {!isAuthenticated ? (
              <div className="p-4 bg-[#FCF9F2] border border-amber-200/80 rounded-xl space-y-3 text-center">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Have you visited a temple through DevaSetu? Log in with your devotee account to share your sacred journey.
                </p>
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Log In to Share
                </Link>
              </div>
            ) : !isDevotee ? (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-500 text-center">
                Review submissions are reserved for devotee accounts.
              </div>
            ) : submitSuccess ? (
              /* Success State */
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 text-center animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  Thank you for sharing your experience 🙏
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your review has been submitted for approval.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-2 text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
                >
                  Share another review
                </button>
              </div>
            ) : isEligibleLoading ? (
              <div className="space-y-3">
                <div className="h-14 bg-stone-100 rounded-xl animate-pulse" />
                <div className="h-24 bg-stone-100 rounded-xl animate-pulse" />
              </div>
            ) : eligibleBookings.length === 0 ? (
              /* Empty state when devotee has no eligible bookings */
              <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-3 text-center">
                <p className="text-xs text-stone-700 font-medium leading-relaxed">
                  Your temple experiences will appear here after you complete a visit through DevaSetu.
                </p>
                <p className="text-[11px] text-stone-500">
                  Book a temple service and come back to share your experience.
                </p>
                <Link
                  to={ROUTES.TEMPLES}
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Explore Temples
                </Link>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                {/* 1. Multiple Bookings Selector (if > 1 eligible bookings) */}
                {eligibleBookings.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Choose your visit
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 pr-8 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer appearance-none truncate"
                        disabled={isSubmitting}
                      >
                        {eligibleBookings.map((b) => {
                          const dateStr = new Date(b.bookingDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          });
                          return (
                            <option key={b._id} value={b._id}>
                              {b.temple?.name || 'Temple'} · {b.service?.name || 'Darshan'} · {dateStr}
                              {b.hasReview ? ' (Reviewed)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* 2. Selected Visit Card */}
                {selectedBookingDetails && (
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Temple Visit
                      </span>
                      {selectedBookingDetails.bookingReference && (
                        <span className="font-mono text-[10px] text-stone-400">
                          {selectedBookingDetails.bookingReference}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5 font-medium text-stone-900">
                        <span className="text-amber-700 shrink-0">🛕</span>
                        <span className="font-semibold">{selectedBookingDetails.temple?.name || 'Temple'}</span>
                      </div>
                      <div className="text-[11px] text-stone-600 pl-4 space-y-0.5">
                        {selectedBookingDetails.service?.name && (
                          <p>Service: <span className="font-medium text-stone-800">{selectedBookingDetails.service.name}</span></p>
                        )}
                        <p>
                          Visit Date:{' '}
                          <span className="font-medium text-stone-800">
                            {new Date(selectedBookingDetails.bookingDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    {selectedBookingDetails.hasReview && (
                      <div className="pt-2 border-t border-amber-200/60 space-y-2">
                        <div className="text-amber-900 font-medium text-[11px] flex items-center justify-between gap-1.5">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Review Submitted</span>
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            selectedBookingDetails.existingReview?.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {selectedBookingDetails.existingReview?.status === 'APPROVED' ? 'Approved' : 'Pending Moderation'}
                          </span>
                        </div>
                        {selectedBookingDetails.existingReview && (
                          <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] space-y-1">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= (selectedBookingDetails.existingReview?.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {selectedBookingDetails.existingReview.comment && (
                              <p className="text-stone-700 italic">
                                "{selectedBookingDetails.existingReview.comment}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* If already reviewed, do not show form inputs */}
                {selectedBookingDetails?.hasReview ? (
                  <div className="pt-1 text-center">
                    <p className="text-[11px] text-stone-500 italic">
                      Thank you for contributing to the community blessings. 🙏
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 3. Interactive Star Rating */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Rating
                      </span>
                      <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
                        {[1, 2, 3, 4, 5].map((starIdx) => (
                          <button
                            key={starIdx}
                            type="button"
                            onClick={() => setRating(starIdx)}
                            onMouseEnter={() => setHoverRating(starIdx)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-stone-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
                            aria-label={`${starIdx} Star`}
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                starIdx <= (hoverRating || rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                        {rating > 0 && (
                          <span className="text-xs font-semibold text-amber-800 ml-1">
                            {rating} / 5
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4. Experience Textarea */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Your Experience
                      </label>
                      <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, 500))}
                        placeholder="Share how your temple experience felt..."
                        disabled={isSubmitting}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none leading-relaxed"
                      />
                      <div className="text-right text-[10px] text-stone-400 font-mono">
                        {comment.length}/500
                      </div>
                    </div>

                    {/* 5. Photo Upload with Previews */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor={fileInputId} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Upload Photos (Optional)
                        </label>
                        <span className="text-[10px] text-stone-400">
                          {selectedFiles.length}/5
                        </span>
                      </div>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        id={fileInputId}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isSubmitting || selectedFiles.length >= 5}
                      />

                      {/* Upload Trigger Button */}
                      {selectedFiles.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                          className="w-full py-2.5 px-3 border border-dashed border-stone-300 hover:border-amber-400 rounded-xl bg-stone-50/60 hover:bg-amber-50/30 text-stone-600 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-amber-700" />
                          <span>Click to upload images</span>
                        </button>
                      )}

                      {/* Image Preview Strip */}
                      {previewUrls.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                          {previewUrls.map((url, pIdx) => (
                            <div key={pIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-stone-200 shrink-0 group">
                              <img
                                src={url}
                                alt={`Preview ${pIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(pIdx)}
                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-stone-900/70 text-white rounded-full flex items-center justify-center hover:bg-stone-900 transition-colors cursor-pointer"
                                title="Remove photo"
                                aria-label="Remove photo"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Error Banner */}
                    {formError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* 6. Submit Button */}
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !selectedBookingId ||
                        rating === 0 ||
                        !comment.trim()
                      }
                      className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting review...</span>
                        </>
                      ) : (
                        <span>Submit Review</span>
                      )}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Bottom Devotional Note */}
            <div className="pt-2 text-center border-t border-stone-100">
              <p className="text-[11px] text-stone-500 italic">
                Your words can inspire another devotee's journey. 🙏
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Experiences;
