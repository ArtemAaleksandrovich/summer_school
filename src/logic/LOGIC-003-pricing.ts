import { Slot } from '../types';

/**
 * LOGIC-003: Расчёт цены брони
 * Формула: total = base_price + (rental ? shoes_price + harness_price : 0)
 */
export const calculateTotalPrice = (
  slot: Slot,
  rentalGearNeeded: boolean
): number => {
  let total = slot.base_price;
  
  if (rentalGearNeeded) {
    total += slot.rental_gear.shoes_price + slot.rental_gear.harness_price;
  }
  
  return total;
};

export const formatPrice = (price: number): string => {
  return `${price}₽`;
};