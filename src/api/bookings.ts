import { mockApi } from './mock/handlers';
import { Booking, BookingCreateRequest } from '../types';

export const bookingsApi = {
  createBooking: async (data: BookingCreateRequest, idempotencyKey: string): Promise<Booking> => {
    return mockApi.bookings.createBooking(data, idempotencyKey);
  }
};