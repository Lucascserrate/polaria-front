import { axiosInstance } from '@/lib/axios';

export type SettingsResponse = {
  polariaName: string;
  workingDays: boolean[];
  openingHours: { from: string; to: string } | null;
};

export type UpdateSettingsPayload = {
  polariaName?: string;
  workingDays?: boolean[];
  openingHours?: { from: string; to: string };
};

export const getSettings = async (): Promise<SettingsResponse> => {
  const { data } = await axiosInstance.get<{
    polariaName: string;
    workingDays: boolean[];
    openingHours: { from: string; to: string } | null;
  }>('/settings');

  return {
    polariaName: data.polariaName,
    workingDays: data.workingDays,
    openingHours: data.openingHours,
  };
};

export const updateSettings = async (
  payload: UpdateSettingsPayload,
): Promise<SettingsResponse> => {
  const { data } = await axiosInstance.patch<{
    polariaName: string;
    workingDays: boolean[];
    openingHours: { from: string; to: string } | null;
  }>('/settings', {
    polariaName: payload.polariaName,
    workingDays: payload.workingDays,
    openingHours: payload.openingHours,
  });

  return {
    polariaName: data.polariaName,
    workingDays: data.workingDays,
    openingHours: data.openingHours,
  };
};
