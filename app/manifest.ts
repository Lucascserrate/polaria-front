import type { MetadataRoute } from 'next';

/**
 * Lo que hace que Polaria se pueda instalar.
 *
 * No hay nada nativo abajo: instalar es que el navegador guarde un acceso
 * directo y abra esta misma web en una ventana propia, sin barra de direcciones
 * ni pestañas. Eso es `display: standalone`, y es todo lo que cambia.
 *
 * Next lo sirve en `/manifest.webmanifest` y agrega el `<link>` al documento
 * solo; no hay que tocar el layout.
 */
export default function manifest(): MetadataRoute.Manifest {
	return {
		/*
		 * `id` es la identidad de la aplicación instalada, y por eso es un valor
		 * aparte de `start_url` aunque hoy digan lo mismo: si algún día la entrada
		 * cambia de ruta, quien ya la tenía instalada recibe la actualización en
		 * lugar de terminar con dos Polarias en el escritorio.
		 */
		id: '/',
		name: 'Polaria',
		/*
		 * El nombre que va debajo del icono, donde el sistema corta alrededor de los
		 * doce caracteres. "Polaria" entra entero, así que es el mismo.
		 */
		short_name: 'Polaria',
		description: 'Asistente de reservas',
		lang: 'es',
		/*
		 * La raíz y no la agenda, porque `/` no es una pantalla: es el desvío que
		 * mira el rol y manda a cada quien a donde le corresponde —autenticarse, la
		 * agenda propia, la configuración inicial o el panel—. Apuntar a una ruta
		 * concreta congelaría ese destino en el momento de instalar.
		 */
		start_url: '/',
		/*
		 * Todo el sitio queda adentro de la ventana. Sin esto, cualquier ruta que no
		 * cuelgue de `start_url` se abriría en una pestaña del navegador y la
		 * instalación se sentiría rota a la primera navegación.
		 */
		scope: '/',
		display: 'standalone',
		/*
		 * El color de la ventana mientras carga, antes del primer pintado.
		 *
		 * Es un solo valor y no admite media query, así que no puede seguir al tema
		 * como sigue todo lo demás. Va blanco porque blanco es lo que manda el
		 * servidor: la clase `dark` la pone el script del layout ya en el cliente.
		 * En oscuro esto deja el mismo destello que hoy se ve al abrir el sitio en
		 * una pestaña, ni más ni menos; en claro, ninguno. Ponerlo en `#0a0a0a`
		 * arregla el primer caso y estrena el problema en el segundo.
		 */
		background_color: '#ffffff',
		/*
		 * La barra de título de la ventana instalada. Éste es el valor que se guarda
		 * al instalar; el que manda después es el `<meta name="theme-color">` del
		 * layout, que sí viene en dos versiones y sigue al tema.
		 */
		theme_color: '#ffffff',
		/*
		 * Los dos tamaños que pide el navegador para considerar instalable un sitio.
		 * Son las rutas que ya genera `icon.tsx` —el mismo icono de la pestaña, en
		 * grande—, sin el hash que Next le cuelga a los `<link>`: ahí es para
		 * invalidar caché y acá haría falta reescribirlo a mano en cada cambio.
		 *
		 * Ninguno va como `maskable`. Android recorta esos iconos contra su propia
		 * máscara, y éste ya trae sus esquinas redondeadas: se redondearía dos veces
		 * y perdería el borde, que es justo lo que `apple-icon` evita del otro lado.
		 * Un icono enmascarable es otro dibujo, con aire de sobra alrededor.
		 */
		icons: [
			{ src: '/icon/192', sizes: '192x192', type: 'image/png' },
			{ src: '/icon/512', sizes: '512x512', type: 'image/png' },
		],
	};
}
