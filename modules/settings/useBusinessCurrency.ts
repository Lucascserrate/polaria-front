'use client';

import { DEFAULT_CURRENCY } from '@/lib/currencies';
import useGetSettings from '@/services/settings/useGetSettings';

/**
 * La moneda con la que nace un servicio nuevo.
 *
 * Es la del negocio, que se dedujo de su zona horaria al registrarse. **No es la
 * moneda de nada**: cada servicio guarda la suya, y esta sólo llena el selector
 * la primera vez, para que el catálogo de una sola moneda —que son casi todos—
 * no tenga que elegirla servicio por servicio.
 *
 * El valor por defecto cubre el instante entre que la pantalla se dibuja y que
 * llega la configuración, no un negocio sin moneda: la columna no admite vacío.
 */
const useBusinessCurrency = () => {
	const { data: settings } = useGetSettings();

	return { currency: settings?.currency ?? DEFAULT_CURRENCY };
};

export default useBusinessCurrency;
