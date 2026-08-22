'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/modules/auth/hooks/useAuth';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';
import { ROUTES } from '@/constants/routes';

/**
 * Decide a dónde entra alguien que abre Polaria.
 *
 * Tres destinos y no dos: sin sesión va a autenticarse; con sesión y el negocio
 * sin crear, a la configuración inicial; con el negocio creado, al panel.
 *
 * El estado se pregunta al backend en lugar de deducirlo de un booleano
 * guardado, así que un negocio que completó su información entra al panel sin que
 * nadie tenga que haber marcado nada.
 */
export default function HomeClient() {
	const router = useRouter();
	const { isLoading: authLoading, isError: notAuthenticated } = useAuth();

	// La consulta espera a la sesión: sin cookie válida devolvería 401 y el
	// interceptor de axios mandaría a /auth por su cuenta.
	const { data: onboarding, isLoading: statusLoading } =
		useGetOnboardingStatus();

	useEffect(() => {
		if (authLoading) return;

		if (notAuthenticated) {
			router.replace(ROUTES.auth);
			return;
		}

		if (statusLoading || !onboarding) return;

		router.replace(
			onboarding.businessSetupComplete ? ROUTES.agenda : ROUTES.onboarding,
		);
	}, [
		authLoading,
		notAuthenticated,
		statusLoading,
		onboarding,
		router,
	]);

	return null;
}
