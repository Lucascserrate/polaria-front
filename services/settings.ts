import { axiosInstance } from '@/lib/axios';

export type SettingsResponse = {
  polariaName: string;
  workingDays: boolean[];
  openingHours: { from: string; to: string } | null;
  aiEnabled: boolean;
  whatsappConnection: {
    connected: boolean;
    businessId: string | null;
    wabaId: string | null;
    phoneNumberId: string | null;
    phoneNumber: string | null;
    connectedAt: string | null;
  };
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
    aiEnabled: boolean;
    whatsappConnection: SettingsResponse['whatsappConnection'];
  }>('/settings');

  return {
    polariaName: data.polariaName,
    workingDays: data.workingDays,
    openingHours: data.openingHours,
    aiEnabled: data.aiEnabled,
    whatsappConnection: data.whatsappConnection,
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
    whatsappConnection: SettingsResponse['whatsappConnection'];
  }>('/settings', {
    polariaName: payload.polariaName,
    workingDays: payload.workingDays,
    openingHours: payload.openingHours,
  });

  return {
    polariaName: data.polariaName,
    workingDays: data.workingDays,
    openingHours: data.openingHours,
    aiEnabled: data.aiEnabled,
    whatsappConnection: data.whatsappConnection,
  };
};

export type CompleteWhatsappEmbeddedSignupPayload = {
  code: string;
  redirectUri?: string;
  businessId?: string;
  wabaId?: string;
  phoneNumberId?: string;
  phoneNumber?: string;
  systemUserAccessToken?: string;
};

export const completeWhatsappEmbeddedSignup = async (
  payload: CompleteWhatsappEmbeddedSignupPayload,
): Promise<SettingsResponse> => {
  const { data } = await axiosInstance.patch<{
    polariaName: string;
    workingDays: boolean[];
    openingHours: { from: string; to: string } | null;
    aiEnabled: boolean;
    whatsappConnection: SettingsResponse['whatsappConnection'];
  }>('/settings/whatsapp/embedded-signup', payload);

  return {
    polariaName: data.polariaName,
    workingDays: data.workingDays,
    openingHours: data.openingHours,
    aiEnabled: data.aiEnabled,
    whatsappConnection: data.whatsappConnection,
  };
};
