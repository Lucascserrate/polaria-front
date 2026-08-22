/**
 * Rubros, con la etiqueta que ve el dueño.
 *
 * El código es el que viaja al backend y la etiqueta vive acá: el texto va a
 * cambiar y no queremos migrar filas por una palabra.
 */
export const BUSINESS_TYPE_OPTIONS = [
	{ value: 'BARBERSHOP', label: 'Barbería' },
	{ value: 'SALON', label: 'Salón de belleza' },
	{ value: 'SPA', label: 'Spa' },
	{ value: 'AESTHETIC_MEDICINE', label: 'Medicina estética' },
	{ value: 'DENTAL_CLINIC', label: 'Clínica dental' },
	{ value: 'OTHER', label: 'Otro' },
] as const;

/**
 * Zona horaria que informa el navegador.
 *
 * El negocio nace con la de Bolivia porque Google no informa la del usuario, y
 * el horario de atención se interpreta en esa zona: una zona equivocada corre
 * toda la agenda. Acá se propone la del dispositivo, que casi siempre es la
 * correcta, y el dueño la confirma sin tener que pensarlo.
 */
export const detectTimezone = (): string | undefined => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
	} catch {
		return undefined;
	}
};
