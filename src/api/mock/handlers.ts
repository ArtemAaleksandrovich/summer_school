import { delay } from '../../utils/delay';
import { generateUUID } from '../../utils/uuid';
import { ApiError } from '../../utils/apiError';
import { mockSlots, mockBookings, mockInstructors } from './data';
import { Slot, Booking, SlotFilters, BookingCreateRequest, OtpResponse, TokenResponse, SlotListResponse } from '../../types';

// Хранилище для идемпотентности
const idempotencyStore = new Map<string, any>();

// Хранилище для OTP
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Хранилище для rate limit
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const mockApi = {
  auth: {
    requestOtp: async (phone: string): Promise<OtpResponse> => {
      console.log('[MOCK] POST /auth/otp', { phone });
      await delay(500);
      
      // Rate limit проверка
      const now = Date.now();
      const rateLimit = rateLimitStore.get(phone);
      
      if (rateLimit && now < rateLimit.resetAt) {
        if (rateLimit.count >= 5) {
          throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Слишком много запросов', {
            retry_after: Math.ceil((rateLimit.resetAt - now) / 1000)
          });
        }
        rateLimit.count++;
      } else {
        rateLimitStore.set(phone, { count: 1, resetAt: now + 3600000 }); // 1 час
      }
      
      const otpId = generateUUID();
      const otpCode = '123456'; // Фиксированный код для тестирования
      
      otpStore.set(otpId, {
        code: otpCode,
        expiresAt: now + 300000 // 5 минут
      });
      
      console.log(`[MOCK] OTP для ${phone}: ${otpCode}`);
      
      return { otp_id: otpId, ttl: 300 };
    },
    
    verifyOtp: async (otpId: string, code: string): Promise<TokenResponse> => {
      console.log('[MOCK] POST /auth/verify', { otpId, code });
      await delay(300);
      
      const otp = otpStore.get(otpId);
      
      if (!otp) {
        throw new ApiError(410, 'OTP_EXPIRED', 'Срок действия кода истек');
      }
      
      if (Date.now() > otp.expiresAt) {
        otpStore.delete(otpId);
        throw new ApiError(410, 'OTP_EXPIRED', 'Срок действия кода истек');
      }
      
      if (otp.code !== code) {
        throw new ApiError(401, 'INVALID_OTP', 'Неверный код', { attempts_left: 3 });
      }
      
      otpStore.delete(otpId);
      
      return {
        access_token: 'mock-jwt-token-' + generateUUID(),
        refresh_token: 'mock-refresh-token-' + generateUUID(),
        expires_in: 900 // 15 минут
      };
    }
  },
  
  slots: {
    getSlots: async (filters?: SlotFilters): Promise<SlotListResponse> => {
      console.log('[MOCK] GET /slots', { filters });
      await delay(400);
      
      let slots = [...mockSlots];
      
      // Фильтрация по дате
      if (filters?.date_from) {
        const fromDate = new Date(filters.date_from);
        slots = slots.filter(s => new Date(s.start_time) >= fromDate);
      }
      
      if (filters?.date_to) {
        const toDate = new Date(filters.date_to);
        toDate.setHours(23, 59, 59, 999);
        slots = slots.filter(s => new Date(s.start_time) <= toDate);
      }
      
      // Фильтрация по формату (OR внутри группы)
      if (filters?.format && filters.format.length > 0) {
        slots = slots.filter(s => filters.format!.includes(s.format));
      }
      
      // Фильтрация по инструктору (OR внутри группы)
      if (filters?.instructor_id && filters.instructor_id.length > 0) {
        slots = slots.filter(s => filters.instructor_id!.includes(s.instructor.id));
      }
      
      // Сортировка по времени
      slots.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      return {
        slots,
        meta: {
          total: slots.length,
          has_more: false
        }
      };
    },
    
    getSlotById: async (slotId: string): Promise<Slot> => {
      console.log('[MOCK] GET /slots/' + slotId);
      await delay(300);
      
      const slot = mockSlots.find(s => s.id === slotId);
      
      if (!slot) {
        throw new ApiError(410, 'SLOT_NOT_FOUND', 'Слот не найден');
      }
      
      return slot;
    },
    
    getInstructors: async () => {
      console.log('[MOCK] GET /instructors');
      await delay(200);
      return mockInstructors;
    }
  },
  
  bookings: {
    createBooking: async (data: BookingCreateRequest, idempotencyKey: string): Promise<Booking> => {
      console.log('[MOCK] POST /bookings', { data, idempotencyKey });
      await delay(600);
      
      // Проверка идемпотентности
      if (idempotencyStore.has(idempotencyKey)) {
        console.log('[MOCK] Идемпотентный запрос, возвращаем кэшированный результат');
        return idempotencyStore.get(idempotencyKey);
      }
      
      const slot = mockSlots.find(s => s.id === data.slot_id);
      
      if (!slot) {
        throw new ApiError(410, 'SLOT_NOT_FOUND', 'Слот не найден');
      }
      
      // Проверка доступности мест
      if (slot.booked_count >= slot.capacity) {
        throw new ApiError(409, 'SLOT_FULL', 'Места закончились');
      }
      
      // Проверка дедлайна записи (30 минут)
      const startTime = new Date(slot.start_time);
      const now = new Date();
      const diffMinutes = (startTime.getTime() - now.getTime()) / 1000 / 60;
      
      if (diffMinutes < 30) {
        throw new ApiError(400, 'BOOKING_DEADLINE_PASSED', 'Запись закрыта за 30 мин до начала');
      }
      
      // Проверка проката
      if (data.rental_gear_needed) {
        if (!slot.rental_gear.is_available) {
          throw new ApiError(422, 'RENTAL_GEAR_UNAVAILABLE', 'Прокат недоступен');
        }
        
        if (data.shoe_size && !slot.rental_gear.available_sizes.includes(data.shoe_size)) {
          throw new ApiError(422, 'RENTAL_GEAR_UNAVAILABLE', 'Нет нужного размера', {
            missing_sizes: [data.shoe_size]
          });
        }
      }
      
      // Расчет цены
      let totalPrice = slot.base_price;
      if (data.rental_gear_needed) {
        totalPrice += slot.rental_gear.shoes_price + slot.rental_gear.harness_price;
      }
      
      // Создание брони
      const booking: Booking = {
        id: generateUUID(),
        slot_id: data.slot_id,
        client_id: 'mock-client-id',
        status: 'CONFIRMED',
        rental_gear_needed: data.rental_gear_needed,
        shoe_size: data.shoe_size,
        total_price: totalPrice,
        created_at: new Date().toISOString()
      };
      
      mockBookings.push(booking);
      
      // Увеличиваем booked_count
      slot.booked_count++;
      
      // Сохраняем для идемпотентности
      idempotencyStore.set(idempotencyKey, booking);
      
      return booking;
    }
  }
};