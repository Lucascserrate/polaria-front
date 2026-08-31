'use client';

import { useEffect, useState } from 'react';

/**
 * El valor, pero recién cuando dejó de cambiar por un rato.
 *
 * Existe para los buscadores que preguntan al servidor: sin esto, escribir
 * "Ana" son tres peticiones y las respuestas pueden llegar desordenadas, así que
 * la lista parpadea con resultados de un término que ya no está en el campo.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(timer);
	}, [value, delayMs]);

	return debounced;
}
