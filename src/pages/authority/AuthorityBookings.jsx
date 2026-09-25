import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  IndianRupee,
  Calendar,
  AlertCircle,
  User,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  Copy,
  Check,
  Eye,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Ticket,
  Receipt,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useGetAuthorityBookingsQuery } from '../../store/api/authorityApi.js';

export const AuthorityBookings = () => {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [copiedRef, setCopiedRef] = useState(null);

  const { data: bookingsRes, isLoading, isError, error, refetch } = useGetAuthorityBookingsQuery({
    status: filterStatus || undefined,
    date: filterDate || undefined,
  });

  const rawBookings = bookingsRes?.data?.bookings || [];

  // Filter client-side by search query (devotee name, email, phone, bookingRef, service name)
  const bookings = useMemo(() => {
    if (!searchTerm.trim()) return rawBookings;
    const q = searchTerm.toLowerCase().trim();
    return rawBookings.filter((b) => {
      const ref = (b.bookingReference || b._id || '').toLowerCase();
      const devoteeName = (b.userId?.name || b.devoteeDetails?.primaryDevotee?.fullName || '').toLowerCase();
      const email = (b.userId?.email || b.devoteeDetails?.primaryDevotee?.email || '').toLowerCase();
      const phone = (b.userId?.phone || b.devoteeDetails?.primaryDevotee?.phone || '').toLowerCase();
      const service = (b.serviceId?.name || '').toLowerCase();
      return (
        ref.includes(q) ||
        devoteeName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        service.includes(q)
      );
    });
  }, [rawBookings, searchTerm]);

  // Compute live KPIs
  const stats = useMemo(() => {
    const total = rawBookings.length;
    const confirmed = rawBookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;
    const completed = rawBookings.filter((b) => b.bookingStatus === 'COMPLETED').length;
    const totalDakshina = rawBookings.reduce((sum, b) => {
      if (b.paymentStatus === 'PAID' || b.paymentStatus === 'COMPLETED') {
        return sum + (b.totalAmount || 0);
      }
      return sum;
    }, 0);

    return { total, confirmed, completed, totalDakshina };
  }, [rawBookings]);

  const handleCopyRef = (ref, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            CONFIRMED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            CANCELLED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock3 className="w-3 h-3" />
            {status || 'PENDING'}
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    const isPaid = status === 'PAID' || status === 'COMPLETED';
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
          isPaid
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}
      >
        {isPaid ? 'PAID' : status || 'UNPAID'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-spiritual-border border-t-spiritual-primary"></div>
        <p className="text-xs text-spiritual-muted animate-pulse">Loading temple bookings ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-spiritual-borderLight">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-spiritual-primaryLight/80 text-spiritual-primary flex items-center justify-center border border-spiritual-primaryRing/40">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-spiritual-text">
              Devotee Bookings & Darshan Passes
            </h1>
          </div>
          <p className="text-xs text-spiritual-muted mt-1 max-w-2xl">
            Live reservation ledger for your temple. Track pilgrim arrivals, seva confirmations, and dakshina receipts with verified pass verification.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-spiritual-surface p-0.5 rounded-lg border border-spiritual-border">
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
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-spiritual-primary shadow-spiritual-xs font-semibold'
                  : 'text-spiritual-muted hover:text-spiritual-text'
              }`}
              title="Pass Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="spiritual-card p-4 border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error?.data?.message || 'Failed to load bookings ledger.'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-bold text-rose-700 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Ribbon - 4 High Impact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="spiritual-card p-4 relative overflow-hidden group hover:border-spiritual-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-spiritual-muted uppercase tracking-wider">Total Bookings</span>
            <span className="p-1.5 rounded-md bg-stone-100 text-stone-600">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-spiritual-text">{stats.total}</span>
            <span className="text-[10px] text-spiritual-muted">all time</span>
          </div>
        </div>

        <div className="spiritual-card p-4 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">Confirmed Passes</span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-emerald-700">{stats.confirmed}</span>
            <span className="text-[10px] text-emerald-600 font-medium">
              {stats.total > 0 ? `${Math.round((stats.confirmed / stats.total) * 100)}% active` : '0%'}
            </span>
          </div>
        </div>

        <div className="spiritual-card p-4 relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-blue-800 uppercase tracking-wider">Completed Visits</span>
            <span className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-blue-700">{stats.completed}</span>
            <span className="text-[10px] text-blue-600 font-medium">darshans graced</span>
          </div>
        </div>

        <div className="spiritual-card p-4 relative overflow-hidden group hover:border-amber-400 transition-all bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-900 uppercase tracking-wider">Realized Dakshina</span>
            <span className="p-1.5 rounded-md bg-amber-100 text-amber-800">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xs font-semibold text-amber-800">₹</span>
            <span className="text-2xl font-serif font-bold text-spiritual-text">
              {stats.totalDakshina.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="spiritual-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Quick Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spiritual-muted" />
            <input
              type="text"
              placeholder="Search by devotee, booking ID, phone, email, or seva..."
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

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-spiritual-border bg-spiritual-surface/40 focus:bg-white focus:outline-none focus:border-spiritual-primary text-spiritual-text cursor-pointer"
              />
            </div>

            {(filterStatus || filterDate || searchTerm) && (
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterDate('');
                  setSearchTerm('');
                }}
                className="px-3 py-2 text-xs font-medium text-spiritual-primary hover:text-spiritual-primaryHover hover:bg-spiritual-primaryLight/50 rounded-lg transition-colors shrink-0"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-spiritual-muted uppercase tracking-wider mr-1">Status:</span>
          {[
            { id: '', label: 'All Passes', count: rawBookings.length },
            { id: 'CONFIRMED', label: 'Confirmed', count: rawBookings.filter((b) => b.bookingStatus === 'CONFIRMED').length },
            { id: 'COMPLETED', label: 'Completed', count: rawBookings.filter((b) => b.bookingStatus === 'COMPLETED').length },
            { id: 'PENDING', label: 'Pending', count: rawBookings.filter((b) => b.bookingStatus === 'PENDING').length },
            { id: 'CANCELLED', label: 'Cancelled', count: rawBookings.filter((b) => b.bookingStatus === 'CANCELLED').length },
          ].map((pill) => {
            const isSelected = filterStatus === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setFilterStatus(pill.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-spiritual-primary text-white border-spiritual-primary shadow-spiritual-xs font-semibold'
                    : 'bg-white text-spiritual-muted border-spiritual-border hover:border-spiritual-primary/40 hover:text-spiritual-text'
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-spiritual-surface text-spiritual-muted'
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {bookings.length === 0 ? (
        <div className="spiritual-card p-12 text-center bg-white border border-spiritual-border rounded-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-spiritual-surface flex items-center justify-center text-spiritual-primary mb-3 border border-spiritual-borderLight">
            <Ticket className="w-6 h-6 text-spiritual-primary/60" />
          </div>
          <h3 className="font-serif font-bold text-base text-spiritual-text">No bookings found</h3>
          <p className="text-xs text-spiritual-muted max-w-md mx-auto mt-1 mb-4">
            {filterStatus || filterDate || searchTerm
              ? 'No reservations matched your active filter criteria. Try resetting the filters.'
              : 'When devotees place reservations for darshan or sevas at your temple, their details, slot times, and dakshina receipts will appear here.'}
          </p>
          {(filterStatus || filterDate || searchTerm) && (
            <button
              onClick={() => {
                setFilterStatus('');
                setFilterDate('');
                setSearchTerm('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-spiritual-surface hover:bg-spiritual-surface/80 border border-spiritual-border text-spiritual-text text-xs font-medium rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="spiritual-card overflow-hidden border border-spiritual-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-spiritual-surface/80 border-b border-spiritual-border text-spiritual-muted font-semibold">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Devotee Information</th>
                  <th className="py-3 px-4">Service / Seva</th>
                  <th className="py-3 px-4">Visit Date & Slot</th>
                  <th className="py-3 px-4 text-center">Devotees</th>
                  <th className="py-3 px-4">Dakshina</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-spiritual-border/60">
                {bookings.map((b) => {
                  const refCode = b.bookingReference || b._id.slice(-8).toUpperCase();
                  const devName = b.userId?.name || b.devoteeDetails?.primaryDevotee?.fullName || 'Devotee';
                  const devContact = b.userId?.email || b.userId?.phone || b.devoteeDetails?.primaryDevotee?.phone || '—';
                  const count = b.quantity || (b.devoteeDetails?.devotees?.length) || 1;

                  return (
                    <tr
                      key={b._id}
                      className="hover:bg-spiritual-surface/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-spiritual-primary bg-spiritual-primaryLight/50 px-2 py-0.5 rounded border border-spiritual-primaryRing/30 text-[11px]">
                            {refCode}
                          </span>
                          <button
                            onClick={(e) => handleCopyRef(refCode, e)}
                            className="text-stone-400 hover:text-spiritual-primary p-1 rounded transition-colors"
                            title="Copy Booking Reference"
                          >
                            {copiedRef === refCode ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300">
                            {devName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-spiritual-text block truncate">{devName}</span>
                            <span className="text-[11px] text-spiritual-muted truncate block">{devContact}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-spiritual-text block">{b.serviceId?.name || 'Temple Darshan'}</span>
                        {b.serviceId?.type && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                            {b.serviceId.type}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-spiritual-text">
                          <Calendar className="w-3.5 h-3.5 text-spiritual-primary" />
                          <span>{new Date(b.bookingDate).toLocaleDateString()}</span>
                        </div>
                        {b.timeSlotId && (
                          <div className="flex items-center gap-1 text-[11px] text-spiritual-muted mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {b.timeSlotId.startTime} - {b.timeSlotId.endTime}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-spiritual-surface border border-spiritual-border text-spiritual-text font-bold text-xs">
                          <Users className="w-3 h-3 text-spiritual-primary" />
                          {count}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-spiritual-text">
                        ₹{(b.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4">{getPaymentBadge(b.paymentStatus)}</td>

                      <td className="py-3 px-4">{getStatusBadge(b.bookingStatus)}</td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                          }}
                          className="p-1.5 text-spiritual-muted hover:text-spiritual-primary hover:bg-white rounded-lg transition-colors border border-transparent hover:border-spiritual-border"
                          title="View Full Pass Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* PASS CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((b) => {
            const refCode = b.bookingReference || b._id.slice(-8).toUpperCase();
            const devName = b.userId?.name || b.devoteeDetails?.primaryDevotee?.fullName || 'Devotee';
            const count = b.quantity || (b.devoteeDetails?.devotees?.length) || 1;

            return (
              <div
                key={b._id}
                onClick={() => setSelectedBooking(b)}
                className="spiritual-card p-4 relative overflow-hidden bg-white border border-spiritual-border hover:border-spiritual-primary/50 transition-all hover:shadow-spiritual-md cursor-pointer flex flex-col justify-between"
              >
                {/* Top row */}
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-spiritual-borderLight">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-amber-300">
                        {devName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-spiritual-text truncate">{devName}</h4>
                        <span className="text-[10px] text-spiritual-muted block truncate">
                          {b.userId?.phone || b.devoteeDetails?.primaryDevotee?.phone || 'No phone'}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(b.bookingStatus)}
                  </div>

                  {/* Body details */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-spiritual-muted text-[11px]">Seva / Offering:</span>
                      <span className="font-bold text-spiritual-text truncate max-w-[160px] text-right">
                        {b.serviceId?.name || 'Temple Darshan'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-spiritual-muted text-[11px]">Visit Date:</span>
                      <span className="font-medium text-spiritual-text">
                        {new Date(b.bookingDate).toLocaleDateString()}
                      </span>
                    </div>

                    {b.timeSlotId && (
                      <div className="flex items-center justify-between">
                        <span className="text-spiritual-muted text-[11px]">Slot Window:</span>
                        <span className="font-mono text-spiritual-text text-[11px]">
                          {b.timeSlotId.startTime} - {b.timeSlotId.endTime}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-spiritual-muted text-[11px]">Devotee Count:</span>
                      <span className="font-bold text-spiritual-text flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-spiritual-primary" />
                        {count} {count > 1 ? 'Persons' : 'Person'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer (Ticket Perforation effect) */}
                <div className="mt-4 pt-3 border-t border-dashed border-spiritual-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[11px] text-spiritual-primary bg-spiritual-primaryLight/60 px-2 py-0.5 rounded border border-spiritual-primaryRing/30">
                      {refCode}
                    </span>
                    <button
                      onClick={(e) => handleCopyRef(refCode, e)}
                      className="text-stone-400 hover:text-spiritual-primary p-1 rounded transition-colors"
                      title="Copy Reference"
                    >
                      {copiedRef === refCode ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-spiritual-muted block uppercase">Dakshina</span>
                    <span className="font-mono font-bold text-spiritual-text text-sm">
                      ₹{(b.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DEVOTEE PASS DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="spiritual-card max-w-lg w-full p-6 bg-white border border-spiritual-border shadow-spiritual-lg rounded-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-spiritual-borderLight">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-spiritual-primaryLight text-spiritual-primary flex items-center justify-center border border-spiritual-primaryRing/40">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-spiritual-text">
                    Darshan Pass Details
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-spiritual-primary">
                      {selectedBooking.bookingReference || selectedBooking._id.slice(-8).toUpperCase()}
                    </span>
                    {getStatusBadge(selectedBooking.bookingStatus)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="py-4 space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Devotee Info Card */}
              <div className="p-3 rounded-xl bg-spiritual-surface/60 border border-spiritual-border space-y-2">
                <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
                  Primary Devotee
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-amber-300">
                    {(selectedBooking.userId?.name || selectedBooking.devoteeDetails?.primaryDevotee?.fullName || 'D')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-spiritual-text text-sm">
                      {selectedBooking.userId?.name ||
                        selectedBooking.devoteeDetails?.primaryDevotee?.fullName ||
                        'Devotee'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-spiritual-muted text-[11px] mt-0.5">
                      {(selectedBooking.userId?.phone || selectedBooking.devoteeDetails?.primaryDevotee?.phone) && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedBooking.userId?.phone || selectedBooking.devoteeDetails?.primaryDevotee?.phone}
                        </span>
                      )}
                      {(selectedBooking.userId?.email || selectedBooking.devoteeDetails?.primaryDevotee?.email) && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedBooking.userId?.email || selectedBooking.devoteeDetails?.primaryDevotee?.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gotram & Nakshatram if available */}
                {(selectedBooking.devoteeDetails?.primaryDevotee?.gotra ||
                  selectedBooking.devoteeDetails?.primaryDevotee?.nakshatra) && (
                  <div className="pt-2 border-t border-spiritual-border/60 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-spiritual-muted block">Gotram:</span>
                      <span className="font-semibold text-spiritual-text">
                        {selectedBooking.devoteeDetails.primaryDevotee.gotra || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-spiritual-muted block">Nakshatram:</span>
                      <span className="font-semibold text-spiritual-text">
                        {selectedBooking.devoteeDetails.primaryDevotee.nakshatra || '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Service & Visit Schedule */}
              <div className="p-3 rounded-xl bg-white border border-spiritual-border space-y-2">
                <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
                  Service & Timing
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-spiritual-muted">Offering / Seva:</span>
                    <span className="font-bold text-spiritual-text">
                      {selectedBooking.serviceId?.name || 'Temple Darshan'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-spiritual-muted">Visit Date:</span>
                    <span className="font-semibold text-spiritual-text">
                      {new Date(selectedBooking.bookingDate).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {selectedBooking.timeSlotId && (
                    <div className="flex items-center justify-between">
                      <span className="text-spiritual-muted">Time Window:</span>
                      <span className="font-mono font-bold text-spiritual-primary">
                        {selectedBooking.timeSlotId.startTime} - {selectedBooking.timeSlotId.endTime}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-spiritual-muted">Total Devotees:</span>
                    <span className="font-bold text-spiritual-text">
                      {selectedBooking.quantity || selectedBooking.devoteeDetails?.devotees?.length || 1} Persons
                    </span>
                  </div>
                </div>
              </div>

              {/* Dakshina & Payment Details */}
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Dakshina & Payment Ledger
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800">Total Dakshina:</span>
                    <span className="font-mono font-bold text-spiritual-text text-sm">
                      ₹{(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800">Payment Status:</span>
                    {getPaymentBadge(selectedBooking.paymentStatus)}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-800">Reservation Placed:</span>
                    <span className="text-stone-600">
                      {new Date(selectedBooking.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-spiritual-borderLight flex items-center justify-between">
              <button
                onClick={(e) => handleCopyRef(selectedBooking.bookingReference || selectedBooking._id.slice(-8).toUpperCase(), e)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-spiritual-border text-xs font-medium text-spiritual-text hover:bg-spiritual-surface transition-colors"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-spiritual-primary" />
                    <span>Copy Booking Ref</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-1.5 bg-spiritual-primary text-white text-xs font-semibold rounded-lg hover:bg-spiritual-primaryHover shadow-spiritual-xs transition-colors"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityBookings;
