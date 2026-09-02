'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { tenantsService } from '@/services/tenants.service';
import type { TrialSummary } from '@/types/tenant.types';

/**
 * La prueba gratuita de un negocio, cargada aparte de la ficha.
 *
 * No viaja dentro del tenant porque no es un campo editable: no se escribe en
 * el borrador ni se manda con "Guardar cambios". Extender es una acción que
 * ocurre en el momento, como conectar WhatsApp, y meterla en el formulario
 * habilitaría guardar una fecha de vencimiento a mano.
 *
 * Vive acá y no dentro de la sección para que el nav pueda poner en la solapa
 * los días que quedan: es lo que soporte quiere ver sin entrar.
 */
export const useTenantTrial = (tenantId: string) => {
	const [trial, setTrial] = useState<TrialSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setLoading(true);
			try {
				const data = await tenantsService.getTrial(tenantId);
				if (!cancelled) setTrial(data);
			} catch (cause) {
				if (!cancelled) {
					console.error('Error loading trial:', cause);
					setTrial(null);
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
	 * Extiende la prueba y se queda con lo que devolvió el servidor.
	 *
	 * `pending` bloquea el segundo envío, y eso no es cosmético: la operación
	 * suma días, así que un doble clic regala el doble de producto.
	 *
	 * Devuelve si se aplicó, para que la pantalla pueda soltar la selección y
	 * acusar recibo sin volver a preguntar por el estado.
	 */
	const extend = useCallback(
		async (days: number): Promise<boolean> => {
			if (pending) return false;

			setPending(true);
			setError(null);

			try {
				setTrial(await tenantsService.extendTrial(tenantId, days));
				return true;
			} catch (cause) {
				setError(
					axios.isAxiosError(cause) &&
						typeof cause.response?.data?.message === 'string'
						? cause.response.data.message
						: 'No se pudo extender la prueba. Intentá de nuevo.',
				);
				return false;
			} finally {
				setPending(false);
			}
		},
		[tenantId, pending],
	);

	return { trial, loading, pending, error, extend };
};

export default useTenantTrial;
