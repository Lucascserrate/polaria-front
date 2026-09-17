'use client';

import { useSyncExternalStore } from 'react';

/**
 * Debajo del `sm` de Tailwind.
 *
 * El número está acá y en las clases, que es una repetición que no se puede
 * evitar: es el mismo corte visto desde los dos lados. Debajo de `sm` el drawer
 * deja de ser un panel al costado y ocupa la pantalla entera, y ahí el formulario
 * de reserva cambia de forma.
 */
const COMPACT_QUERY = '(max-width: 639.98px)';

const subscribe = (onChange: () => void): (() => void) => {
	const query = window.matchMedia(COMPACT_QUERY);
	query.addEventListener('change', onChange);
	return () => query.removeEventListener('change', onChange);
};

const getSnapshot = (): boolean => window.matchMedia(COMPACT_QUERY).matches;

/** En el servidor no hay viewport: se asume el panel ancho. */
const getServerSnapshot = (): boolean => false;

/**
 * Si la pantalla es angosta, para lo que no se puede decidir con CSS.
 *
 * Casi todo el responsive del panel son clases: dos formas del mismo árbol, y
 * el navegador elige. Esto es para lo otro —un paso que existe sólo en móvil, un
 * estado que arranca distinto—, donde no hay dos versiones que mostrar sino una
 * decisión que tomar antes de renderizar. Cuando alcance una clase, va la clase.
 */
export function useIsCompact(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
