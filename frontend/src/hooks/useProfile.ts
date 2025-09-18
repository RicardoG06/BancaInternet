import { useQuery } from '@tanstack/react-query';
import { getApiService } from '../services/apiService';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  customerType: string;
  riskProfile: string;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
    };
    language: string;
    currency: string;
  };
}

export interface ProfileResponse {
  profile: UserProfile;
  correlationId: string;
}

export const useProfile = () => {
  return useQuery<ProfileResponse>(['profile'], async (): Promise<ProfileResponse> => {
    const apiService = getApiService();
    const response = await apiService.getProfile();
    return response as ProfileResponse;
  }, {
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useProfileData = () => {
  const { data, isLoading, error, refetch } = useProfile();
  
  return {
    profile: data?.profile,
    isLoading,
    error,
    refetch,
    isError: !!error,
  };
};
