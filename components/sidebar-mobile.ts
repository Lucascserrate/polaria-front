"use client";

import { useSyncExternalStore } from "react";

/**
 * Si el menú está abierto en móvil.
 *
 * Vive fuera de React porque quien lo abre y quien lo dibuja no siempre están en
 * la misma rama: la Agenda pone su botón dentro de la barra del calendario
 * —donde queda espacio— mientras el menú sigue colgando del marco. Un contexto
 * obligaría a envolver todas las pantallas para resolver algo de una sola.
 *
 * En escritorio no significa nada: ahí el menú está siempre a la vista.
 */

let open = false;

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setMobileSidebar = (next: boolean) => {
  if (open === next) return;

  open = next;
  listeners.forEach((listener) => listener());
};

export const toggleMobileSidebar = () => setMobileSidebar(!open);

/** El menú arranca cerrado en el servidor: abierto solo se llega tocando. */
export const useMobileSidebar = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
