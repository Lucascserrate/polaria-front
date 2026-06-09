import { axiosInstance } from '@/lib/axios';

export type SettingsResponse = {
  polariaName: string;
  workingDays: boolean[];
  openingHours: { from: string; to: string } | null;
  aiEnabled: boolean;
};

export type UpdateSettingsPayload = {
  polariaName?: string;
  workingDays?: boolean[];
  openingHours?: { from: string; to: string };
  aiEnabled?: boolean;
};

export const getSettings = async (): Promise<SettingsResponse> => {
  const { data } = await axiosInstance.get<{
    polariaName: string;
    workingDays: boolean[];
    openingHours: { from: string; to: string } | null;
    aiEnabled: boolean;
  }>('/settings');

  return {
    polariaName: data.polariaName,
    workingDays: data.workingDays,
    openingHours: data.openingHours,
    aiEnabled: data.aiEnabled,
  };
};

export const updateSettings = async (
  payload: UpdateSettingsPayload,
): Promise<SettingsResponse> => {
  const { data } = await axiosInstance.patch<{
    polariaName: string;
    workingDays: boolean[];
    openingHours: { from: string; to: string } | null;
    aiEnabled: boolean;
  }>('/settings', {
    polariaName: payload.polariaName,
    workingDays: payload.workingDays,
    openingHours: payload.openingHours,
    aiEnabled: payload.aiEnabled,
  });

  return {
    polariaName: data.polariaName,
    workingDays: data.workingDays,
    openingHours: data.openingHours,
    aiEnabled: data.aiEnabled,
  };
};
