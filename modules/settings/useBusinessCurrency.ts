'use client';

import { DEFAULT_CURRENCY } from '@/lib/currencies';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';

/**
 * La moneda del negocio y cómo cambiarla.
 *
 * Existe para que las pantallas que muestran un precio no tengan que saber que
 * la moneda vive en la configuración del negocio: piden la moneda y la cambian,
 * sin armar una carga de ajustes cada una.
 *
 * El valor por defecto es el mismo del backend. Cubre el instante entre que la
 * pantalla se dibuja y que llega la configuración, no un negocio sin moneda: la
 * columna no admite vacío.
 */
const useBusinessCurrency = () => {
	const { data: settings } = useGetSettings();
	const { mutate, isPending } = useUpdateSettings();

	return {
		currency: settings?.currency ?? DEFAULT_CURRENCY,
		/** Se guarda al elegirla: no es parte del borrador de ninguna pantalla. */
		setCurrency: (currency: string) => mutate({ currency }),
		savingCurrency: isPending,
	};
};

export default useBusinessCurrency;
