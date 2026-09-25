import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  ChevronRight,
  Copy,
  Check,
  CreditCard,
  Building,
  Info,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import {
  useGetTempleBySlugQuery,
  useGetTempleServicesQuery,
  useGetServiceAvailabilityQuery,
  useGetDevoteeProfileQuery,
} from '../../store/api/devoteeApi.js';
import { useCreateBookingMutation } from '../../store/api/bookingApi.js';
import {
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
} from '../../store/api/paymentApi.js';
import { loadRazorpayScript } from '../../utils/razorpay.js';
import { ROUTES } from '../../constants/routes.js';
import BookingCalendar from '../../components/devotee/BookingCalendar.jsx';

export const BookService = () => {
  const { slug, serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  // Prefill params from URL if navigated from Temple Details
  const initialDate = searchParams.get('date') || '';
  const initialSlotId = searchParams.get('slotId') || '';

  const [step, setStep] = useState(1);
  const [currentServiceId, setCurrentServiceId] = useState(serviceId);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlotId, setSelectedSlotId] = useState(initialSlotId);
  const [quantity, setQuantity] = useState(1);
  const [copiedRef, setCopiedRef] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync currentServiceId with URL param if it changes
  useEffect(() => {
    if (serviceId && serviceId !== currentServiceId) {
      setCurrentServiceId(serviceId);
    }
  }, [serviceId, currentServiceId]);

  // Devotees array state (up to 6 devotees)
  const [devotees, setDevotees] = useState([
    {
      name: user?.name || '',
      age: '',
      gender: 'MALE',
      idType: 'AADHAAR',
      idNumber: '',
    },
  ]);

  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // Queries
  const { data: templeRes, isLoading: templeLoading } = useGetTempleBySlugQuery(slug);
  const temple = templeRes?.data;

  const { data: servicesRes, isLoading: servicesLoading } = useGetTempleServicesQuery(
    temple?._id,
    { skip: !temple?._id }
  );
  const services = servicesRes?.data || [];
  const targetService =
    services.find((s) => s._id === currentServiceId) ||
    services.find((s) => s._id === serviceId);

  const activeServiceId = targetService?._id || currentServiceId || serviceId;

  const {
    data: availabilityRes,
    isLoading: availabilityLoading,
    isFetching: availabilityFetching,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useGetServiceAvailabilityQuery(
    {
      templeId: temple?._id,
      serviceId: activeServiceId,
      date: selectedDate,
    },
    { skip: !temple?._id || !activeServiceId || !selectedDate }
  );
  const availableSlots = availabilityRes?.data || [];
  const selectedSlot = availableSlots.find(
    (s) => (s._id || s.slotId) === selectedSlotId
  );

  // Service change handler: clears date & slot selections, updates route
  const handleServiceChange = (newServiceId) => {
    if (newServiceId === currentServiceId) return;
    setCurrentServiceId(newServiceId);
    setSelectedDate('');
    setSelectedSlotId('');
    setErrorMessage('');
    navigate(`/temples/${slug}/book/${newServiceId}`, { replace: true });
  };

  // Date select handler from calendar
  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlotId('');
    setErrorMessage('');
  };

  // Devotee Profile for autofill
  const { data: profileRes } = useGetDevoteeProfileQuery();
  const devoteeProfile = profileRes?.data?.user;

  // Mutations & State
  const [createBooking, { isLoading: isSubmitting }] = useCreateBookingMutation();
  const [createPaymentOrder, { isLoading: isCreatingOrder }] = useCreatePaymentOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Adjust devotees array when quantity changes
  useEffect(() => {
    setDevotees((prev) => {
      const updated = [...prev];
      if (quantity > updated.length) {
        for (let i = updated.length; i < quantity; i++) {
          updated.push({
            name: '',
            age: '',
            gender: 'MALE',
            idType: 'AADHAAR',
            idNumber: '',
          });
        }
      } else if (quantity < updated.length) {
        return updated.slice(0, quantity);
      }
      return updated;
    });
  }, [quantity]);

  // Autofill primary devotee from profile
  const handleAutofillDevotee = (idx) => {
    if (!devoteeProfile) return;
    setDevotees((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        name: devoteeProfile.name || copy[idx].name,
      };
      return copy;
    });
  };

  const handleDevoteeChange = (index, field, value) => {
    setDevotees((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Step 1 validation
  const canProceedToStep2 = selectedDate && selectedSlotId && selectedSlot && selectedSlot.availableSeats >= quantity;

  // Step 2 validation
  const validateDevotees = () => {
    for (let i = 0; i < devotees.length; i++) {
      const d = devotees[i];
      if (!d.name || d.name.trim().length < 2) {
        return `Devotee #${i + 1}: Name must be at least 2 characters long.`;
      }
      const ageNum = parseInt(d.age, 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        return `Devotee #${i + 1}: Please enter a valid age between 0 and 120.`;
      }
    }
    return null;
  };

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    const error = validateDevotees();
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage('');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3: Confirm & Submit Booking with Razorpay Test Mode
  const handleConfirmBooking = async () => {
    setErrorMessage('');
    setIsProcessingPayment(true);

    try {
      // 1. Create booking (reserves slot capacity atomically on server)
      const payload = {
        templeId: temple._id,
        serviceId: targetService._id,
        timeSlotId: selectedSlotId,
        bookingDate: selectedDate,
        devotees: devotees.map((d) => ({
          name: d.name.trim(),
          age: parseInt(d.age, 10),
          gender: d.gender,
          idType: d.idType,
          idNumber: d.idNumber?.trim() || '',
        })),
      };

      const res = await createBooking(payload).unwrap();
      const createdBooking = res.data.booking;

      // 2. If free service (₹0), confirm directly without payment gateway
      if (!createdBooking.totalAmount || createdBooking.totalAmount === 0) {
        setConfirmedBookingData(res.data);
        setStep(4);
        setIsProcessingPayment(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 3. Load Razorpay Checkout SDK dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setIsProcessingPayment(false);
        setErrorMessage('Unable to load payment gateway. Please verify your internet connection and try again.');
        return;
      }

      // 4. Create Razorpay Order on server
      const orderRes = await createPaymentOrder({
        bookingId: createdBooking._id,
      }).unwrap();

      const orderData = orderRes.data;

      // 5. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'DevaSetu',
        description: `${targetService.name} • ${temple.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.devoteeName || user?.name || '',
          email: orderData.devoteeEmail || user?.email || '',
          contact: orderData.devoteePhone || user?.phone || '',
        },
        theme: {
          color: '#800020', // Sacred Maroon/Burgundy
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            setErrorMessage('Payment was not completed. Your booking has not been confirmed.');
          },
        },
        handler: async (paymentResponse) => {
          try {
            setIsProcessingPayment(true);
            const verifyRes = await verifyPayment({
              bookingId: createdBooking._id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            }).unwrap();

            setConfirmedBookingData({
              ...res.data,
              booking: verifyRes.data.booking,
              payment: verifyRes.data.payment,
            });
            setStep(4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (verifyErr) {
            setErrorMessage(
              verifyErr?.data?.message || 'Payment verification failed. Please check My Bookings or contact support.'
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (failureResponse) => {
        setIsProcessingPayment(false);
        setErrorMessage(
          failureResponse.error?.description ||
            'Payment was not completed. Your booking has not been confirmed.'
        );
      });

      razorpayInstance.open();
    } catch (err) {
      setIsProcessingPayment(false);
      const msg = err?.data?.message || err?.message || 'Failed to initiate booking payment. Please try again.';
      setErrorMessage(msg);
      // If capacity conflict, refresh availability and prompt user
      if (err?.status === 409) {
        refetchAvailability();
      }
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  if (templeLoading || servicesLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 space-y-6 animate-pulse">
        <div className="h-8 bg-spiritual-surface rounded w-1/3"></div>
        <div className="h-64 bg-spiritual-surface rounded-2xl"></div>
      </div>
    );
  }

  if (!temple || !targetService) {
    return (
      <div className="spiritual-card p-12 text-center max-w-lg mx-auto my-12 bg-white space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-serif font-bold text-xl text-spiritual-text">Service Not Found</h2>
        <p className="text-xs text-spiritual-muted">
          The selected temple or seva service could not be located or is no longer active.
        </p>
        <Link to={`/temples/${slug}`} className="btn-spiritual-primary text-xs py-2 px-4 inline-block">
          Return to Temple
        </Link>
      </div>
    );
  }

  const unitPrice = targetService.price || 0;
  const estimatedTotal = unitPrice * quantity;

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* Breadcrumbs & Temple Context */}
      <div className="flex items-center justify-between">
        <Link
          to={`/temples/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-spiritual-muted hover:text-spiritual-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {temple.name}
        </Link>
        <span className="text-[11px] font-semibold text-spiritual-subtle uppercase tracking-wider">
          Pilgrim Booking Portal
        </span>
      </div>

      {/* Header Banner */}
      <div className="spiritual-card p-6 sm:p-8 bg-gradient-to-r from-spiritual-surface via-white to-spiritual-surface border border-spiritual-border rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-spiritual-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Devotee Booking
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-spiritual-text">
            {targetService.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-spiritual-muted">
            <span className="flex items-center gap-1 text-spiritual-text font-medium">
              <Building className="w-3.5 h-3.5 text-spiritual-primary" /> {temple.name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-spiritual-accent" /> {temple.city}, {temple.state}
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur px-5 py-3.5 rounded-2xl border border-spiritual-border text-right shrink-0">
          <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
            Offering Rate
          </span>
          <span className="text-2xl font-serif font-bold text-spiritual-primary">
            {unitPrice === 0 ? 'Free' : `₹${unitPrice}`}
          </span>
          <span className="text-[10px] text-spiritual-subtle block">per devotee</span>
        </div>
      </div>

      {/* Stepper Wizard Indicator (Steps 1 to 3) */}
      {step < 4 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs">
          {[
            { num: 1, label: 'Date & Slot' },
            { num: 2, label: 'Devotee Details' },
            { num: 3, label: 'Summary & Confirm' },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div
                key={s.num}
                className={`spiritual-card p-3 sm:p-4 text-center rounded-2xl border transition-all ${
                  isActive
                    ? 'border-spiritual-primary bg-spiritual-primaryLight/30 text-spiritual-primary font-bold shadow-spiritual-sm'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                    : 'border-spiritual-borderLight bg-white text-spiritual-muted opacity-60'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isActive
                        ? 'bg-spiritual-primary text-white'
                        : 'bg-spiritual-surface text-spiritual-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span className="hidden sm:inline font-medium">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Alert Display */}
      {errorMessage && (
        <div className="spiritual-card p-4 border border-red-200 bg-red-50 text-red-700 rounded-2xl text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div className="space-y-1">
            <span className="font-bold">Booking Notice</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: SERVICE, CALENDAR & TIME SLOT SELECTION                */}
      {/* ============================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Service & Quantity Selection Card */}
          <div className="spiritual-card p-6 sm:p-8 bg-white border border-spiritual-border rounded-3xl space-y-6">
            <div className="border-b border-spiritual-borderLight pb-4">
              <h2 className="text-lg font-serif font-bold text-spiritual-text">
                1. Select Service & Devotees
              </h2>
              <p className="text-xs text-spiritual-muted">
                Choose your seva or darshan service and specify the number of devotees in your party.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Service Selector (Allows switching active seva service) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-spiritual-text uppercase tracking-wider">
                  Seva / Darshan Service
                </label>
                <select
                  value={activeServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-4 py-3 bg-spiritual-surface border border-spiritual-border rounded-xl text-xs font-semibold text-spiritual-text focus:outline-none focus:ring-2 focus:ring-spiritual-primary cursor-pointer"
                >
                  {services.map((svc) => (
                    <option key={svc._id} value={svc._id}>
                      {svc.name} — {svc.price === 0 ? 'Free' : `₹${svc.price}`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-spiritual-subtle">
                  Switching service will refresh calendar availability for the chosen service.
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-spiritual-text uppercase tracking-wider">
                  Number of Devotees
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setQuantity(num);
                        if (selectedSlot && selectedSlot.availableSeats < num) {
                          setSelectedSlotId('');
                        }
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        quantity === num
                          ? 'bg-spiritual-primary text-white shadow-spiritual-sm'
                          : 'bg-spiritual-surface hover:bg-spiritual-border text-spiritual-muted border border-spiritual-border'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-spiritual-subtle">
                  Maximum 6 devotees per reservation.
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Booking Calendar Component */}
          <BookingCalendar
            templeId={temple?._id}
            serviceId={activeServiceId}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />

          {/* Slots Selector Section (Directly Below Calendar) */}
          <div className="spiritual-card p-6 sm:p-8 bg-white border border-spiritual-border rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-spiritual-borderLight pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-spiritual-text flex items-center gap-2">
                  <Clock className="w-4 h-4 text-spiritual-primary" /> Available Time Slots
                </h3>
                <p className="text-xs text-spiritual-muted">
                  {selectedDate
                    ? `Showing real-time slot availability for ${new Date(
                        selectedDate + 'T00:00:00'
                      ).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`
                    : 'Select a date on the calendar above to view available time slots.'}
                </p>
              </div>
              {availabilityFetching && (
                <span className="text-[11px] text-spiritual-primary animate-pulse font-medium flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Checking slots...
                </span>
              )}
            </div>

            {/* If no date is selected yet */}
            {!selectedDate ? (
              <div className="p-8 text-center bg-spiritual-surface/60 rounded-2xl border border-dashed border-spiritual-border space-y-2">
                <Calendar className="w-8 h-8 text-spiritual-primary/60 mx-auto" />
                <p className="text-xs font-bold text-spiritual-text">Please Select a Date</p>
                <p className="text-[11px] text-spiritual-muted max-w-sm mx-auto">
                  Click any green date (🟢) on the calendar above to explore and book available darshan slots.
                </p>
              </div>
            ) : availabilityLoading || availabilityFetching ? (
              /* Loading State */
              <div className="space-y-3">
                <p className="text-xs text-spiritual-primary font-medium flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking availability...
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-spiritual-surface rounded-2xl border border-spiritual-borderLight"></div>
                  ))}
                </div>
              </div>
            ) : availabilityError ? (
              /* API Error State (Distinct from No Slots) */
              <div className="p-6 text-center bg-red-50/80 rounded-2xl border border-red-200 text-red-700 space-y-2">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
                <p className="text-xs font-bold">Unable to load availability. Please try again.</p>
                <button
                  type="button"
                  onClick={() => refetchAvailability()}
                  className="btn-spiritual-outline text-[11px] py-1.5 px-3 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Retry Loading Slots
                </button>
              </div>
            ) : availableSlots.length === 0 ? (
              /* No Slots Available State */
              <div className="p-8 text-center bg-spiritual-surface/60 rounded-2xl border border-dashed border-spiritual-border space-y-2">
                <Calendar className="w-8 h-8 text-spiritual-muted mx-auto" />
                <p className="text-xs font-bold text-spiritual-text">No slots available for this date.</p>
                <p className="text-[11px] text-spiritual-muted">
                  Please select an alternate date from the calendar.
                </p>
              </div>
            ) : (
              /* Available & Full Slots List */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableSlots.map((slot) => {
                  const slotKey = slot._id || slot.slotId;
                  const isSelected = selectedSlotId === slotKey;
                  const isFull = slot.bookedCount >= slot.capacity || slot.availableSeats <= 0;
                  const hasEnoughSeats = !isFull && slot.availableSeats >= quantity;

                  // Full slot rendering (muted, disabled, "Fully booked")
                  if (isFull) {
                    return (
                      <div
                        key={slotKey}
                        className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 text-gray-400 opacity-60 cursor-not-allowed flex flex-col justify-between"
                        aria-disabled="true"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-500">
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-600">
                              Fully booked
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-2 text-[10px] text-gray-400">
                            <span>0 spots left</span>
                            <span>(Cap: {slot.capacity})</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Available slot rendering (clickable, selectable)
                  return (
                    <button
                      key={slotKey}
                      type="button"
                      disabled={!hasEnoughSeats}
                      onClick={() => setSelectedSlotId(slotKey)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-spiritual-primary ring-2 ring-spiritual-primary/20 bg-spiritual-primaryLight/20 shadow-spiritual-sm'
                          : hasEnoughSeats
                          ? 'border-spiritual-border hover:border-spiritual-primary/50 bg-white hover:shadow-spiritual-sm cursor-pointer'
                          : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-spiritual-text">
                            {slot.startTime} – {slot.endTime}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-spiritual-primary" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              hasEnoughSeats
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {slot.availableSeats} spot{slot.availableSeats !== 1 ? 's' : ''} available
                          </span>
                          <span className="text-[10px] text-spiritual-subtle">
                            (Cap: {slot.capacity})
                          </span>
                        </div>
                      </div>

                      {!hasEnoughSeats && (
                        <p className="text-[10px] text-amber-600 font-semibold mt-2">
                          Needs {quantity} seats
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Action to Step 2 */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!canProceedToStep2}
              onClick={() => {
                setStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-spiritual-primary text-xs py-3 px-6 flex items-center gap-2 disabled:opacity-40"
            >
              <span>Continue to Devotee Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: DEVOTEE DETAILS ENTRY                                  */}
      {/* ============================================================== */}
      {step === 2 && (
        <form onSubmit={handleProceedToSummary} className="space-y-6">
          <div className="spiritual-card p-6 sm:p-8 bg-white border border-spiritual-border rounded-3xl space-y-6">
            <div className="border-b border-spiritual-borderLight pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-serif font-bold text-spiritual-text">
                  2. Devotee Details ({devotees.length} Pilgrim{devotees.length > 1 ? 's' : ''})
                </h2>
                <p className="text-xs text-spiritual-muted">
                  Provide name and demographic verification for each pilgrim in your group.
                </p>
              </div>
              <span className="text-xs font-semibold text-spiritual-primary bg-spiritual-primaryLight px-3 py-1 rounded-full w-fit">
                {selectedDate} • {selectedSlot?.startTime} - {selectedSlot?.endTime}
              </span>
            </div>

            <div className="space-y-6">
              {devotees.map((dev, idx) => (
                <div
                  key={idx}
                  className="spiritual-card p-5 bg-spiritual-surface/50 border border-spiritual-border rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-spiritual-borderLight pb-2">
                    <span className="font-serif font-bold text-xs text-spiritual-primary uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Devotee #{idx + 1}
                      {idx === 0 && ' (Primary Pilgrim)'}
                    </span>

                    {idx === 0 && devoteeProfile && (
                      <button
                        type="button"
                        onClick={() => handleAutofillDevotee(idx)}
                        className="text-[11px] font-semibold text-spiritual-accent hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Fill from Profile
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="block text-[11px] font-semibold text-spiritual-muted">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Sharma"
                        value={dev.name}
                        onChange={(e) => handleDevoteeChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-spiritual-border rounded-xl text-xs font-medium text-spiritual-text focus:outline-none focus:ring-1 focus:ring-spiritual-primary"
                      />
                    </div>

                    {/* Age */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[11px] font-semibold text-spiritual-muted">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        required
                        placeholder="Age"
                        value={dev.age}
                        onChange={(e) => handleDevoteeChange(idx, 'age', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-spiritual-border rounded-xl text-xs font-medium text-spiritual-text focus:outline-none focus:ring-1 focus:ring-spiritual-primary"
                      />
                    </div>

                    {/* Gender */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="block text-[11px] font-semibold text-spiritual-muted">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={dev.gender}
                        onChange={(e) => handleDevoteeChange(idx, 'gender', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-spiritual-border rounded-xl text-xs font-medium text-spiritual-text focus:outline-none focus:ring-1 focus:ring-spiritual-primary"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* ID Type */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="block text-[11px] font-semibold text-spiritual-muted">
                        Govt ID Type
                      </label>
                      <select
                        value={dev.idType}
                        onChange={(e) => handleDevoteeChange(idx, 'idType', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-spiritual-border rounded-xl text-xs font-medium text-spiritual-text focus:outline-none focus:ring-1 focus:ring-spiritual-primary"
                      >
                        <option value="AADHAAR">Aadhaar Card</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="VOTER_ID">Voter ID</option>
                        <option value="DRIVING_LICENSE">Driving License</option>
                        <option value="OTHER">Other Official ID</option>
                      </select>
                    </div>

                    {/* ID Number */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="block text-[11px] font-semibold text-spiritual-muted">
                        ID Number (Masked on Ticket)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. XXXX-XXXX-1234"
                        value={dev.idNumber}
                        onChange={(e) => handleDevoteeChange(idx, 'idNumber', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-spiritual-border rounded-xl text-xs font-medium text-spiritual-text focus:outline-none focus:ring-1 focus:ring-spiritual-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-spiritual-outline text-xs py-2.5 px-5 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Slots
            </button>

            <button
              type="submit"
              className="btn-spiritual-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <span>Review Booking Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* STEP 3: BOOKING SUMMARY & REVIEW                               */}
      {/* ============================================================== */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="spiritual-card p-6 sm:p-8 bg-white border border-spiritual-border rounded-3xl space-y-6">
            <div className="border-b border-spiritual-borderLight pb-4">
              <h2 className="text-lg font-serif font-bold text-spiritual-text">
                3. Review Your Booking Summary
              </h2>
              <p className="text-xs text-spiritual-muted">
                Please double-check all reservation details before confirming your pilgrimage slot.
              </p>
            </div>

            {/* Summary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="spiritual-card p-5 bg-spiritual-surface/60 rounded-2xl border border-spiritual-border space-y-3">
                <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
                  Temple & Service
                </span>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-spiritual-text">
                    {temple.name}
                  </h4>
                  <p className="text-spiritual-muted">{temple.address}, {temple.city}, {temple.state} - {temple.pincode}</p>
                </div>
                <div className="pt-2 border-t border-spiritual-borderLight flex items-center justify-between">
                  <span className="font-medium text-spiritual-muted">Seva / Darshan:</span>
                  <span className="font-bold text-spiritual-primary">{targetService.name}</span>
                </div>
              </div>

              <div className="spiritual-card p-5 bg-spiritual-surface/60 rounded-2xl border border-spiritual-border space-y-3">
                <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
                  Schedule & Slot
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-spiritual-text">
                    <Calendar className="w-4 h-4 text-spiritual-primary" />
                    <span>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-spiritual-primary">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedSlot?.startTime} – {selectedSlot?.endTime}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-spiritual-borderLight flex items-center justify-between">
                  <span className="font-medium text-spiritual-muted">Devotees:</span>
                  <span className="font-bold text-spiritual-text">{quantity} Pilgrim{quantity > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Pilgrims List */}
            <div className="spiritual-card p-5 bg-white border border-spiritual-border rounded-2xl space-y-3">
              <h4 className="font-serif font-bold text-xs text-spiritual-text uppercase tracking-wider">
                Registered Pilgrims
              </h4>
              <div className="divide-y divide-spiritual-borderLight text-xs">
                {devotees.map((d, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-spiritual-surface text-spiritual-primary font-bold text-[10px] flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-spiritual-text">{d.name}</span>
                      <span className="text-spiritual-muted text-[11px]">
                        ({d.gender.toLowerCase()}, {d.age} yrs)
                      </span>
                    </div>
                    <span className="text-[11px] text-spiritual-muted">
                      {d.idType}: {d.idNumber ? `••••${d.idNumber.slice(-4)}` : 'Not provided'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="spiritual-card p-6 bg-spiritual-surface rounded-2xl border border-spiritual-border space-y-3">
              <div className="flex justify-between text-xs text-spiritual-muted">
                <span>Offering Rate ({quantity} × {unitPrice === 0 ? 'Free' : `₹${unitPrice}`})</span>
                <span>{unitPrice === 0 ? '₹0' : `₹${estimatedTotal}`}</span>
              </div>
              <div className="flex justify-between text-xs text-spiritual-muted">
                <span>Platform Convenience Fee</span>
                <span className="text-emerald-700 font-medium">₹0 (Complimentary)</span>
              </div>
              <div className="pt-3 border-t border-spiritual-border flex justify-between items-center">
                <div>
                  <span className="font-serif font-bold text-base text-spiritual-text">
                    Total Amount
                  </span>
                  <span className="text-[10px] text-spiritual-muted block">
                    Authoritatively validated on server
                  </span>
                </div>
                <span className="text-2xl font-serif font-bold text-spiritual-primary">
                  {unitPrice === 0 ? 'Free' : `₹${estimatedTotal}`}
                </span>
              </div>
            </div>

            {/* Payment Notice */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Secure Razorpay Payment (Test Mode)</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Clicking "{estimatedTotal > 0 ? `Pay ₹${estimatedTotal}` : 'Confirm Booking'}" will atomically reserve your slot and launch the secure Razorpay Test Checkout modal.
              </p>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={isSubmitting || isCreatingOrder || isProcessingPayment}
              onClick={() => {
                setStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-spiritual-outline text-xs py-2.5 px-5 flex items-center gap-1.5 disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
            </button>

            <button
              type="button"
              id="pay-booking-btn"
              disabled={isSubmitting || isCreatingOrder || isProcessingPayment}
              onClick={handleConfirmBooking}
              className="btn-spiritual-primary text-xs py-3.5 px-8 flex items-center gap-2 disabled:opacity-50 shadow-spiritual-md min-w-[160px] justify-center"
            >
              {isSubmitting || isCreatingOrder || isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>{estimatedTotal > 0 ? `Pay ₹${estimatedTotal}` : 'Confirm Booking'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: CONFIRMATION DISPLAY                                   */}
      {/* ============================================================== */}
      {step === 4 && confirmedBookingData && (
        <div className="spiritual-card p-8 sm:p-12 bg-white border border-spiritual-border rounded-3xl text-center space-y-8 max-w-2xl mx-auto shadow-spiritual-md">
          {/* Badge */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Booking Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-spiritual-text">
              ✓ Booking Confirmed
            </h2>
            <p className="text-xs sm:text-sm text-spiritual-muted max-w-md mx-auto">
              Your sacred darshan reservation has been verified and confirmed on DevaSetu.
            </p>
          </div>

          {/* Booking Reference Box */}
          <div className="p-6 bg-gradient-to-br from-spiritual-surface to-white border border-spiritual-primary/30 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold text-spiritual-muted uppercase tracking-wider block">
              Booking Reference
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-xl sm:text-2xl font-bold text-spiritual-primary tracking-wider">
                {confirmedBookingData.booking.bookingReference}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(confirmedBookingData.booking.bookingReference)}
                className="p-1.5 rounded-lg bg-spiritual-surface hover:bg-spiritual-primary hover:text-white border border-spiritual-border text-spiritual-muted transition-all"
                title="Copy reference"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedRef && (
              <p className="text-[10px] text-emerald-700 font-semibold animate-pulse">
                Copied reference to clipboard!
              </p>
            )}
          </div>

          {/* Detailed Confirmation Grid */}
          <div className="grid grid-cols-2 gap-4 text-left text-xs bg-spiritual-surface/60 p-6 rounded-2xl border border-spiritual-border">
            <div>
              <span className="text-[10px] text-spiritual-muted uppercase font-semibold">Temple</span>
              <p className="font-bold text-spiritual-text truncate">{confirmedBookingData.temple?.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-spiritual-muted uppercase font-semibold">Service</span>
              <p className="font-bold text-spiritual-text truncate">{confirmedBookingData.service?.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-spiritual-muted uppercase font-semibold">Date</span>
              <p className="font-bold text-spiritual-text">
                {new Date(confirmedBookingData.booking.bookingDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-spiritual-muted uppercase font-semibold">Time Slot</span>
              <p className="font-bold text-spiritual-text">
                {confirmedBookingData.timeSlot?.startTime} - {confirmedBookingData.timeSlot?.endTime}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-spiritual-muted uppercase font-semibold">Pilgrims</span>
              <p className="font-bold text-spiritual-text">{confirmedBookingData.booking.quantity} Devotee(s)</p>
            </div>
            <div>
              <span className="text-[10px] text-spiritual-muted uppercase font-semibold">Payment</span>
              <p className="font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>
                  {confirmedBookingData.booking.paymentStatus === 'PAID' ? 'Paid' : 'Confirmed'} (₹{confirmedBookingData.booking.totalAmount})
                </span>
              </p>
            </div>
          </div>

          {/* Real Scannable Gate QR Code Pass */}
          {(() => {
            const b = confirmedBookingData.booking;
            const token = b?.qrVerificationToken || (typeof b?.qrCode === 'string' ? b.qrCode : b?.qrCode?.code);
            const origin =
              typeof window !== 'undefined' && window.location?.origin
                ? window.location.origin
                : (import.meta.env.VITE_APP_URL || 'http://localhost:5173');
            const qrPayload = token ? `${origin}/booking/verify/${token}` : '';

            return qrPayload ? (
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-2.5 max-w-sm mx-auto">
                <div className="flex items-center justify-center gap-1.5 text-stone-800 font-bold text-xs">
                  <QrCode className="w-4 h-4 text-amber-700" />
                  <span>Booking QR Code</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs inline-block mx-auto">
                  <div className="w-[180px] h-[180px] flex items-center justify-center">
                    <QRCode
                      value={qrPayload}
                      size={180}
                      level="M"
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 font-medium">
                  Scan for Temple Gate Verification
                </p>
              </div>
            ) : null;
          })()}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={ROUTES.MY_BOOKINGS}
              className="w-full sm:w-auto btn-spiritual-primary text-xs py-3 px-6 text-center"
            >
              View My Booking
            </Link>
            <Link
              to={`/my-bookings/${confirmedBookingData.booking._id}`}
              className="w-full sm:w-auto btn-spiritual-outline text-xs py-3 px-6 text-center flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-spiritual-primary" />
              <span>View QR / Booking Pass</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookService;
