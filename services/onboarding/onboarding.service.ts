import { axiosInstance } from '@/lib/axios';

/**
 * Estado de configuración del negocio.
 *
 * Se exporta porque lo cambian pantallas que no son esta: crear un servicio,
 * sumar un profesional o finalizar una cita. Sin invalidarla, el menú seguiría
 * ofreciendo "Empezar" con una lección que ya está hecha.
 */
export const ONBOARDING_KEY = ['onboarding', 'status'] as const;

export type OnboardingStep =
	| 'BUSINESS_INFO'
	| 'BUSINESS_HOURS'
	| 'SERVICES'
	| 'STAFF'
	| 'FIRST_APPOINTMENT';

export interface OnboardingStatus {
	steps: Record<OnboardingStep, boolean>;
	businessSetupComplete: boolean;
	polariaActivationComplete: boolean;
	/** Si un cliente podría reservar ahora. No exige el tipo de negocio. */
	readyForBookings: boolean;
	nextStep: OnboardingStep | null;
	/** Sugerencia, no paso: el progreso no lo cuenta y no bloquea nada. */
	whatsappConnected: boolean;
	subscription: {
		state:
			| 'NOT_STARTED'
			| 'TRIAL_ACTIVE'
			| 'TRIAL_EXPIRED'
			| 'ACTIVE'
			| 'EXPIRED'
			| 'CANCELED';
		trialDaysRemaining: number | null;
		hasAccess: boolean;
	};
}

export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
	const { data } =
		await axiosInstance.get<OnboardingStatus>('/onboarding/status');
	return data;
};
