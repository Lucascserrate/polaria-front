import type { TenantSubscription } from '@/types/tenant.types';

/**
 * Cómo se nombra cada estado de suscripción y de qué color se lee.
 *
 * Se traduce acá y no en el backend: qué estado tiene el negocio lo decide una
 * regla del producto, cómo se dice en una pantalla interna es del panel. El
 * mapa es total sobre `SubscriptionState`, con una salida por si el backend
 * gana un estado antes que estas pantallas.
 *
 * Vive fuera de la ficha porque el listado muestra lo mismo: dos copias de estos
 * nombres serían dos pantallas que le dicen cosas distintas al mismo negocio.
 */
export const SUBSCRIPTION_STATES: Record<
	string,
	{ label: string; tone: string }
> = {
	NOT_STARTED: { label: 'Sin iniciar', tone: 'text-muted-foreground' },
	TRIAL_ACTIVE: { label: 'Prueba en curso', tone: 'text-success' },
	TRIAL_EXPIRED: { label: 'Prueba vencida', tone: 'text-warning' },
	ACTIVE: { label: 'Suscripción paga', tone: 'text-success' },
	EXPIRED: { label: 'Suscripción vencida', tone: 'text-destructive' },
	CANCELED: { label: 'Cancelada', tone: 'text-destructive' },
};

export const subscriptionState = (state: string) =>
	SUBSCRIPTION_STATES[state] ?? {
		label: state,
		tone: 'text-muted-foreground',
	};

/**
 * Lo mismo, con los días que quedan pegados cuando la prueba corre.
 *
 * Los días sólo aparecen ahí porque sólo ahí existen: el backend manda `null`
 * en todos los demás estados, y "Suscripción paga · 0 días" sería una lectura
 * falsa de un dato ausente.
 */
export const subscriptionLabel = (subscription: TenantSubscription): string => {
	const { label } = subscriptionState(subscription.state);
	const days = subscription.daysRemaining;

	if (days === null) return label;

	return `${label} · ${days === 1 ? '1 día' : `${days} días`}`;
};
