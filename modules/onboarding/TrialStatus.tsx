'use client';

import { Clock } from 'lucide-react';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';

/**
 * Estado de la prueba gratuita, en el pie del menú.
 *
 * Solo aparece cuando hay algo que decir: durante la prueba y cuando venció. Un
 * negocio que todavía no conectó WhatsApp no tiene prueba de la que hablar, y
 * uno con suscripción paga no necesita que se lo recuerden.
 *
 * Los días salen del backend, que los deriva de la fecha de fin. Acá no se
 * calcula nada: sería una segunda cuenta que puede no coincidir.
 */
const TrialStatus: React.FC = () => {
	const { data } = useGetOnboardingStatus();
	const subscription = data?.subscription;

	if (!subscription) return null;

	if (subscription.state === 'TRIAL_ACTIVE') {
		const days = subscription.trialDaysRemaining ?? 0;

		return (
			<div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-muted-foreground">
				<Clock className="h-3.5 w-3.5 shrink-0" />
				<span className="text-xs">
					Prueba gratuita ·{' '}
					<span className="font-semibold tabular-nums">
						{days} {days === 1 ? 'día' : 'días'}
					</span>
				</span>
			</div>
		);
	}

	if (subscription.state === 'TRIAL_EXPIRED') {
		return (
			<div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2">
				<p className="text-xs font-medium text-warning">
					Tu prueba gratuita terminó
				</p>
				<p className="mt-0.5 text-xs text-muted-foreground">
					Escribinos para seguir usando Polaria.
				</p>
			</div>
		);
	}

	return null;
};

export default TrialStatus;
