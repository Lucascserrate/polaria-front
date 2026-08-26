'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/modules/auth/hooks/useAuth';
import { actorOf, isAdminRole } from '@/modules/auth/session';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';
import { ROUTES } from '@/constants/routes';

/**
 * Decide a dónde entra alguien que abre Polaria.
 *
 * Cuatro destinos. Sin sesión, a autenticarse. Con sesión de un profesional, a su
 * agenda —y ahí se corta, sin preguntar por el onboarding: configurar el negocio no
 * es asunto suyo y el endpoint le responde 403—. Con sesión de quien administra, a
 * la configuración inicial si el negocio no está creado, o al panel si lo está.
 *
 * El estado se pregunta al backend en lugar de deducirlo de un booleano guardado,
 * así que un negocio que completó su información entra al panel sin que nadie tenga
 * que haber marcado nada.
 */
export default function HomeClient() {
	const router = useRouter();
	const {
		data: session,
		isLoading: authLoading,
		isError: notAuthenticated,
	} = useAuth();

	const actor = actorOf(session);
	const isAdmin = isAdminRole(actor?.role);

	/*
	 * El onboarding se pide solo cuando ya se sabe que quien entró administra.
	 *
	 * `enabled` no es una optimización acá: sin él, un profesional dispararía una
	 * petición que le responde 403 en el primer render de la pantalla de entrada.
	 */
	const { data: onboarding, isLoading: statusLoading } = useGetOnboardingStatus(
		Boolean(actor) && isAdmin,
	);

	useEffect(() => {
		if (authLoading) return;

		if (notAuthenticated) {
			router.replace(ROUTES.auth);
			return;
		}

		// Todavía no se sabe quién entró. Sin el rol no hay destino que elegir.
		if (!actor) return;

		if (!isAdmin) {
			router.replace(ROUTES.myAgenda);
			return;
		}

		if (statusLoading || !onboarding) return;

		router.replace(
			onboarding.businessSetupComplete ? ROUTES.agenda : ROUTES.onboarding,
		);
	}, [
		authLoading,
		notAuthenticated,
		actor,
		isAdmin,
		statusLoading,
		onboarding,
		router,
	]);

	return null;
}
