'use client';

import { useSyncExternalStore } from 'react';

import {
	getThemePreference,
	isDarkTheme,
	subscribeToTheme,
	type ThemePreference,
} from '@/components/theme-preference';

/**
 * La preferencia de tema, para dibujar cuál de las tres opciones está elegida.
 *
 * En el servidor no hay `localStorage`, así que devuelve "sistema" y React
 * vuelve a dibujar con el valor verdadero apenas hidrata. El desajuste se ve
 * solo en cuál de los tres botones queda marcado, nunca en el color de la
 * pantalla: de eso ya se encargó el script que corre antes del contenido.
 */
export const useThemePreference = (): ThemePreference =>
	useSyncExternalStore(
		subscribeToTheme,
		getThemePreference,
		() => 'system' as const,
	);

/**
 * Si la pantalla se está viendo oscura ahora mismo, ya resuelto: "sistema" acá
 * no es una respuesta.
 *
 * Lo pide lo que no se puede pintar con CSS y necesita saber el color de
 * antemano —hoy el mapa, que dibuja su propio canvas—. Todo lo demás se resuelve
 * con una clase y no debería llamar a esto: pasar por React para elegir un color
 * es volver a tener el destello que el script de antes del contenido evita.
 */
export const useIsDarkTheme = (): boolean =>
	useSyncExternalStore(
		subscribeToTheme,
		() => isDarkTheme(),
		() => false,
	);
