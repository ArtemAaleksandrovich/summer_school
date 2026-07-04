import { create } from 'zustand';
import { SlotFilters } from '../types';

interface SlotsState {
  selectedDate: Date | null;
  filters: SlotFilters;
  setSelectedDate: (date: Date | null) => void;
  setFilters: (filters: SlotFilters) => void;
  resetFilters: () => void;
}

export const useSlotsStore = create<SlotsState>((set) => ({
  selectedDate: null,
  filters: {},
  
  setSelectedDate: (date: Date | null) => {
    set({ selectedDate: date });
  },
  
  setFilters: (filters: SlotFilters) => {
    set({ filters });
  },
  
  resetFilters: () => {
    set({ filters: {} });
  }
}));