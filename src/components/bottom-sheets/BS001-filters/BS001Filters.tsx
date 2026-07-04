import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { slotsApi } from '../../../api';
import { Button } from '../../ui';
import { useSlotsStore } from '../../../store/slotsStore';
import { Instructor } from '../../../types';

interface BS001FiltersProps {
  visible: boolean;
  onClose: () => void;
}

export const BS001Filters: React.FC<BS001FiltersProps> = ({ visible, onClose }) => {
  const { filters, setFilters, resetFilters } = useSlotsStore();
  const [selectedFormats, setSelectedFormats] = useState<('BOULDERING' | 'ROPE')[]>(filters.format || []);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(filters.instructor_id || []);
  
  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => slotsApi.getInstructors(),
    enabled: visible
  });
  
  const toggleFormat = (format: 'BOULDERING' | 'ROPE') => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };
  
  const toggleInstructor = (instructorId: string) => {
    setSelectedInstructors(prev =>
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };
  
  const handleApply = () => {
    setFilters({
      format: selectedFormats.length > 0 ? selectedFormats : undefined,
      instructor_id: selectedInstructors.length > 0 ? selectedInstructors : undefined
    });
    onClose();
  };
  
  const handleReset = () => {
    setSelectedFormats([]);
    setSelectedInstructors([]);
    resetFilters();
  };
  
  const hasActiveFilters = selectedFormats.length > 0 || selectedInstructors.length > 0;
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Фильтры</Text>
          {hasActiveFilters && (
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Сбросить</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Формат</Text>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => toggleFormat('BOULDERING')}
            >
              <View style={[styles.checkbox, selectedFormats.includes('BOULDERING') && styles.checkboxSelected]}>
                {selectedFormats.includes('BOULDERING') && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Болдеринг</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => toggleFormat('ROPE')}
            >
              <View style={[styles.checkbox, selectedFormats.includes('ROPE') && styles.checkboxSelected]}>
                {selectedFormats.includes('ROPE') && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Трассы с верёвкой</Text>
            </TouchableOpacity>
          </View>
          
          {instructors && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Инструктор</Text>
              
              {instructors.map((instructor: Instructor) => (
                <TouchableOpacity
                  key={instructor.id}
                  style={styles.checkboxRow}
                  onPress={() => toggleInstructor(instructor.id)}
                >
                  <View style={[styles.checkbox, selectedInstructors.includes(instructor.id) && styles.checkboxSelected]}>
                    {selectedInstructors.includes(instructor.id) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>{instructor.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
        
        <View style={styles.footer}>
          <Button title="Применить" onPress={handleApply} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  resetText: {
    fontSize: 16,
    color: '#0055A5',
    fontWeight: '500'
  },
  content: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxSelected: {
    backgroundColor: '#0055A5',
    borderColor: '#0055A5'
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1A1A1A'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  }
});