// FR-009, Data Model
export interface Instructor {
  id: string;
  name: string;
  photo_url: string;
  rating: number;
}

export interface RentalGear {
  is_available: boolean;
  shoes_price: number;
  harness_price: number;
  available_sizes: number[];
}

export interface Slot {
  id: string;
  start_time: string; // ISO8601
  duration_minutes: number;
  format: 'BOULDERING' | 'ROPE';
  instructor: Instructor;
  capacity: number;
  booked_count: number;
  rental_gear: RentalGear;
  base_price: number;
  address: string;
  status: 'SCHEDULED' | 'CANCELLED_BY_ORGANIZER';
}

export interface Booking {
  id: string;
  slot_id: string;
  client_id: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'LATE_CANCELLED' | 'CANCELLED_BY_ORGANIZER' | 'COMPLETED';
  rental_gear_needed: boolean;
  shoe_size?: number;
  total_price: number;
  created_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface SlotFilters {
  date_from?: string;
  date_to?: string;
  format?: ('BOULDERING' | 'ROPE')[];
  instructor_id?: string[];
}

export interface BookingCreateRequest {
  slot_id: string;
  rental_gear_needed: boolean;
  shoe_size?: number;
}

export interface OtpResponse {
  otp_id: string;
  ttl: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface PaginationMeta {
  total: number;
  has_more: boolean;
}

export interface SlotListResponse {
  slots: Slot[];
  meta: PaginationMeta;
}