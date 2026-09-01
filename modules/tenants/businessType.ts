import { BUSINESS_TYPE_OPTIONS } from '@/modules/onboarding/constants';

/**
 * El rubro, escrito como lo lee una persona.
 *
 * Lo guardado es un código estable (`BARBERSHOP`) justamente para que la
 * etiqueta pueda cambiar sin migrar nada; el precio es que en pantalla hay que
 * traducirlo. Se usa la misma lista que el onboarding: dos listas serían dos
 * rubros con nombres distintos según por dónde se mire.
 *
 * Un código desconocido se muestra tal cual, sin romper: puede venir de una
 * ficha vieja, de cuando esto era un campo de texto libre.
 */
export const businessTypeLabel = (value?: string | null): string | null => {
	if (!value) return null;

	return (
		BUSINESS_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
		value
	);
};
