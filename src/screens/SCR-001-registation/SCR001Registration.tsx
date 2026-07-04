import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, OtpInput } from '../../components/ui';
import { formatPhone, validatePhone, normalizePhone } from '../../utils/phone';
import { requestOtpCode, verifyOtpCode } from '../../logic/LOGIC-001-otp-auth';
import { ApiError } from '../../utils/apiError';

type Step = 'phone' | 'otp';

export const SCR001Registration: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);
  
  const handleRequestOtp = async () => {
    if (!validatePhone(phone)) {
      setError('Проверь номер телефона');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      const normalizedPhone = normalizePhone(phone);
      const response = await requestOtpCode(normalizedPhone);
      setOtpId(response.otp_id);
      setStep('otp');
      setTimer(60);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Слишком много запросов. Попробуйте позже');
        } else {
          setError('Не удалось отправить код');
        }
      } else {
        setError('Ошибка соединения');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOtp = async (code: string) => {
    if (!otpId) return;
    
    setError(null);
    setLoading(true);
    
    try {
      await verifyOtpCode(otpId, code);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }]
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(`Код не подошёл. Осталось попыток: ${err.details?.attempts_left || 3}`);
        } else if (err.status === 410) {
          setError('Код устарел. Запросите новый');
          setStep('phone');
        }
      } else {
        setError('Ошибка соединения');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}></Text>
        <Text style={styles.title}>Добро пожаловать в Вертикаль!</Text>
        
        {step === 'phone' ? (
          <>
            <Text style={styles.subtitle}>Введи номер телефона, и мы пришлём код</Text>
            <Input
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChangeText={(text) => {
                setPhone(formatPhone(text));
                setError(null);
              }}
              keyboardType="phone-pad"
              error={error || undefined}
              maxLength={18}
            />
            <Button
              title="Получить код"
              onPress={handleRequestOtp}
              loading={loading}
              disabled={phone.length < 18}
            />
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Введи код из SMS</Text>
            <OtpInput
              onCodeComplete={handleVerifyOtp}
              error={!!error}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            {timer > 0 ? (
              <Text style={styles.timerText}>Отправить код повторно через {timer}с</Text>
            ) : (
              <Button
                title="Отправить код снова"
                onPress={handleRequestOtp}
                variant="outline"
                loading={loading}
              />
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1A1A1A'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 16
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 24
  }
});