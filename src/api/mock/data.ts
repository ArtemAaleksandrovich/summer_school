import { Slot, Instructor, Booking } from '../../types';

// 5 инструкторов
export const mockInstructors: Instructor[] = [
  {
    id: 'instructor-1',
    name: 'Иван Петров',
    photo_url: 'https://i.pravatar.cc/150?u=ivan',
    rating: 4.8
  },
  {
    id: 'instructor-2',
    name: 'Анна Сидорова',
    photo_url: 'https://i.pravatar.cc/150?u=anna',
    rating: 4.9
  },
  {
    id: 'instructor-3',
    name: 'Дмитрий Кузнецов',
    photo_url: 'https://i.pravatar.cc/150?u=dmitry',
    rating: 4.5
  },
  {
    id: 'instructor-4',
    name: 'Елена Морозова',
    photo_url: 'https://i.pravatar.cc/150?u=elena',
    rating: 4.7
  },
  {
    id: 'instructor-5',
    name: 'Алексей Волков',
    photo_url: 'https://i.pravatar.cc/150?u=alexey',
    rating: 4.6
  }
];

// Генерация слотов на 7 дней
const generateMockSlots = (): Slot[] => {
  const slots: Slot[] = [];
  const today = new Date();
  
  const formats: Array<'BOULDERING' | 'ROPE'> = ['BOULDERING', 'ROPE'];
  const timeSlots = ['18:00', '19:30', '21:00'];
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    // 3-4 слота в день
    const slotsPerDay = 3 + Math.floor(Math.random() * 2);
    
    for (let slotIdx = 0; slotIdx < slotsPerDay; slotIdx++) {
      const time = timeSlots[slotIdx % timeSlots.length];
      const [hours, minutes] = time.split(':').map(Number);
      
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      
      const format = formats[Math.floor(Math.random() * formats.length)];
      const instructor = mockInstructors[Math.floor(Math.random() * mockInstructors.length)];
      const capacity = format === 'BOULDERING' ? 8 : 16;
      const bookedCount = Math.floor(Math.random() * capacity);
      
      const availableSizes = [];
      for (let size = 36; size <= 45; size++) {
        if (Math.random() > 0.3) {
          availableSizes.push(size);
        }
      }
      
      slots.push({
        id: `slot-${day}-${slotIdx}`,
        start_time: startTime.toISOString(),
        duration_minutes: 90,
        format,
        instructor,
        capacity,
        booked_count: bookedCount,
        rental_gear: {
          is_available: availableSizes.length > 0,
          shoes_price: 300,
          harness_price: 200,
          available_sizes: availableSizes
        },
        base_price: format === 'BOULDERING' ? 800 : 1000,
        address: 'ул. Спортивная, 15',
        status: 'SCHEDULED'
      });
    }
  }
  
  return slots;
};

export const mockSlots: Slot[] = generateMockSlots();
export const mockBookings: Booking[] = [];