import { Slot, SlotFilters } from '../types';

/**
 * LOGIC-005: Фильтрация слотов
 * Семантика: OR внутри группы, AND между группами
 */
export const filterSlots = (slots: Slot[], filters: SlotFilters): Slot[] => {
  let filtered = [...slots];
  
  // Фильтрация по дате
  if (filters.date_from) {
    const fromDate = new Date(filters.date_from);
    filtered = filtered.filter(s => new Date(s.start_time) >= fromDate);
  }
  
  if (filters.date_to) {
    const toDate = new Date(filters.date_to);
    toDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(s => new Date(s.start_time) <= toDate);
  }
  
  // Фильтрация по формату (OR)
  if (filters.format && filters.format.length > 0) {
    filtered = filtered.filter(s => filters.format!.includes(s.format));
  }
  
  // Фильтрация по инструктору (OR)
  if (filters.instructor_id && filters.instructor_id.length > 0) {
    filtered = filtered.filter(s => filters.instructor_id!.includes(s.instructor.id));
  }
  
  return filtered;
};