/**
 * Preferencia de tema: claro, oscuro, o lo que diga el dispositivo.
 *
 * Vive en `localStorage` y se aplica como clase del `html`, igual que el menú
 * colapsado y por la misma razón: el color de fondo tiene que estar decidido
 * antes del primer pintado. Si el tema saliera de un efecto, cada recarga
 * arrancaría en blanco y se apagaría un cuadro después —un destello blanco en
 * una pantalla oscura, que es justo lo que alguien elige el modo oscuro para no
 * ver—. Tampoco va en una cookie, para no volver dinámicas pantallas que hoy se
 * sirven estáticas.
 *
 * "Sistema" es el valor por defecto y no una opción más: quien ya dejó el
 * teléfono en oscuro entra y lo ve oscuro sin buscar nada. Guardar `light` o
 * `dark` es fijarlo a mano, y entonces deja de seguir al sistema.
 *
 * Sin React acá adentro a propósito: este archivo lo importa el layout, que es
 * un componente de servidor, y allá `useSyncExternalStore` ni siquiera existe.
 * El hook vive al lado, en `use-theme-preference`.
 */
export const THEME_STORAGE_KEY = 'polaria.theme';

export type ThemePreference = 'system' | 'light' | 'dark';

const DEFAULT: ThemePreference = 'system';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Lo que corre antes del contenido para dejar la pantalla del color que
 * corresponde.
 *
 * Va minificado a mano porque es una etiqueta `script` en línea y no pasa por el
 * empaquetador: lo que se escribe acá es lo que se descarga en cada visita.
 */
export const THEME_PREFERENCE_SCRIPT = `try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');var d=p==='dark'||(p!=='light'&&matchMedia('${DARK_QUERY}').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}`;

/**
 * La preferencia guardada, en memoria.
 *
 * Se cachea porque la lectura corre en cada render del selector, y pegarle a
 * `localStorage` —que es sincrónico— en cada uno sería pagar un peaje por un
 * dato que solo cambia cuando alguien lo cambia.
 */
let cached: ThemePreference | null = null;

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const parse = (value: string | null): ThemePreference =>
	value === 'light' || value === 'dark' || value === 'system' ? value : DEFAULT;

export const getThemePreference = (): ThemePreference => {
	if (cached !== null) return cached;

	try {
		cached = parse(localStorage.getItem(THEME_STORAGE_KEY));
	} catch {
		// Modo privado o almacenamiento bloqueado: se sigue al sistema.
		cached = DEFAULT;
	}

	return cached;
};

/** Si con la preferencia actual la pantalla tiene que verse oscura. */
export const isDarkTheme = (preference = getThemePreference()): boolean =>
	preference === 'dark' ||
	(preference === 'system' && matchMedia(DARK_QUERY).matches);

const apply = () => {
	document.documentElement.classList.toggle('dark', isDarkTheme());
};

export const setThemePreference = (next: ThemePreference) => {
	if (getThemePreference() === next) return;

	cached = next;
	apply();

	try {
		localStorage.setItem(THEME_STORAGE_KEY, next);
	} catch {
		// La sesión funciona igual, solo no se recuerda para la próxima.
	}

	notify();
};

export const subscribeToTheme = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

if (typeof window !== 'undefined') {
	/*
	 * En "sistema" el tema puede cambiar sin que nadie toque el panel: muchos
	 * teléfonos se ponen en oscuro solos al atardecer. Sin este oyente, quien
	 * dejó la agenda abierta se queda en claro hasta recargar.
	 */
	matchMedia(DARK_QUERY).addEventListener('change', () => {
		if (getThemePreference() !== 'system') return;

		apply();
		notify();
	});

	/*
	 * Y puede cambiar desde otra pestaña. Es común tener la agenda en una y los
	 * clientes en otra, y que una quede en claro se lee como que el cambio no se
	 * guardó.
	 */
	window.addEventListener('storage', (event) => {
		if (event.key !== THEME_STORAGE_KEY) return;

		cached = parse(event.newValue);
		apply();
		notify();
	});
}
