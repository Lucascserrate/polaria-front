export const BUSINESS_TYPE_OPTIONS = [
	{ value: 'HAIR_SALON', label: 'Peluquería' },
	{ value: 'NAIL_SALON', label: 'Salón de uñas' },
	{ value: 'BROWS_LASHES', label: 'Cejas y pestañas' },
	{ value: 'SALON', label: 'Salón de belleza' },
	{ value: 'AESTHETIC_MEDICINE', label: 'Medicina estética' },
	{ value: 'BARBERSHOP', label: 'Barbería' },
	{ value: 'MASSAGE', label: 'Masajes' },
	{ value: 'SPA', label: 'Spa y sauna' },
	{ value: 'WAXING', label: 'Centro de depilación' },
	{ value: 'TATTOO_PIERCING', label: 'Tatuajes y piercings' },
	{ value: 'TANNING', label: 'Centro de bronceado' },
	{ value: 'FITNESS', label: 'Fitness y recuperación' },
	{ value: 'PHYSIOTHERAPY', label: 'Fisioterapia' },
	{ value: 'HEALTH_CLINIC', label: 'Consultorio médico' },
	{ value: 'DENTAL_CLINIC', label: 'Clínica dental' },
	{ value: 'PET_GROOMING', label: 'Peluquería de mascotas' },
	{ value: 'OTHER', label: 'Otro' },
] as const;

/**
 * El rubro, escrito como lo lee una persona.
 *
 * Lo guardado es un código estable (`BARBERSHOP`) justamente para que la
 * etiqueta pueda cambiar sin migrar nada; el precio es que en pantalla hay que
 * traducirlo. Se usa la misma lista de arriba: dos listas serían dos rubros con
 * nombres distintos según por dónde se mire.
 *
 * Vive con las opciones y no en el módulo que lo muestra porque lo muestran
 * tres: la configuración del negocio, la ficha de soporte y el listado.
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
