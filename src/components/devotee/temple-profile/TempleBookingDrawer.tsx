import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CreditCard,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  LogIn,
  Plus,
  Trash2,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import BookingCalendar from '../BookingCalendar.js';
import { useAppSelector } from '../../../store/hooks.js';
import {
  useGetServiceAvailabilityQuery,
  useGetDevoteeProfileQuery,
} from '../../../store/api/devoteeApi.js';
import { useCreateBookingMutation } from '../../../store/api/bookingApi.js';
import {
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
} from '../../../store/api/paymentApi.js';
import { loadRazorpayScript } from '../../../utils/razorpay.js';
import type {
  RazorpayCheckoutOptions,
  RazorpaySuccessResponse,
  RazorpayInstance,
} from '../../../utils/razorpay.js';
import { ROUTES } from '../../../constants/routes.js';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import type { AuthenticatedUser, DevoteeGender, DevoteeIdType, Booking, Payment } from '@shared/types/index.js';
import type {
  TempleBookingDrawerProps,
  DevoteeFormState,
  DrawerSlotItem,
  ConfirmedBookingData,
  PaymentOrderData,
  RazorpayErrorPayload,
} from './TempleBookingDrawer.types.js';

interface VerifyPaymentResponseData {
  booking?: Booking;
  payment?: Payment;
  verified?: boolean;
}

