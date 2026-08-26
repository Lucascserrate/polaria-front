import type { StaffAccessRole } from '@/types/staff.types';

/**
 * Los roles como se eligen en el panel.
 *
 * `OWNER` no está: no se asigna, se es. Lo tiene quien registró la cuenta, y
 * ofrecerlo en una lista sugeriría que el negocio puede tener dos dueños, que es
 * una decisión de facturación y no de esta pantalla.
 */
export const ASSIGNABLE_ROLES: Array<{
	value: StaffAccessRole;
	label: string;
	description: string;
}> = [
	{
		value: 'PROFESSIONAL',
		label: 'Profesional',
		description:
			'Atiende clientes. Aparece en la agenda y en las reservas, y ve solo su propio trabajo.',
	},
	{
		value: 'ADMIN',
		label: 'Administrador',
		description:
			'Gestiona el negocio completo. No aparece como profesional para reservar.',
	},
];

/**
 * El valor inicial de "atiende clientes" al elegir un rol.
 *
 * Es el espejo de `providesServicesByDefault` del servidor, y es solo un punto de
 * partida: quien manda es el check, que el negocio puede cambiar sin cambiar el
 * rol. Un administrador que también corta pelo es una configuración válida.
 */
export const providesServicesByDefault = (role: StaffAccessRole): boolean =>
	role === 'PROFESSIONAL';

export const ROLE_LABELS: Record<StaffAccessRole, string> = {
	OWNER: 'Propietario',
	ADMIN: 'Administrador',
	PROFESSIONAL: 'Profesional',
};

/**
 * Los prefijos telefónicos que se ofrecen.
 *
 * Se agregan a medida que haya negocios donde hagan falta: una lista de los 200
 * países es un selector que nadie puede recorrer para encontrar el suyo.
 */
export const PHONE_CODES = [
	{ code: '+591', label: 'Bolivia' },
	{ code: '+54', label: 'Argentina' },
	{ code: '+56', label: 'Chile' },
	{ code: '+51', label: 'Perú' },
	{ code: '+595', label: 'Paraguay' },
	{ code: '+598', label: 'Uruguay' },
	{ code: '+52', label: 'México' },
	{ code: '+57', label: 'Colombia' },
	{ code: '+34', label: 'España' },
	{ code: '+1', label: 'EE. UU. / Canadá' },
] as const;

/** Prefijo por defecto. Bolivia, que es donde está el primer negocio. */
export const DEFAULT_PHONE_CODE = '+591';

/**
 * Parte un teléfono guardado en prefijo y número nacional.
 *
 * El backend guarda un solo campo en E.164 (`+59170000000`) a propósito: el
 * prefijo ya está adentro, y dos columnas podrían divergir. Pero el formulario
 * necesita las dos partes, así que se separan al abrir y se juntan al guardar.
 *
 * Los prefijos se prueban de más largo a más corto: `+1` es prefijo de `+1809`, y
 * probando primero el corto un número dominicano quedaría mal partido.
 */
export const splitPhone = (
	stored?: string | null,
): { phoneCode: string; phone: string } => {
	const value = stored?.trim() ?? '';
	if (!value) return { phoneCode: DEFAULT_PHONE_CODE, phone: '' };

	const match = [...PHONE_CODES]
		.sort((a, b) => b.code.length - a.code.length)
		.find((entry) => value.startsWith(entry.code));

	return match
		? { phoneCode: match.code, phone: value.slice(match.code.length) }
		: { phoneCode: DEFAULT_PHONE_CODE, phone: value.replace(/^\+/, '') };
};

/** Vuelve a armar el número como lo espera el backend. */
export const joinPhone = (phoneCode: string, phone: string): string => {
	const national = phone.trim();
	// Cadena vacía y no `undefined`: es la forma que tiene el backend de entender
	// "borrar el teléfono". Ver `normalizeStaffPhone`.
	return national ? `${phoneCode}${national}` : '';
};
