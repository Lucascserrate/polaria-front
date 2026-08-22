/**
 * Preferencia de menú colapsado.
 *
 * Se guarda en `localStorage` y se aplica como atributo del `html`. No pasa por
 * React porque el ancho tiene que estar decidido antes del primer pintado: si el
 * estado viniera de un efecto, cada recarga mostraría el menú entero durante un
 * cuadro y después lo encogería. Tampoco va en una cookie para no volver
 * dinámicas pantallas que hoy se sirven estáticas.
 */
export const SIDEBAR_STORAGE_KEY = 'polaria.sidebar';

const COLLAPSED = 'collapsed';

/** Lo que corre antes del contenido para dejar el menú como se lo dejó. */
export const SIDEBAR_PREFERENCE_SCRIPT = `try{if(localStorage.getItem('${SIDEBAR_STORAGE_KEY}')==='${COLLAPSED}'){document.documentElement.dataset.sidebar='${COLLAPSED}'}}catch(e){}`;

export const isSidebarCollapsed = () =>
	document.documentElement.dataset.sidebar === COLLAPSED;

/** Invierte el estado y lo recuerda. Devuelve el estado nuevo. */
export const toggleSidebarPreference = (): boolean => {
	const collapsed = !isSidebarCollapsed();
	const root = document.documentElement;

	if (collapsed) root.dataset.sidebar = COLLAPSED;
	else delete root.dataset.sidebar;

	try {
		localStorage.setItem(
			SIDEBAR_STORAGE_KEY,
			collapsed ? COLLAPSED : 'expanded',
		);
	} catch {
		// Modo privado o almacenamiento lleno: la sesión funciona igual, solo no
		// se recuerda la preferencia.
	}

	return collapsed;
};
