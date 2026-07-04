import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';

/**
 * LOGIC-001: OTP-авторизация
 */
export const requestOtpCode = async (phone: string) => {
  return await authApi.requestOtp(phone);
};

export const verifyOtpCode = async (otpId: string, code: string) => {
  const tokens = await authApi.verifyOtp(otpId, code);
  const { setTokens } = useAuthStore.getState();
  await setTokens(tokens.access_token, tokens.refresh_token);
  return tokens;
};