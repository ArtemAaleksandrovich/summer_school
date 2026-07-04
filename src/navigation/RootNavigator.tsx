import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { SCR001Registration } from '../screens/SCR-001-registation/SCR001Registration';
import { SCR002SlotList } from '../screens/SCR-002-slot-list/SCR002SlotList';
import { SCR004Booking } from '../screens/SCR-004-booking/SCR004Booking';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Заглушка для вкладки "Мои записи"
const MyBookingsPlaceholder: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, color: '#666' }}>Мои записи (в разработке)</Text>
  </View>
);

// Заглушка для вкладки "Профиль"
const ProfilePlaceholder: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, color: '#666' }}>Профиль (в разработке)</Text>
  </View>
);

// Стек вкладки "Расписание"
const ScheduleStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="SCR002SlotList" component={SCR002SlotList} />
      <Stack.Screen
        name="SCR004Booking"
        component={SCR004Booking}
        options={{
          headerShown: true,
          title: 'Оформление брони',
          headerBackTitle: 'Назад'
        }}
      />
    </Stack.Navigator>
  );
};

// Main Tabs (после авторизации)
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0055A5',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          borderTopColor: '#E0E0E0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60
        }
      }}
    >
      <Tab.Screen
        name="Расписание"
        component={ScheduleStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📅</Text>
        }}
      />
      <Tab.Screen
        name="Мои записи"
        component={MyBookingsPlaceholder}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📋</Text>
        }}
      />
      <Tab.Screen
        name="Профиль"
        component={ProfilePlaceholder}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
};

// Корневой навигатор
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, loadTokens } = useAuthStore();

  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SCR001Registration" component={SCR001Registration} />
        </Stack.Navigator>
      ) : (
        <MainTabs />
      )}
    </NavigationContainer>
  );
};