import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  X,
  Heart,
  LayoutGrid,
  Map,
  Compass,
} from 'lucide-react';
import {
  useGetTemplesQuery,
  useGetSavedTemplesQuery,
  useSaveTempleMutation,
  useUnsaveTempleMutation,
} from '../../store/api/devoteeApi.js';
import { useGetCategoriesQuery, type CategoryWithCount } from '../../store/api/categoryApi.js';
import { useAppSelector } from '../../store/hooks.js';
import { ROUTES } from '../../constants/routes.js';
import templeDirectoryHero from '../../assets/temples/temple-directory-hero.jpg';
import TemplePilgrimageMap from '../../components/temples/TemplePilgrimageMap.js';
import type { Temple } from '@shared/types/index.js';

interface PopularPill {
  id: string;
  label: string;
  icon: string | null;
}

const POPULAR_PILLS: PopularPill[] = [
  { id: 'All', label: 'All', icon: null },
  { id: 'Shiva', label: 'Shiva', icon: '🔱' },
  { id: 'Vishnu', label: 'Vishnu', icon: '🪷' },
  { id: 'Devi', label: 'Devi', icon: '🪔' },
  { id: 'Murugan', label: 'Murugan', icon: '🦚' },
  { id: 'Ganesh', label: 'Ganesh', icon: '🐘' },
  { id: 'Ayyappa', label: 'Ayyappa', icon: '🧘' },
];

export interface TempleFilterState {
  search: string;
  city: string;
  state: string;
  templeType: string;
  category: string;
  serviceType: string;
  sort: string;
  page: number;
  limit: number;
}

interface CustomGalleryItem {
  url?: string;
  isThumbnail?: boolean;
  isBanner?: boolean;
}

interface CustomTimingItem {
  morningOpening?: string;
  morningClosing?: string;
  eveningOpening?: string;
  eveningClosing?: string;
  specialNotes?: string;
}

interface PopulatedCategoryRef {
  _id?: string;
  name?: string;
  slug?: string;
}

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
  message?: string;
}

