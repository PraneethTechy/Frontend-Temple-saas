import type {
  Temple,
  Service,
  Booking,
  Payment,
  DevoteeGender,
  DevoteeIdType,
} from '@shared/types/index.js';

export interface TempleBookingDrawerTemple extends Partial<Temple> {
  _id: string;
  slug?: string;
  name?: string;
  city?: string;
  state?: string;
}

export interface TempleBookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  temple?: TempleBookingDrawerTemple | null;
  services?: Partial<Service>[];
  initialServiceId?: string;
  initialDate?: string;
  initialSlotId?: string;
}

export interface DevoteeFormState {
  name: string;
  age: string | number;
  gender: DevoteeGender;
  idType: DevoteeIdType | 'PAN';
  idNumber: string;
}

export interface DrawerSlotItem {
  timeSlotId?: string;
  slotId?: string;
  _id?: string;
  templeId?: string;
  serviceId?: string;
  date?: string;
  startTime: string;
  endTime?: string;
  capacity?: number;
  bookedCount?: number;
  availableSeats?: number;
  availableCount?: number;
  isAvailable?: boolean;
}

export interface ConfirmedBookingData {
  booking: Booking;
  temple?: {
    name?: string;
    city?: string;
    state?: string;
    slug?: string;
  };
  service?: {
    name?: string;
  };
  payment?: Payment;
}

export interface PaymentOrderData {
  orderId: string;
  amount: number;
  currency?: string;
  keyId: string;
  bookingReference?: string;
  bookingId?: string;
  totalAmount?: number;
  devoteeName?: string;
  devoteeEmail?: string;
  devoteePhone?: string;
}

export interface RazorpayErrorPayload {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}
