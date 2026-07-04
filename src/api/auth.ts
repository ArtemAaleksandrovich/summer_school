import { mockApi } from './mock/handlers';
import { OtpResponse, TokenResponse } from '../types';

export const authApi = {
  requestOtp: async (phone: string): Promise<OtpResponse> => {
    return mockApi.auth.requestOtp(phone);
  },
  
  verifyOtp: async (otpId: string, code: string): Promise<TokenResponse> => {
    return mockApi.auth.verifyOtp(otpId, code);
  }
};