/**
 * La oferta de instalar Polaria como aplicación.
 *
 * Instalar no copia nada a la máquina: el navegador guarda un acceso directo y
 * abre esta misma web en una ventana propia, sin barra de direcciones ni
 * pestañas. Quién puede hacerlo no lo decidimos nosotros —lo decide el
 * navegador, y avisa con un evento—, así que este archivo no es una
 * preferencia: es el estado de una oferta que puede no llegar nunca.
 *
 * Solo llega en navegadores Chromium. Safari y Firefox no tienen el evento, y
 * ahí la única forma es el menú del propio navegador; en iPad, "Añadir a
 * pantalla de inicio". Nada de eso se puede disparar desde la página, así que
 * donde no hay evento no hay botón —mejor que un botón que no hace nada—.
 *
 * Sin React acá adentro a propósito, igual que en `theme-preference`: el script
 * de abajo lo importa el layout, que es un componente de servidor. El hook vive
 * al lado, en `use-install-prompt`.
 */

/**
 * El evento que manda Chrome cuando el sitio se puede instalar. No está en las
 * definiciones del DOM porque no es estándar: lo implementa Chromium y nadie
 * más.
 */
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
	interface Window {
		__polariaInstallEvent?: BeforeInstallPromptEvent | null;
	}
}

/**
 * Lo que corre antes del contenido para no perderse el evento.
 *
 * Ésta es la parte que no se puede resolver desde React. Chrome dispara
 * `beforeinstallprompt` apenas termina de leer el manifest, que suele ser
 * **antes** de que hidrate la aplicación: un `addEventListener` dentro de un
 * efecto llega tarde, el evento ya pasó, y el botón no aparece nunca. Como el
 * evento no se puede volver a pedir, hay que estar escuchando desde la primera
 * línea del documento y guardarlo.
 *
 * `preventDefault` es lo que nos queda el control: sin él, Chrome en Android
 * muestra su propia barrita de instalación abajo de la pantalla.
 *
 * Va minificado a mano porque es un `script` en línea y no pasa por el
 * empaquetador, igual que los otros dos del layout.
 */
export const INSTALL_PROMPT_SCRIPT = `try{addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__polariaInstallEvent=e})}catch(e){}`;

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/**
 * Si la ventana que estás mirando ya es la aplicación instalada.
 *
 * Adentro no hay nada que ofrecer, y el evento igual no llega; se pregunta por
 * las dudas y porque es barato.
 */
const isInstalled = (): boolean => {
	try {
		return matchMedia('(display-mode: standalone)').matches;
	} catch {
		return false;
	}
};

/** Si hay una instalación que ofrecer ahora mismo. */
export const canInstall = (): boolean =>
	Boolean(window.__polariaInstallEvent) && !isInstalled();

export const subscribeToInstall = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

/**
 * Abre el diálogo del navegador y espera la respuesta.
 *
 * El evento sirve **una sola vez**: aceptado o rechazado, después de esto ya no
 * vale, y por eso se descarta pase lo que pase. Si lo rechazan, Chrome vuelve a
 * ofrecerlo más adelante por su cuenta —otra visita, otra navegación— y el
 * oyente de acá abajo lo va a agarrar igual que al primero.
 *
 * Devuelve si terminó instalada, para que quien llame decida qué decir.
 */
export const promptInstall = async (): Promise<boolean> => {
	const event = window.__polariaInstallEvent;
	if (!event) return false;

	/*
	 * Se limpia antes de esperar la respuesta, no después: mientras el diálogo
	 * está abierto el botón tiene que dejar de ofrecerse, o un segundo clic
	 * intenta usar un evento que el navegador ya considera gastado.
	 */
	window.__polariaInstallEvent = null;
	notify();

	try {
		await event.prompt();
		const { outcome } = await event.userChoice;
		return outcome === 'accepted';
	} catch {
		// El navegador puede rechazarlo si considera que el evento venció. No hay
		// nada que hacer: la oferta vuelve cuando él quiera.
		return false;
	}
};

if (typeof window !== 'undefined') {
	/*
	 * El mismo oyente que el script de antes del contenido, otra vez.
	 *
	 * No es una repetición: aquél agarra el evento que llega antes de que exista
	 * la aplicación, y éste los que llegan después —Chrome lo vuelve a ofrecer
	 * tras un rechazo, o al cambiar de ruta—. Los dos escriben el mismo lugar;
	 * la diferencia es que éste además avisa, porque para entonces ya hay
	 * quien escuche.
	 */
	addEventListener('beforeinstallprompt', (event) => {
		event.preventDefault();
		window.__polariaInstallEvent = event as BeforeInstallPromptEvent;
		notify();
	});

	/*
	 * Se instaló. Puede haber sido con nuestro botón o desde el menú del
	 * navegador, que es el camino que no controlamos: sin esto, quien instala
	 * por su cuenta se queda con la oferta a la vista en la pestaña que ya tenía
	 * abierta.
	 */
	addEventListener('appinstalled', () => {
		window.__polariaInstallEvent = null;
		notify();
	});
}