export const Temples: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth?.user);
  const isAuthenticated = Boolean(user);
  const isDevotee = user?.role === 'DEVOTEE';

  const initialSearch = searchParams.get('search') || '';
  const initialCity = searchParams.get('city') || '';
  const initialState = searchParams.get('state') || '';
  const initialType = searchParams.get('templeType') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialServiceType = searchParams.get('serviceType') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [hoveredTempleId, setHoveredTempleId] = useState<string | null>(null);

  const [filters, setFilters] = useState<TempleFilterState>({
    search: initialSearch,
    city: initialCity,
    state: initialState,
    templeType: initialType,
    category: initialCategory,
    serviceType: initialServiceType,
    sort: initialSort,
    page: initialPage,
    limit: 9,
  });

  useEffect(() => {
    const s = searchParams.get('search') || '';
    const c = searchParams.get('city') || '';
    const cat = searchParams.get('category') || '';
    const srv = searchParams.get('serviceType') || '';
    setSearchInput(s);
    setFilters((prev) => ({
      ...prev,
      search: s,
      city: c,
      category: cat,
      serviceType: srv,
      page: parseInt(searchParams.get('page') || '1', 10) || 1,
    }));
  }, [searchParams]);

  const { data: categoriesRes } = useGetCategoriesQuery();
  const availableCategories: CategoryWithCount[] = categoriesRes?.data || [];

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTemplesQuery(filters);

  // Authenticated devotee saved temples sync
  const { data: savedRes } = useGetSavedTemplesQuery(undefined, {
    skip: !isAuthenticated || !isDevotee,
  });

  const savedIds = useMemo(() => {
    const items = savedRes?.data?.items || [];
    return new Set(items.map((t) => t._id));
  }, [savedRes]);

  const [saveTempleMutation] = useSaveTempleMutation();
  const [unsaveTempleMutation] = useUnsaveTempleMutation();

  const temples: Temple[] = response?.data?.items || [];
  const pagination = response?.data?.pagination || { page: 1, limit: 9, total: 0, totalPages: 1 };

  const updateUrlParams = (currentFilters: TempleFilterState) => {
    const params: Record<string, string> = {};
    if (currentFilters.search) params.search = currentFilters.search;
    if (currentFilters.city) params.city = currentFilters.city;
    if (currentFilters.state) params.state = currentFilters.state;
    if (currentFilters.templeType) params.templeType = currentFilters.templeType;
    if (currentFilters.category) params.category = currentFilters.category;
    if (currentFilters.serviceType) params.serviceType = currentFilters.serviceType;
    if (currentFilters.sort && currentFilters.sort !== 'newest') params.sort = currentFilters.sort;
    if (currentFilters.page > 1) params.page = String(currentFilters.page);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchInput.trim(), page: 1 };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handleFilterChange = (key: keyof TempleFilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handlePopularPillClick = (pillId: string) => {
    if (pillId === 'All') {
      const newFilters = { ...filters, search: '', category: '', page: 1 };
      setSearchInput('');
      setFilters(newFilters);
      updateUrlParams(newFilters);
      return;
    }

    // Try finding matching backend category slug first
    const matchedCategory = availableCategories.find(
      (c) => c.name?.toLowerCase().includes(pillId.toLowerCase()) || c.slug?.toLowerCase().includes(pillId.toLowerCase())
    );

    if (matchedCategory) {
      handleFilterChange('category', matchedCategory.slug);
    } else {
      setSearchInput(pillId);
      handleFilterChange('search', pillId);
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    const resetFilters: TempleFilterState = {
      search: '',
      city: '',
      state: '',
      templeType: '',
      category: '',
      serviceType: '',
      sort: 'newest',
      page: 1,
      limit: 9,
    };
    setFilters(resetFilters);
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    updateUrlParams(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>, templeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!isDevotee || !templeId) return;

    try {
      if (savedIds.has(templeId)) {
        await unsaveTempleMutation(templeId).unwrap();
      } else {
        await saveTempleMutation(templeId).unwrap();
      }
    } catch (err: unknown) {
      console.error('Failed to toggle save temple:', err);
    }
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.city ||
      filters.state ||
      filters.templeType ||
      filters.category ||
      filters.serviceType ||
      (filters.sort && filters.sort !== 'newest')
  );

  const activeCategoryName = availableCategories.find(
    (c) => c.slug === filters.category || c._id === filters.category
  )?.name;

  // Helpers to safely extract images, timings, and badges from existing data
  const getTempleImage = (temple: Temple): string | null => {
    if (!temple) return null;
    const gallery = temple.gallery as unknown as CustomGalleryItem[] | undefined;
    // 1. Check thumbnail image in gallery
    const thumbnail = gallery?.find((img) => img.isThumbnail && img.url)?.url;
    if (thumbnail && typeof thumbnail === 'string' && thumbnail.trim()) return thumbnail.trim();

    // 2. Check coverImage url
    const cover = temple.coverImage as unknown as { url?: string } | string | undefined;
    if (cover && typeof cover === 'object' && typeof cover.url === 'string' && cover.url.trim()) {
      return cover.url.trim();
    }
    if (typeof cover === 'string' && cover.trim()) {
      return cover.trim();
    }

    // 3. Check banner in gallery
    const banner = gallery?.find((img) => img.isBanner && img.url)?.url;
    if (banner && typeof banner === 'string' && banner.trim()) return banner.trim();

    // 4. Check first gallery image url
    const first = gallery?.[0]?.url || (typeof gallery?.[0] === 'string' ? (gallery[0] as string) : null);
    if (first && typeof first === 'string' && first.trim()) return first.trim();

    return null;
  };

  const getTempleTimings = (temple: Temple) => {
    const rawTimings = temple.timings as unknown as CustomTimingItem[] | { specialNotes?: string } | undefined;
    if (Array.isArray(rawTimings) && rawTimings.length > 0) {
      const today = rawTimings[0];
      const morning =
        today.morningOpening && today.morningClosing
          ? `${today.morningOpening} – ${today.morningClosing}`
          : '06:00 AM – 12:30 PM';
      const evening =
        today.eveningOpening && today.eveningClosing
          ? `${today.eveningOpening} – ${today.eveningClosing}`
          : '04:00 PM – 09:00 PM';
      return {
        compact: `${morning}`,
        morning,
        evening,
        special: today.specialNotes || 'Open daily for sacred darshan',
      };
    }
    return {
      compact: (rawTimings as { specialNotes?: string })?.specialNotes || '06:00 AM – 09:00 PM',
      morning: '05:30 AM – 12:30 PM',
      evening: '04:00 PM – 09:00 PM',
      special: 'Open daily for sacred darshan',
    };
  };

  const getTempleBadge = (temple: Temple): string => {
    if (temple.templeType) return temple.templeType.toUpperCase();
    const cats = temple.categories as unknown as Array<PopulatedCategoryRef | string> | undefined;
    if (cats?.[0]) {
      const firstCat = cats[0];
      const name = typeof firstCat === 'string' ? firstCat : firstCat.name;
      if (name) return name.toUpperCase();
    }
    return 'SACRED KSHETRA';
  };

  const getTempleTags = (temple: Temple): string[] => {
    const tags: string[] = [];
    if (temple.templeType) tags.push(temple.templeType);
    const cats = temple.categories as unknown as Array<PopulatedCategoryRef | string> | undefined;
    if (Array.isArray(cats)) {
      cats.forEach((c) => {
        const name = typeof c === 'string' ? c : c?.name;
        if (name && !tags.includes(name)) tags.push(name);
      });
    }
    if (tags.length === 0) tags.push('Heritage', 'Spiritual');
    return tags.slice(0, 3);
  };

  const queryErr = error as ApiErrorResponse | undefined;

  return (
    <div className="space-y-8 pb-12">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. SACRED PILGRIMAGE DIRECTORY HERO                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[260px] sm:h-[300px] lg:h-[330px] rounded-3xl overflow-hidden shadow-xl border border-amber-900/20 flex items-center">
        {/* High-Quality Golden Hour Temple Heritage Background Image */}
        <img
          src={templeDirectoryHero}
          alt="Sacred Indian Temple Landscape at Sunrise"
          className="absolute inset-0 w-full h-full object-cover object-[center_60%] select-none"
          loading="eager"
        />

        {/* Soft elegant scrim gradient for text readability while keeping temple radiant */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 via-48% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/30 via-transparent to-black/15 pointer-events-none" />

        {/* Content Overlay */}
        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-12 py-6 flex items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            {/* Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 backdrop-blur-md text-[11px] font-bold tracking-wider text-amber-200 uppercase border border-amber-400/40 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SACRED PILGRIMAGE DIRECTORY</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[44px] font-serif font-bold text-white tracking-tight drop-shadow-md leading-tight">
              Explore Divine Destinations
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-amber-100/95 font-medium tracking-wide drop-shadow-xs">
              Temples. Traditions. Timeless Blessings.
            </p>
          </div>

          {/* Right Serene Quote Card */}
          <div className="hidden md:flex flex-col items-end justify-center text-right shrink-0 select-none pl-4">
            <div className="bg-stone-950/35 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 shadow-lg">
              <p className="font-serif italic text-xs sm:text-sm text-amber-100/90 leading-snug drop-shadow-sm max-w-[220px]">
                “In every temple lies a story of faith.”
              </p>
              <span className="font-serif text-2xl text-amber-300/95 font-bold block mt-0.5 drop-shadow-sm">
                ॐ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. SEARCH & DYNAMIC FILTER TOOLBAR                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Row 1: Search Bar with Large Amber Button */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by temple name, city, kshetra, or heritage type..."
              className="w-full pl-12 pr-28 py-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#B45309] hover:bg-[#92400E] active:bg-[#78350F] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Row 2: 4-Column Dropdowns / Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* City / Kshetra */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                City / Kshetra
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="e.g. Varanasi, Tirupati"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                placeholder="e.g. Tamil Nadu"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600"
              />
            </div>

            {/* Temple Type */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Temple Type
              </label>
              <select
                value={filters.templeType}
                onChange={(e) => handleFilterChange('templeType', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="Heritage">Heritage</option>
                <option value="Traditional">Traditional</option>
                <option value="Pilgrimage Center">Pilgrimage Center</option>
                <option value="Cave Temple">Cave Temple</option>
              </select>
            </div>

            {/* Deity / Category */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Deity / Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="">All Deities / Categories</option>
                {availableCategories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name} {c.templeCount !== undefined ? `(${c.templeCount})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Popular Filter Pills & Sort By */}
          <div className="pt-2 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Popular Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-stone-500 mr-1">Popular:</span>
              {POPULAR_PILLS.map((pill) => {
                const isSelected =
                  pill.id === 'All'
                    ? !filters.category && !filters.search
                    : filters.category?.toLowerCase() === pill.id.toLowerCase() ||
                      filters.search?.toLowerCase() === pill.id.toLowerCase();

                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handlePopularPillClick(pill.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#B45309] text-white shadow-xs'
                        : 'bg-stone-50 border border-stone-200/80 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    {pill.icon && <span className="text-[11px]">{pill.icon}</span>}
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <span className="text-xs text-stone-400 font-medium">Sort By</span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="newest">Newest Listed</option>
                <option value="name_asc">Temple Name (A – Z)</option>
                <option value="name_desc">Temple Name (Z – A)</option>
                <option value="oldest">Oldest Listed</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
              <span className="text-stone-400 font-medium text-[11px]">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium border border-amber-200">
                  Search: "{filters.search}"
                  <button
                    type="button"
                    onClick={() => handleFilterChange('search', '')}
                    className="hover:text-amber-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.city && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium border border-amber-200">
                  City: {filters.city}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('city', '')}
                    className="hover:text-amber-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.state && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium border border-amber-200">
                  State: {filters.state}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('state', '')}
                    className="hover:text-amber-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.templeType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium border border-amber-200">
                  Type: {filters.templeType}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('templeType', '')}
                    className="hover:text-amber-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium border border-amber-200">
                  Category: {activeCategoryName || filters.category}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('category', '')}
                    className="hover:text-amber-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.serviceType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium border border-amber-200">
                  Service: {filters.serviceType === 'DARSHAN' ? 'Darshan' : filters.serviceType === 'POOJA,SEVA' ? 'Pooja & Seva' : filters.serviceType}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('serviceType', '')}
                    className="hover:text-amber-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-amber-700 hover:text-amber-900 underline ml-2 font-semibold text-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </form>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. RESULTS BAR & VIEW MODE TOGGLE                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Showing <span className="font-bold text-stone-900">{temples.length}</span> of{' '}
          <span className="font-bold text-stone-900">{pagination.total}</span> active shrines
        </p>

        <div className="flex items-center gap-2">
          {isFetching && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 mr-2">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Updating...</span>
            </div>
          )}

          {/* Grid / Map Toggle Buttons */}
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#B45309] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#B45309] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. LOADING & ERROR STATES                                  */}
      {/* ────────────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-48 bg-stone-100 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-stone-100 rounded w-2/3" />
                <div className="h-3 bg-stone-100 rounded w-full" />
                <div className="h-3 bg-stone-100 rounded w-4/5" />
              </div>
              <div className="h-9 bg-stone-100 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="bg-white p-10 text-center max-w-md mx-auto rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-800">
              Unable to load temples
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {queryErr?.data?.message ||
                'Unable to connect to the sacred directory. Please check your connection and try again.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && temples.length === 0 && (
        <div className="bg-white p-12 text-center max-w-md mx-auto rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-800">
              {filters.serviceType === 'DARSHAN'
                ? 'No Darshan services are currently available.'
                : filters.serviceType === 'POOJA,SEVA' || filters.serviceType === 'POOJA' || filters.serviceType === 'SEVA'
                ? 'No Pooja or Seva services are currently available.'
                : filters.search
                ? 'No temples match your search'
                : hasActiveFilters
                ? 'No temples found for selected filters'
                : 'No active temples onboarded yet'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search keywords or resetting filters to browse all divine destinations.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold rounded-xl inline-block cursor-pointer shadow-xs"
            >
              Show All Active Temples
            </button>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. INTERACTIVE CSS GRID REFLOW (GRID VIEW)                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && temples.length > 0 && viewMode === 'grid' && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [grid-auto-flow:dense] transition-all duration-300"
          onMouseLeave={() => setHoveredTempleId(null)}
        >
          {temples.map((temple) => {
            const isExpanded = hoveredTempleId === temple._id;
            const isFav = savedIds.has(temple._id);
            const timings = getTempleTimings(temple);
            const badge = getTempleBadge(temple);
            const tags = getTempleTags(temple);
            const templeImage = getTempleImage(temple);

            return (
              <div
                key={temple._id}
                onMouseEnter={() => setHoveredTempleId(temple._id)}
                onFocus={() => setHoveredTempleId(temple._id)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setHoveredTempleId(null);
                  }
                }}
                tabIndex={0}
                className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 outline-none flex flex-col justify-between ${
                  isExpanded
                    ? 'lg:col-span-2 md:col-span-2 shadow-xl ring-2 ring-[#B45309]/20 border-amber-300/80 z-10'
                    : 'col-span-1 shadow-sm hover:shadow-md border-stone-200/80'
                }`}
              >
                {/* ────────────────────────────────────────────── */}
                {/* NORMAL CARD VIEW (When NOT expanded)           */}
                {/* ────────────────────────────────────────────── */}
                {!isExpanded ? (
                  <div className="flex flex-col h-full justify-between">
                    {/* Top Image Container */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-100">
                      {templeImage ? (
                        <img
                          src={templeImage}
                          alt={temple.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
                          <Building2 className="w-12 h-12 mb-1" />
                          <span className="text-[11px] font-semibold">Sacred Kshetra</span>
                        </div>
                      )}

                      {/* Category Badge Overlay */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-[#B45309] text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-xs border border-white/60 flex items-center gap-1">
                        <span className="text-[11px]">🛕</span>
                        <span>{badge}</span>
                      </div>

                      {/* Favorite Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, temple._id)}
                        aria-label="Save to favorites"
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isFav ? 'fill-rose-600 text-rose-600' : 'text-stone-600'
                          }`}
                        />
                      </button>

                      {/* Subtle Bottom Gradient */}
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
                      <div>
                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium mb-1">
                          <MapPin className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                          <span className="truncate">
                            {temple.city}, {temple.state}
                          </span>
                        </div>

                        {/* Temple Name */}
                        <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 line-clamp-1 leading-snug">
                          {temple.name}
                        </h3>

                        {/* Short Description */}
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mt-1.5">
                          {temple.description}
                        </p>
                      </div>

                      {/* Timings & View Link */}
                      <div className="pt-3 border-t border-stone-100 space-y-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                          <Clock className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                          <span className="truncate">{timings.compact}</span>
                        </div>

                        <Link
                          to={`/temples/${temple.slug || temple._id}`}
                          className="w-full py-2.5 px-4 bg-stone-50 hover:bg-[#B45309] text-stone-700 hover:text-white border border-stone-200/80 hover:border-[#B45309] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200"
                        >
                          <span>View Temple Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ────────────────────────────────────────────── */
                  /* HOVER EXPANDED CARD VIEW (2-Column Horizontal) */
                  /* ────────────────────────────────────────────── */
                  <div className="grid grid-cols-1 sm:grid-cols-12 h-full">
                    {/* Left Column: Full-Height Image (~42% width) */}
                    <div className="sm:col-span-5 relative overflow-hidden bg-stone-100 min-h-[260px] sm:min-h-[340px]">
                      {templeImage ? (
                        <img
                          src={templeImage}
                          alt={temple.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
                          <Building2 className="w-14 h-14 mb-1" />
                          <span className="text-xs font-semibold">Sacred Kshetra</span>
                        </div>
                      )}

                      {/* Favorite Button on Image */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, temple._id)}
                        aria-label="Save to favorites"
                        className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-rose-600 transition-colors shadow-sm cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isFav ? 'fill-rose-600 text-rose-600' : 'text-stone-600'
                          }`}
                        />
                      </button>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Right Column: Rich Information & Action Button (~58% width) */}
                    <div className="sm:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4 bg-white">
                      <div className="space-y-2.5">
                        {/* Top: Category Badge */}
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#B45309] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-200/80">
                            <span className="text-[11px]">🛕</span>
                            <span>{badge}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Active Darshan</span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium">
                          <MapPin className="w-4 h-4 text-[#B45309] shrink-0" />
                          <span>
                            {temple.city}, {temple.state}
                          </span>
                        </div>

                        {/* Full Temple Name */}
                        <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 leading-tight">
                          {temple.name}
                        </h2>

                        {/* Expanded Narrative Description */}
                        <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed line-clamp-4">
                          {temple.description}
                        </p>

                        {/* Detailed Darshan Timings */}
                        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-1 text-xs">
                          <div className="flex items-center gap-2 font-semibold text-stone-800">
                            <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                            <span>Darshan Timings</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1">
                            <div>
                              <span className="text-stone-400 block text-[10px]">Morning</span>
                              <span className="font-medium text-stone-700">{timings.morning}</span>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[10px]">Evening</span>
                              <span className="font-medium text-stone-700">{timings.evening}</span>
                            </div>
                          </div>
                        </div>

                        {/* Category Tags Pills */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Link
                        to={`/temples/${temple.slug || temple._id}`}
                        className="w-full py-3 px-5 bg-[#B45309] hover:bg-[#92400E] active:bg-[#78350F] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>View Temple Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. MAP VIEW MODE (When devotee toggles to Map View)        */}
      {/* ────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && temples.length > 0 && viewMode === 'map' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#B45309]" />
                <span>Geographic Pilgrimage Map</span>
              </h3>
              <p className="text-xs text-stone-500">
                Explore holy kshetras by geography across India. Select any temple card to open details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className="text-xs text-[#B45309] hover:underline font-semibold cursor-pointer self-start sm:self-auto"
            >
              ← Back to Grid View
            </button>
          </div>

          <TemplePilgrimageMap
            temples={temples}
            getTempleImage={getTempleImage}
            getTempleBadge={getTempleBadge}
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7. PAGINATION CONTROLS                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stone-200 pt-6 mt-8">
          <button
            type="button"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-stone-400 font-medium">Page</span>
            <span className="font-bold text-[#B45309]">{pagination.page}</span>
            <span className="text-stone-400 font-medium">of</span>
            <span className="font-bold text-stone-800">{pagination.totalPages}</span>
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Temples;
