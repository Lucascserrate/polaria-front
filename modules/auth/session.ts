import type { StaffAccessRole } from '@/types/staff.types';

/**
 * Quién está mirando el panel.
 *
 * El rol viene del servidor en cada validación de sesión y no se lee del token: la
 * cookie es `httpOnly`, que es justamente lo que impide falsearlo desde el
 * navegador. Acá solo se usa para **dibujar** —qué menú, qué pantallas— y nunca
 * como permiso: lo que un rol puede hacer lo decide el backend, y esconder algo en
 * el cliente no lo protege.
 */
export interface SessionActor {
	/** `null` cuando entró el dueño, que no es una ficha del equipo. */
	staffId: string | null;
	name: string;
	role: StaffAccessRole;
	providesServices: boolean;
}

export interface SessionResponse {
	statusCode: number;
	message: string;
	actor?: SessionActor;
}

/** El dueño y el administrador ven el panel del negocio. */
export const isAdminRole = (role?: StaffAccessRole): boolean =>
	role === 'OWNER' || role === 'ADMIN';

/**
 * Mientras la sesión no llegó, no se asume ningún rol.
 *
 * Suponer "administrador" mostraría el menú completo durante un instante y después
 * lo recortaría, que se ve como un panel que se le escapó al sistema. Suponer
 * "profesional" hace lo contrario y es igual de malo. Sin dato, no se dibuja el
 * menú.
 */
export const actorOf = (session?: SessionResponse): SessionActor | null =>
	session?.actor ?? null;
