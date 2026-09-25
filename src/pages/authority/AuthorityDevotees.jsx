import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Search,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Users,
  Award,
  Clock,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  List,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useGetAuthorityDevoteesQuery } from '../../store/api/authorityApi.js';

export const AuthorityDevotees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'bookings' | 'name'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const { data: devoteesRes, isLoading, isError, error, refetch } = useGetAuthorityDevoteesQuery();

  const devotees = devoteesRes?.data?.devotees || [];

  // Metrics
  const metrics = useMemo(() => {
    const total = devotees.length;
    const frequent = devotees.filter((d) => (d.totalBookings || 1) > 1).length;
    const totalVisits = devotees.reduce((sum, d) => sum + (d.totalBookings || 1), 0);
    return { total, frequent, totalVisits };
  }, [devotees]);

  // Filtered & Sorted list
  const filteredDevotees = useMemo(() => {
    let result = devotees.filter((d) => {
      const q = searchTerm.toLowerCase();
      return (
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.phone && d.phone.includes(q))
      );
    });

    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.lastBookingDate || 0) - new Date(a.lastBookingDate || 0));
    } else if (sortBy === 'bookings') {
      result.sort((a, b) => (b.totalBookings || 1) - (a.totalBookings || 1));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [devotees, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-spiritual-border border-t-spiritual-primary"></div>
        <p className="text-xs text-spiritual-muted animate-pulse">Loading temple devotee community...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-spiritual-borderLight">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-spiritual-primaryLight/80 text-spiritual-primary flex items-center justify-center border border-spiritual-primaryRing/40">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text">
              Devotee Community Directory
            </h1>
          </div>
          <p className="text-xs text-spiritual-muted mt-1 max-w-2xl">
            Directory of pilgrims and families who have visited or booked sevas at your temple. Verified through official reservation records.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-spiritual-surface p-0.5 rounded-lg border border-spiritual-border shrink-0 self-start sm:self-center">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-white text-spiritual-primary shadow-spiritual-xs font-semibold'
                : 'text-spiritual-muted hover:text-spiritual-text'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white text-spiritual-primary shadow-spiritual-xs font-semibold'
                : 'text-spiritual-muted hover:text-spiritual-text'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isError && (
        <div className="spiritual-card p-4 border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error?.data?.message || 'Failed to load devotees directory.'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-bold text-rose-700 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="spiritual-card p-4 hover:border-spiritual-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-spiritual-muted uppercase tracking-wider">
              Total Devotees
            </span>
            <span className="p-1.5 rounded-md bg-stone-100 text-stone-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-spiritual-text">{metrics.total}</span>
            <span className="text-[10px] text-spiritual-muted">unique pilgrims</span>
          </div>
        </div>

        <div className="spiritual-card p-4 hover:border-amber-400 transition-all bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-900 uppercase tracking-wider">
              Frequent Pilgrims
            </span>
            <span className="p-1.5 rounded-md bg-amber-100 text-amber-800">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-amber-800">{metrics.frequent}</span>
            <span className="text-[10px] text-amber-700 font-medium">multiple visits</span>
          </div>
        </div>

        <div className="spiritual-card p-4 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">
              Total Visits Hosted
            </span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <HeartHandshake className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-emerald-700">{metrics.totalVisits}</span>
            <span className="text-[10px] text-emerald-600 font-medium">darshan & sevas</span>
          </div>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="spiritual-card p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-muted" />
          <input
            type="text"
            placeholder="Search devotees by name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:border-spiritual-primary transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
          <div className="flex items-center gap-1.5 text-xs text-spiritual-muted">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:border-spiritual-primary text-spiritual-text cursor-pointer"
          >
            <option value="recent">Most Recent Visit</option>
            <option value="bookings">Highest Bookings</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-spiritual-primary hover:underline font-medium shrink-0 ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Directory Content */}
      {filteredDevotees.length === 0 ? (
        <div className="spiritual-card p-12 text-center bg-white border border-spiritual-border rounded-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-spiritual-surface flex items-center justify-center text-spiritual-primary mb-3 border border-spiritual-borderLight">
            <HeartHandshake className="w-6 h-6 text-spiritual-primary/60" />
          </div>
          <h3 className="font-serif font-bold text-base text-spiritual-text">No devotees found</h3>
          <p className="text-xs text-spiritual-muted max-w-sm mx-auto mt-1 mb-4">
            {searchTerm
              ? 'No devotee records match your query. Try a different search keyword.'
              : 'Devotees will be listed here once they create reservations or attend darshan sevas at your temple.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-spiritual-surface hover:bg-spiritual-surface/80 border border-spiritual-border text-spiritual-text text-xs font-medium rounded-lg transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevotees.map((dev, idx) => {
            const isFrequent = (dev.totalBookings || 1) > 1;
            return (
              <div
                key={dev.id || idx}
                className="spiritual-card p-5 bg-white border border-spiritual-border hover:border-spiritual-primary/50 transition-all hover:shadow-spiritual-md flex flex-col justify-between"
              >
                <div>
                  {/* Top Avatar & Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 text-amber-900 font-serif font-bold text-base flex items-center justify-center shrink-0 border border-amber-300 shadow-spiritual-xs">
                        {dev.name ? dev.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-spiritual-text truncate">
                          {dev.name || 'Anonymous Devotee'}
                        </h4>
                        {isFrequent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-0.5">
                            <Award className="w-3 h-3 text-amber-600" />
                            Frequent Pilgrim
                          </span>
                        ) : (
                          <span className="text-[11px] text-spiritual-muted">Registered Pilgrim</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Chips */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    {dev.email && (
                      <a
                        href={`mailto:${dev.email}`}
                        className="flex items-center gap-2 text-spiritual-muted hover:text-spiritual-primary group transition-colors truncate"
                      >
                        <Mail className="w-3.5 h-3.5 text-stone-400 group-hover:text-spiritual-primary shrink-0" />
                        <span className="truncate">{dev.email}</span>
                      </a>
                    )}

                    {dev.phone && (
                      <a
                        href={`tel:${dev.phone}`}
                        className="flex items-center gap-2 text-spiritual-muted hover:text-spiritual-primary group transition-colors truncate"
                      >
                        <Phone className="w-3.5 h-3.5 text-stone-400 group-hover:text-spiritual-primary shrink-0" />
                        <span>{dev.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Footer: Bookings & Last Visit */}
                <div className="mt-4 pt-3 border-t border-spiritual-borderLight flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-spiritual-muted block uppercase">Reservations</span>
                    <span className="font-bold text-spiritual-text font-mono text-sm">
                      {dev.totalBookings || 1} {dev.totalBookings > 1 ? 'Sevas' : 'Seva'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-spiritual-muted block uppercase">Last Darshan</span>
                    <span className="text-[11px] font-medium text-spiritual-text flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-spiritual-primary" />
                      {dev.lastBookingDate ? new Date(dev.lastBookingDate).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="spiritual-card overflow-hidden border border-spiritual-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-spiritual-surface/80 border-b border-spiritual-border text-spiritual-muted font-semibold">
                  <th className="py-3 px-4">Devotee Pilgrim</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4 text-center">Visits / Bookings</th>
                  <th className="py-3 px-4">Last Visit Date</th>
                  <th className="py-3 px-4">Pilgrim Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-spiritual-border/60">
                {filteredDevotees.map((dev, idx) => {
                  const isFrequent = (dev.totalBookings || 1) > 1;
                  return (
                    <tr key={dev.id || idx} className="hover:bg-spiritual-surface/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300">
                            {dev.name ? dev.name.charAt(0).toUpperCase() : 'D'}
                          </div>
                          <div>
                            <span className="font-bold text-spiritual-text block">{dev.name || 'Devotee'}</span>
                            <span className="text-[10px] text-spiritual-muted">Verified Pilgrim</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          {dev.email && (
                            <div className="flex items-center gap-1.5 text-spiritual-muted">
                              <Mail className="w-3 h-3 text-stone-400" />
                              <span>{dev.email}</span>
                            </div>
                          )}
                          {dev.phone && (
                            <div className="flex items-center gap-1.5 text-spiritual-muted">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{dev.phone}</span>
                            </div>
                          )}
                          {!dev.email && !dev.phone && <span className="text-spiritual-muted">—</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-spiritual-surface text-spiritual-text border border-spiritual-border">
                          {dev.totalBookings || 1}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-spiritual-muted">
                        {dev.lastBookingDate ? (
                          <div className="flex items-center gap-1 font-medium text-spiritual-text">
                            <Calendar className="w-3.5 h-3.5 text-spiritual-primary" />
                            <span>{new Date(dev.lastBookingDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isFrequent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Award className="w-3 h-3 text-amber-600" />
                            Frequent Pilgrim
                          </span>
                        ) : (
                          <span className="text-[11px] text-spiritual-muted">First-Time Pilgrim</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDevotees;