function isSlotItemArray(value: unknown): value is DrawerSlotItem[] {
  return Array.isArray(value);
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function extractErrorMessage(err: unknown, defaultMsg: string): string {
  if (isFetchBaseQueryError(err)) {
    if (
      typeof err.data === 'object' &&
      err.data !== null &&
      'message' in err.data &&
      typeof (err.data as Record<string, unknown>).message === 'string'
    ) {
      return (err.data as Record<string, unknown>).message as string;
    }
    return defaultMsg;
  }
  if (isErrorWithMessage(err)) {
    return err.message;
  }
  return defaultMsg;
}

function isRazorpayErrorPayload(obj: unknown): obj is RazorpayErrorPayload {
  return typeof obj === 'object' && obj !== null && 'error' in obj;
}

export const TempleBookingDrawer: React.FC<TempleBookingDrawerProps> = ({
  isOpen,
  onClose,
  temple,
  services = [],
  initialServiceId = '',
  initialDate = '',
  initialSlotId = '',
}) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Queries & Mutations
  const { data: profileRes } = useGetDevoteeProfileQuery(undefined, { skip: !user });
  const devoteeProfile = useMemo((): Partial<AuthenticatedUser> | null => {
    if (profileRes?.data && typeof profileRes.data === 'object') {
      const dataObj = profileRes.data as Record<string, unknown>;
      if ('user' in dataObj && typeof dataObj.user === 'object' && dataObj.user !== null) {
        return dataObj.user as Partial<AuthenticatedUser>;
      }
      return profileRes.data as Partial<AuthenticatedUser>;
    }
    return user || null;
  }, [profileRes, user]);

  const [createBooking, { isLoading: isSubmittingBooking }] = useCreateBookingMutation();
  const [createPaymentOrder, { isLoading: isCreatingOrder }] = useCreatePaymentOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();

  // Booking Flow Steps: 1: Service, 2: Date, 3: Slot, 4: Details, 5: Review, 6: Success
  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<ConfirmedBookingData | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState<boolean>(false);

  // Devotees List
  const [devotees, setDevotees] = useState<DevoteeFormState[]>([
    {
      name: devoteeProfile?.name || '',
      age: '',
      gender: 'MALE',
      idType: 'AADHAAR',
      idNumber: '',
    },
  ]);

  // Determine active service object
  const activeService = useMemo(() => {
    return (
      services.find((s) => s._id === selectedServiceId) ||
      services[0] ||
      null
    );
  }, [services, selectedServiceId]);

  // Initialize state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setShowCloseConfirm(false);

      if (initialServiceId) {
        setSelectedServiceId(initialServiceId);
        // If a service was preselected (e.g. from Check Slots or Book on a specific card), skip to Date or Slot
        if (initialSlotId) {
          setSelectedSlotId(initialSlotId);
          setStep(3);
        } else {
          setStep(2);
        }
      } else {
        // Default to first Darshan service or first active service
        const darshanService = services.find(
          (s) => s.type?.toUpperCase() === 'DARSHAN' || s.name?.toLowerCase().includes('darshan')
        );
        const defaultId = darshanService?._id || services[0]?._id || '';
        setSelectedServiceId(defaultId);
        setStep(defaultId ? (initialSlotId ? 3 : 2) : 1);
      }

      const todayStr = (() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();
      setSelectedDate(initialDate || todayStr);
      if (initialSlotId) {
        setSelectedSlotId(initialSlotId);
      } else {
        setSelectedSlotId('');
      }
      setConfirmedBookingData(null);
    }
  }, [isOpen, initialServiceId, initialDate, initialSlotId, services]);

  // Adjust devotees array length based on quantity
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

  // Update primary devotee name when profile loads
  useEffect(() => {
    if (devoteeProfile?.name && devotees[0] && !devotees[0].name) {
      setDevotees((prev) => {
        const copy = [...prev];
        copy[0] = { ...copy[0], name: devoteeProfile.name || '' };
        return copy;
      });
    }
  }, [devoteeProfile]);

  // Query real-time available time slots for the selected date
  const {
    data: availabilityRes,
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
    error: slotsError,
    refetch: refetchAvailability,
  } = useGetServiceAvailabilityQuery(
    {
      templeId: temple?._id || '',
      serviceId: selectedServiceId,
      date: selectedDate,
    },
    {
      skip: !temple?._id || !selectedServiceId || !selectedDate || !isOpen,
    }
  );

  const availableSlots: DrawerSlotItem[] = isSlotItemArray(availabilityRes?.data)
    ? availabilityRes.data
    : [];
  const selectedSlot = availableSlots.find(
    (s) => (s._id || s.slotId || s.timeSlotId) === selectedSlotId
  );

  // Close Guard
  const handleAttemptClose = () => {
    // If on Success step or Step 1 or 2 with no slot picked, close safely
    if (step === 6 || (step <= 2 && !selectedSlotId)) {
      onClose();
      return;
    }
    // If devotee details or slot were selected, confirm before closing
    setShowCloseConfirm(true);
  };

  const handleForceClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showCloseConfirm) {
          setShowCloseConfirm(false);
        } else {
          handleAttemptClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showCloseConfirm, step]);

  // Service Change Handler (clears date & slot to avoid stale data)
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedSlotId('');
    setErrorMessage('');
    setStep(2);
  };

  // Date Select Handler (clears slot)
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlotId('');
    setErrorMessage('');
    setStep(3);
  };

  // Devotee Input Handlers
  const handleDevoteeChange = (
    index: number,
    field: keyof DevoteeFormState,
    value: string
  ) => {
    setDevotees((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAutofillDevotee = (idx: number) => {
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

  // Validate Devotee Details (Step 4)
  const validateDevotees = (): string | null => {
    for (let i = 0; i < devotees.length; i++) {
      const d = devotees[i];
      if (!d.name || d.name.trim().length < 2) {
        return `Devotee #${i + 1}: Name must be at least 2 characters long.`;
      }
      const ageNum = parseInt(String(d.age), 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        return `Devotee #${i + 1}: Please enter a valid age between 0 and 120.`;
      }
    }
    return null;
  };

  const handleProceedToReview = (e?: React.FormEvent) => {
    e?.preventDefault();
    const error = validateDevotees();
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage('');
    setStep(5);
  };

  // Step 5: Confirm & Pay with Razorpay Test Mode
  const handleConfirmAndPay = async () => {
    if (!temple?._id || !activeService?._id) {
      setErrorMessage('Temple or service information is missing. Please restart booking.');
      return;
    }

    setErrorMessage('');
    setIsProcessingPayment(true);

    try {
      // 1. Create booking atomically on backend
      const payload = {
        templeId: temple._id,
        serviceId: activeService._id,
        timeSlotId: selectedSlotId,
        bookingDate: selectedDate,
        devotees: devotees.map((d) => ({
          name: d.name.trim(),
          age: parseInt(String(d.age), 10),
          gender: d.gender,
          idType: (d.idType === 'PAN' ? 'OTHER' : d.idType) as DevoteeIdType,
          idNumber: d.idNumber?.trim() || '',
        })),
      };

      const res = await createBooking(payload).unwrap();
      const resData = res.data as unknown as ConfirmedBookingData;
      const createdBooking = resData.booking;

      // 2. Free Offering (₹0): confirm directly
      if (!createdBooking.totalAmount || createdBooking.totalAmount === 0) {
        setConfirmedBookingData(resData);
        setStep(6);
        setIsProcessingPayment(false);
        return;
      }

      // 3. Load Razorpay Checkout SDK dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setIsProcessingPayment(false);
        setErrorMessage('Unable to load payment gateway. Please check your network and try again.');
        return;
      }

      // 4. Create Razorpay order on server
      const orderRes = await createPaymentOrder({
        bookingId: createdBooking._id,
      }).unwrap();
      const orderData = orderRes.data as unknown as PaymentOrderData;

      // 5. Open Razorpay modal
      const options: RazorpayCheckoutOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'DevaSetu',
        description: `${activeService.name} • ${temple.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.devoteeName || user?.name || '',
          email: orderData.devoteeEmail || user?.email || '',
          contact: orderData.devoteePhone || user?.phone || '',
        },
        theme: {
          color: '#800020', // Sacred Maroon
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            setErrorMessage('Payment was cancelled. Your booking has not been confirmed.');
          },
        },
        handler: async (paymentResponse: RazorpaySuccessResponse) => {
          try {
            setIsProcessingPayment(true);
            const verifyRes = await verifyPayment({
              bookingId: createdBooking._id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            }).unwrap();

            const verifyData = verifyRes.data as unknown as VerifyPaymentResponseData;

            setConfirmedBookingData({
              ...resData,
              booking: verifyData?.booking || createdBooking,
              payment: verifyData?.payment,
            });
            setStep(6);
          } catch (verifyErr: unknown) {
            setErrorMessage(
              extractErrorMessage(
                verifyErr,
                'Payment verification failed. Please check My Bookings or contact support.'
              )
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
      };

      if (!window.Razorpay) {
        setIsProcessingPayment(false);
        setErrorMessage('Razorpay SDK is not available in the current environment.');
        return;
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (failResp: unknown) => {
        setIsProcessingPayment(false);
        const failDesc =
          isRazorpayErrorPayload(failResp) && failResp.error?.description
            ? failResp.error.description
            : 'Payment failed. Your booking has not been confirmed.';
        setErrorMessage(failDesc);
      });

      razorpayInstance.open();
    } catch (err: unknown) {
      setIsProcessingPayment(false);
      const msg = extractErrorMessage(err, 'Failed to complete booking. Please try again.');
      setErrorMessage(msg);
      // Refresh slot capacity on conflict
      if (isFetchBaseQueryError(err) && err.status === 409) {
        refetchAvailability();
      }
    }
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  if (!isOpen) return null;

  const totalAmount = (activeService?.price || 0) * quantity;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleAttemptClose}
        aria-hidden="true"
      />

      {/* Right Drawer Container (Desktop 480–540px, Mobile full screen) */}
      <div
        className="relative z-10 w-full sm:max-w-xl md:max-w-[540px] bg-[#FAF9F5] h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-amber-200/60 transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-heading"
      >
        {/* Drawer Header */}
        <div className="px-5 sm:px-6 py-4 bg-white border-b border-amber-200/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {step > 1 && step < 6 && (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <h2 id="drawer-heading" className="font-serif font-bold text-base sm:text-lg text-stone-800 truncate">
                {step === 6 ? 'Booking Confirmed' : activeService?.name || 'Book Darshan'}
              </h2>
              <p className="text-[11px] text-stone-500 truncate">
                {temple?.name} · {temple?.city}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Linear Step Progress Indicator (Steps 1 to 5) */}
        {step < 6 && (
          <div className="bg-amber-50/60 border-b border-amber-200/40 px-5 sm:px-6 py-2.5 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 min-w-max">
              {[
                { s: 1, label: 'Service' },
                { s: 2, label: 'Date' },
                { s: 3, label: 'Slot' },
                { s: 4, label: 'Details' },
                { s: 5, label: 'Review' },
              ].map((item, idx) => (
                <React.Fragment key={item.s}>
                  <button
                    type="button"
                    disabled={step < item.s}
                    onClick={() => setStep(item.s)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors cursor-pointer disabled:cursor-default ${
                      step === item.s
                        ? 'bg-amber-600 text-white font-bold shadow-2xs'
                        : step > item.s
                        ? 'text-amber-800 hover:text-amber-900 font-medium'
                        : 'text-stone-400'
                    }`}
                  >
                    <span>{item.s}.</span>
                    <span>{item.label}</span>
                  </button>
                  {idx < 4 && <span className="text-stone-300">›</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-rose-400 hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 1: SERVICE SELECTION                                  */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-800">
                  Select an Offering / Seva
                </h3>
                <p className="text-xs text-stone-500">
                  Choose from active sacred poojas, sevas, and darshans.
                </p>
              </div>

              <div className="space-y-3">
                {services.map((service) => {
                  const isSelected = selectedServiceId === service._id;
                  const priceLabel = service.price === 0 ? 'Free' : `₹${service.price}`;

                  return (
                    <div
                      key={service._id}
                      onClick={() => service._id && handleServiceSelect(service._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs ${
                        isSelected
                          ? 'border-amber-600 ring-2 ring-amber-600/20'
                          : 'border-amber-200/70 hover:border-amber-400'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                            {service.type}
                          </span>
                          {service.duration !== undefined && service.duration > 0 && (
                            <span className="text-[10px] text-stone-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {service.duration} mins
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-stone-800">
                          {service.name}
                        </h4>
                        {service.description && (
                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-serif font-bold text-base text-amber-700">
                          {priceLabel}
                        </div>
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold text-amber-700 flex items-center justify-end gap-0.5"
                        >
                          <span>Select</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 2: DATE CALENDAR                                      */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-800">
                  Select Darshan Date
                </h3>
                <p className="text-xs text-stone-500">
                  Dates with green indicators are open for booking.
                </p>
              </div>

              {/* Service Quick Switcher Header */}
              <div className="bg-white p-3.5 rounded-2xl border border-amber-200/60 shadow-2xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                    Selected Service
                  </span>
                  <div className="font-serif font-bold text-xs sm:text-sm text-stone-800 truncate">
                    {activeService?.name}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-serif font-bold text-sm text-amber-700">
                    {activeService?.price === 0 ? 'Free' : `₹${activeService?.price}`}
                  </span>
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-amber-700 hover:underline font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Booking Calendar */}
              <BookingCalendar
                templeId={temple?._id || ''}
                serviceId={selectedServiceId}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                className="shadow-2xs"
              />
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 3: TIME SLOTS                                         */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-stone-800">
                    Select Time Slot
                  </h3>
                  <p className="text-xs text-stone-500">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-amber-700 hover:underline font-semibold cursor-pointer"
                >
                  Change Date
                </button>
              </div>

              {/* Slots List */}
              <div className="space-y-2.5">
                {isSlotsLoading || isSlotsFetching ? (
                  <div className="py-10 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 text-amber-600 animate-spin mx-auto" />
                    <p className="text-xs text-stone-500">Loading available time slots...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-10 text-center text-xs text-stone-400 space-y-2 bg-white rounded-2xl border border-amber-200/60 p-6">
                    <AlertCircle className="w-7 h-7 text-stone-300 mx-auto" />
                    <p className="font-semibold text-stone-700">No slots available on this date</p>
                    <p className="text-[11px] text-stone-400">
                      The temple authority has not opened bookings for this date or all slots are full.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
                    >
                      Pick Another Date
                    </button>
                  </div>
                ) : (
                  availableSlots.map((slot) => {
                    const slotCapacity = slot.capacity || 0;
                    const slotAvailableSeats = slot.availableSeats !== undefined ? slot.availableSeats : Math.max(0, slotCapacity - (slot.bookedCount || 0));
                    const isAvailable = Boolean(slot.isAvailable && slotAvailableSeats > 0);
                    const slotIdentifier = slot._id || slot.slotId || slot.timeSlotId || '';
                    const isSelected = slotIdentifier === selectedSlotId;

                    return (
                      <button
                        key={slotIdentifier}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedSlotId(slotIdentifier);
                          setErrorMessage('');
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          !isAvailable
                            ? 'bg-stone-50 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-amber-500/10 border-amber-600 ring-2 ring-amber-600/20 text-stone-900 shadow-xs'
                            : 'bg-white border-amber-200/70 hover:border-amber-400 text-stone-800 cursor-pointer shadow-2xs'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>
                              {slot.startTime} {slot.endTime ? `– ${slot.endTime}` : ''}
                            </span>
                          </div>
                          <div className="text-[11px]">
                            {isAvailable ? (
                              <span className="text-emerald-700 font-medium">
                                🟢 {slotAvailableSeats} of {slotCapacity} slots left
                              </span>
                            ) : (
                              <span className="text-rose-600 font-medium">🔴 Fully Booked</span>
                            )}
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border ${isAvailable ? 'border-emerald-500 bg-emerald-50' : 'border-stone-300'}`} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 4: DEVOTEE DETAILS                                    */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-800">
                  Devotee Information
                </h3>
                <p className="text-xs text-stone-500">
                  Enter devotee details required for entry and verification.
                </p>
              </div>

              {/* Authentication check: if visitor is not logged in as Devotee */}
              {!user ? (
                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto text-amber-700">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-amber-900">
                    Please sign in to continue with your booking
                  </h4>
                  <p className="text-xs text-amber-800/90 max-w-sm mx-auto leading-relaxed">
                    You need a devotee account to reserve slots, receive sacred tickets, and make payments.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Link
                      to={`${ROUTES.LOGIN}?redirect=/temples/${temple?.slug}`}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to={`${ROUTES.REGISTER}?redirect=/temples/${temple?.slug}`}
                      className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-amber-200 text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProceedToReview} className="space-y-4">
                  {/* Quantity Controller */}
                  <div className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">
                        Number of Devotees
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Max 6 devotees per booking
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-xl border border-amber-200 text-stone-700 flex items-center justify-center font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-50 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-serif font-bold text-sm text-stone-800 w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        disabled={quantity >= Math.min(6, selectedSlot?.availableSeats || 6)}
                        onClick={() => setQuantity((q) => Math.min(6, q + 1))}
                        className="w-8 h-8 rounded-xl border border-amber-200 text-stone-700 flex items-center justify-center font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-50 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Devotees Forms */}
                  {devotees.map((devotee, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-700" />
                          Devotee #{index + 1} {index === 0 && '(Primary Devotee)'}
                        </span>

                        {index === 0 && devoteeProfile?.name && (
                          <button
                            type="button"
                            onClick={() => handleAutofillDevotee(0)}
                            className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                          >
                            Autofill My Details
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={devotee.name}
                            onChange={(e) => handleDevoteeChange(index, 'name', e.target.value)}
                            placeholder="Full name as on ID"
                            className="w-full px-3 py-2 bg-[#FCFBF7] border border-amber-200/80 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Age *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="120"
                            value={devotee.age}
                            onChange={(e) => handleDevoteeChange(index, 'age', e.target.value)}
                            placeholder="Age"
                            className="w-full px-3 py-2 bg-[#FCFBF7] border border-amber-200/80 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Gender *
                          </label>
                          <select
                            value={devotee.gender}
                            onChange={(e) => handleDevoteeChange(index, 'gender', e.target.value as DevoteeGender)}
                            className="w-full px-3 py-2 bg-[#FCFBF7] border border-amber-200/80 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            ID Proof Type
                          </label>
                          <select
                            value={devotee.idType}
                            onChange={(e) => handleDevoteeChange(index, 'idType', e.target.value as DevoteeIdType | 'PAN')}
                            className="w-full px-3 py-2 bg-[#FCFBF7] border border-amber-200/80 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="AADHAAR">Aadhaar Card</option>
                            <option value="VOTER_ID">Voter ID</option>
                            <option value="PAN">PAN Card</option>
                            <option value="PASSPORT">Passport</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            ID Proof Number
                          </label>
                          <input
                            type="text"
                            value={devotee.idNumber}
                            onChange={(e) => handleDevoteeChange(index, 'idNumber', e.target.value)}
                            placeholder="Optional ID Number"
                            className="w-full px-3 py-2 bg-[#FCFBF7] border border-amber-200/80 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </form>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 5: REVIEW & PAYMENT                                   */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-800">
                  Review & Confirm Booking
                </h3>
                <p className="text-xs text-stone-500">
                  Please review your booking details before proceeding to payment.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-amber-200/70 p-5 space-y-4 shadow-2xs text-xs">
                {/* Temple & Service Header */}
                <div className="flex items-start justify-between border-b border-amber-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Temple & Kshetra
                    </span>
                    <h4 className="font-serif font-bold text-base text-stone-800">
                      {temple?.name}
                    </h4>
                    <p className="text-stone-500 text-[11px]">
                      {temple?.city}, {temple?.state}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-amber-700 hover:underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-amber-100">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Offering</span>
                    <span className="font-semibold text-stone-800 text-xs">
                      {activeService?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Type</span>
                    <span className="font-semibold text-stone-800 text-xs">
                      {activeService?.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Date</span>
                    <span className="font-semibold text-stone-800 text-xs">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Time Slot</span>
                    <span className="font-semibold text-stone-800 text-xs">
                      {selectedSlot?.startTime} {selectedSlot?.endTime ? `– ${selectedSlot?.endTime}` : ''}
                    </span>
                  </div>
                </div>

                {/* Devotees List Preview */}
                <div className="space-y-1.5 pb-3 border-b border-amber-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Devotees ({quantity})
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-xs text-amber-700 hover:underline font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  {devotees.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-stone-700 text-[11px]">
                      <span>
                        #{i + 1} {d.name} ({d.age} yrs, {d.gender?.toLowerCase()})
                      </span>
                      <span className="text-stone-400">{d.idType}</span>
                    </div>
                  ))}
                </div>

                {/* Price Calculation Breakdown */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Offering Fee (₹{activeService?.price || 0} × {quantity})</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Convenience / DevaSetu Platform Fee</span>
                    <span className="text-emerald-700 font-semibold">Free</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-stone-800 pt-2 border-t border-amber-100">
                    <span>Total Payable</span>
                    <span className="font-serif text-lg text-amber-700">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 6: BOOKING SUCCESS                                    */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === 6 && confirmedBookingData && (
            <div className="space-y-5 text-center py-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl text-stone-800">
                  Booking Confirmed!
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  May the divine blessings of {temple?.name} be with you.
                </p>
              </div>

              {/* Confirmation Card */}
              <div className="bg-white rounded-2xl border border-amber-200/70 p-5 text-left space-y-3.5 shadow-2xs text-xs">
                {/* Reference Code */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Booking Reference
                    </span>
                    <span className="font-mono font-bold text-sm text-stone-900">
                      {confirmedBookingData?.booking?.bookingReference || 'DS-CONFIRMED'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(confirmedBookingData?.booking?.bookingReference)}
                    className="p-1.5 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-100/70 transition-colors cursor-pointer"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-stone-700">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Temple</span>
                    <span className="font-semibold text-xs truncate block">{temple?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Offering</span>
                    <span className="font-semibold text-xs truncate block">{activeService?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Date & Time</span>
                    <span className="font-semibold text-xs block">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' · '}
                      {selectedSlot?.startTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Devotees</span>
                    <span className="font-semibold text-xs block">{quantity} Person(s)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Amount Paid</span>
                    <span className="font-serif font-bold text-xs text-amber-700 block">
                      ₹{confirmedBookingData?.booking?.totalAmount !== undefined ? confirmedBookingData.booking.totalAmount : totalAmount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Status</span>
                    <span className="font-semibold text-emerald-700 text-xs block">CONFIRMED</span>
                  </div>
                </div>

                {/* Booking QR Code - Real Scannable Gate Pass */}
                {(() => {
                  const bDoc = confirmedBookingData?.booking;
                  const token =
                    bDoc?.qrVerificationToken ||
                    (typeof bDoc?.qrCode === 'string' ? bDoc.qrCode : bDoc?.qrCode?.code);

                  const origin =
                    typeof window !== 'undefined' && window.location?.origin
                      ? window.location.origin
                      : (import.meta.env.VITE_APP_URL || 'http://localhost:5173');

                  const qrPayload = token ? `${origin}/booking/verify/${token}` : '';

                  return (
                    <div className="pt-3 border-t border-amber-100 flex flex-col items-center text-center space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                        <QrCode className="w-4 h-4 text-amber-700" />
                        <span>Booking QR Code</span>
                      </div>

                      {qrPayload ? (
                        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs inline-block">
                          <div className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] flex items-center justify-center">
                            <QRCode
                              value={qrPayload}
                              size={200}
                              level="M"
                              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-stone-600 text-xs">
                          <p>QR code could not be generated.</p>
                          <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-2 text-amber-700 font-semibold underline text-xs cursor-pointer"
                          >
                            Try Again
                          </button>
                        </div>
                      )}

                      <span className="text-[11px] text-stone-500 font-medium">
                        Scan for Temple Gate Verification
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="px-5 sm:px-6 py-4 bg-white border-t border-amber-200/60 shrink-0">
          {step === 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">Step 1 of 5</span>
              <button
                type="button"
                disabled={!selectedServiceId}
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Continue to Date</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!selectedDate}
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Select Time Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                ← Change Date
              </button>
              <button
                type="button"
                disabled={!selectedSlotId}
                onClick={() => setStep(4)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Continue to Devotee Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                ← Change Slot
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={handleProceedToReview}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  to={`${ROUTES.LOGIN}?redirect=/temples/${temple?.slug}`}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Sign in to continue</span>
                  <LogIn className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setStep(4)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={isProcessingPayment || isSubmittingBooking || isCreatingOrder || isVerifyingPayment}
                onClick={handleConfirmAndPay}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment || isSubmittingBooking || isCreatingOrder || isVerifyingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Confirming Booking...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>{totalAmount === 0 ? 'Confirm Free Booking' : `Pay ₹${totalAmount} via Razorpay`}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 6 && (
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.MY_BOOKINGS}
                className="flex-1 py-2.5 px-4 bg-[#FCFBF7] hover:bg-amber-50 text-stone-800 border border-amber-200/80 rounded-xl text-xs font-semibold text-center transition-colors shadow-2xs"
              >
                View My Bookings
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold text-center transition-colors shadow-xs cursor-pointer"
              >
                Done / Back to Temple
              </button>
            </div>
          )}
        </div>

        {/* Unsaved Changes Confirmation Modal */}
        {showCloseConfirm && (
          <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xl max-w-xs w-full space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto text-amber-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-sm text-stone-800">
                Leave Booking?
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                You have an incomplete booking. Are you sure you want to close?
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleForceClose}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TempleBookingDrawer;
