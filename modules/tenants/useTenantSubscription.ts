'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { tenantsService } from '@/services/tenants.service';
import type { SubscriptionSummary } from '@/types/tenant.types';

/**
 * El estado comercial de un negocio, cargado aparte de la ficha.
 *
 * No viaja dentro del tenant porque no es un campo editable: no se escribe en
 * el borrador ni se manda con "Guardar cambios". Extender la prueba y registrar
 * un pago son acciones que ocurren en el momento, como conectar WhatsApp, y
 * meterlas en el formulario habilitaría escribir una fecha de vencimiento a
 * mano.
 *
 * Vive acá y no dentro de la sección para que el nav pueda poner en la solapa
 * los días que quedan: es lo que soporte quiere ver sin entrar.
 */
export const useTenantSubscription = (tenantId: string) => {
	const [subscription, setSubscription] = useState<SubscriptionSummary | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setLoading(true);
			try {
				const data = await tenantsService.getSubscription(tenantId);
				if (!cancelled) setSubscription(data);
			} catch (cause) {
				if (!cancelled) {
					console.error('Error loading subscription:', cause);
					setSubscription(null);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, [tenantId]);

	/**
	 * Corre una acción y se queda con el estado que devolvió el servidor.
	 *
	 * Un solo `pending` para las dos, y eso no es economía de código: extender la
	 * prueba y cobrar son decisiones sobre el mismo reloj, y dejarlas salir a la
	 * vez permitiría cobrarle meses a un negocio cuya prueba se está extendiendo
	 * en el mismo instante. Bloquear también el segundo envío de la misma acción
	 * es lo que evita que un doble clic sume el plazo dos veces.
	 *
	 * Devuelve si se aplicó, para que la pantalla pueda soltar la selección y
	 * acusar recibo sin volver a preguntar por el estado.
	 */
	const run = useCallback(
		async (
			action: () => Promise<SubscriptionSummary>,
			fallback: string,
		): Promise<boolean> => {
			if (pending) return false;

			setPending(true);
			setError(null);

			try {
				setSubscription(await action());
				return true;
			} catch (cause) {
				setError(
					axios.isAxiosError(cause) &&
						typeof cause.response?.data?.message === 'string'
						? cause.response.data.message
						: fallback,
				);
				return false;
			} finally {
				setPending(false);
			}
		},
		[pending],
	);

	const extendTrial = useCallback(
		(days: number) =>
			run(
				() => tenantsService.extendTrial(tenantId, days),
				'No se pudo extender la prueba. Intentá de nuevo.',
			),
		[run, tenantId],
	);

	const pay = useCallback(
		(months: number) =>
			run(
				() => tenantsService.paySubscription(tenantId, months),
				'No se pudo registrar el pago. Intentá de nuevo.',
			),
		[run, tenantId],
	);

	return { subscription, loading, pending, error, extendTrial, pay };
};

export default useTenantSubscription;
