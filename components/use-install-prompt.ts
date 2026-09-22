'use client';

import { useSyncExternalStore } from 'react';

import { canInstall, subscribeToInstall } from '@/components/install-prompt';

/**
 * Si hay una instalación que ofrecer.
 *
 * En el servidor es siempre `false` —allá no hay navegador que opine— y React
 * vuelve a dibujar con la respuesta verdadera apenas hidrata. Cuál de las dos
 * salió primero no se nota: el botón aparece donde no había nada, no reemplaza
 * a otra cosa.
 *
 * Cambia sola durante la sesión, y en las dos direcciones: pasa a `true` cuando
 * el navegador ofrece la instalación —que puede ser bastante después de cargar,
 * o tras un rechazo anterior— y vuelve a `false` cuando la aplicación queda
 * instalada, aunque se haya instalado desde el menú del navegador.
 */
export const useCanInstall = (): boolean =>
	useSyncExternalStore(subscribeToInstall, canInstall, () => false);
