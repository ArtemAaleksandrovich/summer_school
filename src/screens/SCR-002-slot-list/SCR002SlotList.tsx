import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { slotsApi } from '../../api';
import { SlotCard, SlotCardSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { BS001Filters } from '../../components/bottom-sheets/BS001-filters/BS001Filters';
import { getNext7Days, isSameDay } from '../../utils/date';
import { useSlotsStore } from '../../store/slotsStore';
import { Slot } from '../../types';

export const SCR002SlotList: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { selectedDate, setSelectedDate, filters } = useSlotsStore();
  const dates = getNext7Days();
  
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['slots', filters, selectedDate],
    queryFn: () => {
      const queryFilters = { ...filters };
      
      if (selectedDate) {
        const from = new Date(selectedDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(selectedDate);
        to.setHours(23, 59, 59, 999);
        queryFilters.date_from = from.toISOString();
        queryFilters.date_to = to.toISOString();
      }
      
      return slotsApi.getSlots(queryFilters);
    }
  });
  
  const slots = data?.slots || [];
  
  const renderSlot = ({ item }: { item: Slot }) => (
    <SlotCard
      slot={item}
      onPress={() => navigation.navigate('SCR004Booking', { slotId: item.id })}
    />
  );
  
  const renderDateChip = (date: Date, index: number) => {
    const isSelected = selectedDate ? isSameDay(date, selectedDate) : index === 0;
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.dateChip, isSelected && styles.dateChipSelected]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
          {dayNames[date.getDay()]}
        </Text>
        <Text style={[styles.dateChipNumber, isSelected && styles.dateChipNumberSelected]}>
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.dateScroller}>
        {dates.map((date, index) => renderDateChip(date, index))}
      </View>
    </View>
  );
  
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="На эти дни тренировок пока нет"
        description="Попробуйте выбрать другую дату"
      />
    );
  };
  
  if (isError && !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Расписание</Text>
        <TouchableOpacity onPress={() => setFiltersVisible(true)}>
          <Text style={styles.filterIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={slots}
        renderItem={renderSlot}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      />
      
      {isLoading && (
        <View style={styles.skeletonContainer}>
          <SlotCardSkeleton />
          <SlotCardSkeleton />
          <SlotCardSkeleton />
        </View>
      )}
      
      <BS001Filters
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  filterIcon: {
    fontSize: 24
  },
  header: {
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  dateScroller: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    minWidth: 60
  },
  dateChipSelected: {
    backgroundColor: '#0055A5'
  },
  dateChipText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  dateChipTextSelected: {
    color: '#fff'
  },
  dateChipNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  dateChipNumberSelected: {
    color: '#fff'
  },
  listContent: {
    padding: 16
  },
  skeletonContainer: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16
  }
});