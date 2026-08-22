import { axiosInstance } from '@/lib/axios';

/**
 * Estado de configuración del negocio.
 *
 * Se exporta porque conectar WhatsApp lo cambia desde otra pantalla: sin
 * invalidarla, el menú seguiría ofreciendo "Empezar" con un paso que ya está
 * hecho.
 */
export const ONBOARDING_KEY = ['onboarding', 'status'] as const;

export type OnboardingStep =
	| 'BUSINESS_INFO'
	| 'BUSINESS_HOURS'
	| 'SERVICES'
	| 'STAFF'
	| 'WHATSAPP';

export interface OnboardingStatus {
	steps: Record<OnboardingStep, boolean>;
	businessSetupComplete: boolean;
	polariaActivationComplete: boolean;
	/** Si un cliente podría reservar ahora. No exige el tipo de negocio. */
	readyForBookings: boolean;
	nextStep: OnboardingStep | null;
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
	const { data } = await axiosInstance.get<OnboardingStatus>(
		'/onboarding/status',
	);
	return data;
};
