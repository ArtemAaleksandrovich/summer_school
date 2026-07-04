import { mockApi } from './mock/handlers';
import { Slot, SlotFilters, SlotListResponse, Instructor } from '../types';

export const slotsApi = {
  getSlots: async (filters?: SlotFilters): Promise<SlotListResponse> => {
    return mockApi.slots.getSlots(filters);
  },
  
  getSlotById: async (slotId: string): Promise<Slot> => {
    return mockApi.slots.getSlotById(slotId);
  },
  
  getInstructors: async (): Promise<Instructor[]> => {
    return mockApi.slots.getInstructors();
  }
};