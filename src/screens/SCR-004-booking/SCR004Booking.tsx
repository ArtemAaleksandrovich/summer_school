import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { slotsApi, bookingsApi } from '../../api';
import { Button } from '../../components/ui';
import { BS002BookingSuccess } from '../../components/bottom-sheets/BS-002-booking-success/BS002BookingSuccess';
import { calculateTotalPrice, formatPrice } from '../../logic/LOGIC-003-pricing';
import { generateUUID } from '../../utils/uuid';
import { formatFullDate, formatTime } from '../../utils/date';
import { ApiError } from '../../utils/apiError';

export const SCR004Booking: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { slotId } = route.params;
  const [rentalGearNeeded, setRentalGearNeeded] = useState(false);
  const [shoeSize, setShoeSize] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  
  const { data: slot, isLoading } = useQuery({
    queryKey: ['slot', slotId],
    queryFn: () => slotsApi.getSlotById(slotId)
  });
  
  const totalPrice = slot ? calculateTotalPrice(slot, rentalGearNeeded) : 0;
  
  const handleConfirm = async () => {
    if (!slot) return;
    
    if (rentalGearNeeded && !shoeSize) {
      Alert.alert('Ошибка', 'Выберите размер скальников');
      return;
    }
    
    setLoading(true);
    const idempotencyKey = generateUUID();
    
    try {
      await bookingsApi.createBooking(
        {
          slot_id: slotId,
          rental_gear_needed: rentalGearNeeded,
          shoe_size: shoeSize
        },
        idempotencyKey
      );
      
      setSuccessVisible(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          Alert.alert('Ошибка', 'Места закончились');
          navigation.goBack();
        } else if (err.status === 422) {
          Alert.alert('Ошибка', 'Нет нужного размера. Попробуйте выбрать другой или без проката');
        } else {
          Alert.alert('Ошибка', err.message);
        }
      } else {
        Alert.alert('Ошибка', 'Не удалось создать бронь');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoading || !slot) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.slotSummary}>
          <Text style={styles.summaryTitle}>{formatFullDate(slot.start_time)}</Text>
          <Text style={styles.summaryTime}>{formatTime(slot.start_time)}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryBadge}>
              {slot.format === 'BOULDERING' ? 'Болдеринг' : 'Трассы'}
            </Text>
            <Text style={styles.summaryInstructor}>👤 {slot.instructor.name}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Снаряжение</Text>
          
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, !rentalGearNeeded && styles.radioButtonSelected]}
              onPress={() => setRentalGearNeeded(false)}
            >
              <View style={[styles.radioDot, !rentalGearNeeded && styles.radioDotSelected]} />
              <Text style={styles.radioText}>Своё снаряжение</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.radioButton, rentalGearNeeded && styles.radioButtonSelected]}
              onPress={() => setRentalGearNeeded(true)}
            >
              <View style={[styles.radioDot, rentalGearNeeded && styles.radioDotSelected]} />
              <Text style={styles.radioText}>
                Взять в прокат (+{formatPrice(slot.rental_gear.shoes_price + slot.rental_gear.harness_price)})
              </Text>
            </TouchableOpacity>
          </View>
          
          {rentalGearNeeded && (
            <View style={styles.sizePicker}>
              <Text style={styles.sizePickerTitle}>Размер скальников</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sizeOptions}>
                  {slot.rental_gear.available_sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizeOption, shoeSize === size && styles.sizeOptionSelected]}
                      onPress={() => setShoeSize(size)}
                    >
                      <Text style={[styles.sizeOptionText, shoeSize === size && styles.sizeOptionTextSelected]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
        
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>💰 Стоимость</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Тренировка:</Text>
            <Text style={styles.priceValue}>{formatPrice(slot.base_price)}</Text>
          </View>
          
          {rentalGearNeeded && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Прокат снаряжения:</Text>
              <Text style={styles.priceValue}>
                {formatPrice(slot.rental_gear.shoes_price + slot.rental_gear.harness_price)}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Итого к оплате на месте:</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Подтвердить бронь"
          onPress={handleConfirm}
          loading={loading}
        />
      </View>
      
      <BS002BookingSuccess
        visible={successVisible}
        slotStartTime={slot.start_time}
        onClose={() => {
          setSuccessVisible(false);
          navigation.goBack();
        }}
        onViewBookings={() => {
          setSuccessVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }]
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100
  },
  slotSummary: {
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4
  },
  summaryTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryBadge: {
    fontSize: 14,
    color: '#0055A5',
    fontWeight: '600'
  },
  summaryInstructor: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16
  },
  radioGroup: {
    gap: 12
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12
  },
  radioButtonSelected: {
    borderColor: '#0055A5',
    backgroundColor: '#F0F7FF'
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12
  },
  radioDotSelected: {
    borderColor: '#0055A5',
    backgroundColor: '#0055A5'
  },
  radioText: {
    fontSize: 16,
    color: '#1A1A1A'
  },
  sizePicker: {
    marginTop: 16
  },
  sizePickerTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: 8
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8
  },
  sizeOptionSelected: {
    borderColor: '#0055A5',
    backgroundColor: '#F0F7FF'
  },
  sizeOptionText: {
    fontSize: 16,
    color: '#1A1A1A'
  },
  sizeOptionTextSelected: {
    color: '#0055A5',
    fontWeight: '600'
  },
  priceSection: {
    marginBottom: 24
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  priceLabel: {
    fontSize: 14,
    color: '#666'
  },
  priceValue: {
    fontSize: 14,
    color: '#1A1A1A'
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B00'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  }
});