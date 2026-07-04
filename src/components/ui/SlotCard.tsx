import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Slot } from '../../types';
import { formatTime, formatFullDate } from '../../utils/date';
interface SlotCardProps {
slot: Slot;
onPress: () => void;
}
export const SlotCard: React.FC<SlotCardProps> = ({ slot, onPress }) => {
const availablePlaces = slot.capacity - slot.booked_count;
const isLowAvailability = availablePlaces <= 3;
return (
<TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
<View style={styles.header}>
<Text style={styles.time}>{formatTime(slot.start_time)}</Text>
<View style={[styles.badge, slot.format === 'BOULDERING' ? styles.badgeBouldering : styles.badgeRope]}>
<Text style={styles.badgeText}>
{slot.format === 'BOULDERING' ? 'Болдеринг' : 'Трассы'}
</Text>
</View>
</View>
<View style={styles.instructor}>
    <Image source={{ uri: slot.instructor.photo_url }} style={styles.avatar} />
    <Text style={styles.instructorName}>{slot.instructor.name}</Text>
    <Text style={styles.rating}>⭐ {slot.instructor.rating}</Text>
  </View>
  
  <View style={styles.footer}>
    <Text style={[styles.places, isLowAvailability && styles.placesLow]}>
      Свободно {availablePlaces} из {slot.capacity}
    </Text>
    {slot.rental_gear.is_available && (
      <Text style={styles.rental}>👟 Прокат</Text>
    )}
  </View>
</TouchableOpacity>
);
};
const styles = StyleSheet.create({
container: {
backgroundColor: '#fff',
borderRadius: 16,
padding: 16,
marginBottom: 12,
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 12
},
time: {
fontSize: 24,
fontWeight: '700',
color: '#1A1A1A'
},
badge: {
paddingHorizontal: 12,
paddingVertical: 6,
borderRadius: 8
},
badgeBouldering: {
backgroundColor: '#E3F2FD'
},
badgeRope: {
backgroundColor: '#FFF3E0'
},
badgeText: {
fontSize: 12,
fontWeight: '600',
color: '#0055A5'
},
instructor: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 12
},
avatar: {
width: 32,
height: 32,
borderRadius: 16,
marginRight: 8
},
instructorName: {
fontSize: 14,
color: '#666',
flex: 1
},
rating: {
fontSize: 14,
color: '#666'
},
footer: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center'
},
places: {
fontSize: 14,
color: '#2ECC71',
fontWeight: '500'
},
placesLow: {
color: '#F39C12'
},
rental: {
fontSize: 14,
color: '#2ECC71'
}
});
