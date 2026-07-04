import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Button } from '../../ui';
import { formatFullDate, formatTime } from '../../../utils/date';

interface BS002BookingSuccessProps {
  visible: boolean;
  slotStartTime?: string;
  onClose: () => void;
  onViewBookings: () => void;
}

export const BS002BookingSuccess: React.FC<BS002BookingSuccessProps> = ({
  visible,
  slotStartTime,
  onClose,
  onViewBookings
}) => {
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.title}>Ты записан!</Text>
          
          {slotStartTime && (
            <Text style={styles.details}>
              Ждём тебя {formatFullDate(slotStartTime)} в {formatTime(slotStartTime)}.{'\n'}
              Напоминание придёт за 2 часа.
            </Text>
          )}
          
          <Button
            title="Посмотреть мои записи"
            onPress={onViewBookings}
            style={styles.primaryButton}
          />
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center'
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12
  },
  details: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12
  },
  closeButton: {
    paddingVertical: 12
  },
  closeText: {
    fontSize: 16,
    color: '#666'
  }
});