'use client';

import { Clock, TriangleAlert } from 'lucide-react';
import { useSessionActor } from '@/modules/auth/hooks/useAuth';
import { isAdminRole } from '@/modules/auth/session';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';

/**
 * Solo aparece cuando hay algo que decir: durante la prueba y cuando venció. Un
 * negocio que todavía no conectó WhatsApp no tiene prueba de la que hablar, y
 * uno con suscripción paga no necesita que se lo recuerden.
 *
 * Los días salen del backend, que los deriva de la fecha de fin. Acá no se
 * calcula nada: sería una segunda cuenta que puede no coincidir.
 */
const TrialStatus: React.FC = () => {
	/*
	 * El rol se pregunta acá adentro y no lo decide quien lo dibuja.
	 *
	 * La agenda no tiene guarda de rol —simplemente no está en el menú del
	 * profesional—, así que un profesional que escriba la ruta llega igual, y el
	 * endpoint de onboarding es de administración: le responde 403. Con el gate
	 * afuera, esto dependía de que cada lugar que lo use se acuerde de la regla;
	 * adentro, no hay forma de usarlo mal.
	 */
	const { actor } = useSessionActor();
	const isAdmin = isAdminRole(actor?.role);

	const { data } = useGetOnboardingStatus(isAdmin);
	const subscription = data?.subscription;

	if (!subscription) return null;

	if (subscription.state === 'TRIAL_ACTIVE') {
		const days = subscription.daysRemaining;

		/*
		 * Sin días no se dibuja nada, en lugar de escribir un cero.
		 *
		 * Antes acá había un `?? 0` y eso convirtió una falta de dato en un cartel
		 * que decía "Prueba gratuita · 0 días" a negocios que tenían días de
		 * sobra: el backend renombró el campo y el `??` tapó el hueco en silencio.
		 * Con la prueba en curso el backend siempre manda el número, así que no
		 * tenerlo significa que algo se rompió, y un cartel en blanco es mejor que
		 * uno que miente.
		 */
		if (days === null) return null;

		return (
			<div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/50 px-3 py-1.5 text-muted-foreground">
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
			<div className="flex shrink-0 items-center gap-2 border-b border-amber-500/50 bg-amber-500/10 px-3 py-1.5">
				<TriangleAlert className="h-3.5 w-3.5 shrink-0 text-warning" />
				<p className="text-xs text-muted-foreground">
					<span className="font-medium text-warning">
						Tu prueba gratuita terminó
					</span>{' '}
					· Escribinos para seguir usando Polaria.
				</p>
			</div>
		);
	}

	return null;
};

export default TrialStatus;
