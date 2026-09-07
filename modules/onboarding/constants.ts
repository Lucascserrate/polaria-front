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
