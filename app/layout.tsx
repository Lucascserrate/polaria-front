import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import SetupExperience from '@/modules/onboarding/SetupExperience';
import { Toaster } from '@/components/ui/sonner';
import { SIDEBAR_PREFERENCE_SCRIPT } from '@/components/sidebar-preference';
import { THEME_PREFERENCE_SCRIPT } from '@/components/theme-preference';
import { INSTALL_PROMPT_SCRIPT } from '@/components/install-prompt';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	/*
	 * La pestaña dice dónde está parado el usuario, y después de qué producto.
	 *
	 * `template` es el sufijo que Next le agrega a lo que declare cada sección en
	 * su propio layout, así que el nombre se escribe una sola vez —el mismo que
	 * está en el menú— y el "- Polaria" sale solo. `default` es lo que queda
	 * donde no hay sección que nombrar: la pantalla de entrada.
	 */
	title: {
		default: 'Polaria',
		template: '%s - Polaria',
	},
	description: 'Asistente de reservas',
};

export const viewport: Viewport = {
	/*
	 * El color de la barra de título cuando Polaria corre instalada, en ventana
	 * propia y sin barra de direcciones.
	 *
	 * Está acá y no solo en el manifest porque el manifest admite un color y esto
	 * admite dos: el de allá se lee una vez, al instalar, y quedaría fijo mientras
	 * el resto de la aplicación cambia de tema. Con estas dos líneas la ventana
	 * acompaña —y también acompaña al sistema, que es el valor por defecto de la
	 * preferencia—.
	 *
	 * Los dos colores son `--background` de `globals.css` en sRGB, no un gris
	 * elegido de nuevo: si allá cambia el fondo, acá hay que tocarlo igual.
	 */
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		/*
		 * `suppressHydrationWarning` va acá porque los dos scripts de abajo escriben
		 * atributos de **este** elemento antes de que React hidrate: el tema agrega
		 * la clase `dark` y el menú colapsado agrega `data-sidebar`. El servidor
		 * manda `class="h-full"` y sin nada más; el cliente, cuando React compara,
		 * ya tiene otra cosa. React lo reporta como desajuste de hidratación y
		 * además avisa que no lo va a corregir —tiene razón: no debe corregirlo, ese
		 * es el valor bueno—.
		 *
		 * Solo silencia los atributos y el contenido de texto de este elemento, no
		 * del árbol: un desajuste real dentro de la app sigue avisando.
		 *
		 * La alternativa sería mover las preferencias a cookies para que el servidor
		 * ya mande la clase correcta, y está descartada a propósito —ver el
		 * comentario en `theme-preference`—: volvería dinámicas pantallas que hoy se
		 * sirven estáticas.
		 */
		<html lang="es" className="h-full" suppressHydrationWarning>
			<body
				className={`${geistSans.className} antialiased h-full flex flex-col`}
			>
				{/*
				 * Los tres corren antes que nada de lo que sigue, y van juntos en un
				 * solo `script` para no pagar tres veces el corte del parseo del
				 * documento.
				 *
				 * Los dos primeros deciden el ancho del menú y el color del fondo, y las
				 * dos cosas tienen que estar resueltas en el primer pintado. El tercero
				 * está acá por otro motivo: no pinta nada, pero se queda escuchando el
				 * aviso de que el sitio se puede instalar, que Chrome manda apenas lee
				 * el manifest —normalmente antes de que hidrate la aplicación, y una
				 * sola vez—.
				 */}
				<script
					dangerouslySetInnerHTML={{
						__html: `${THEME_PREFERENCE_SCRIPT}${SIDEBAR_PREFERENCE_SCRIPT}${INSTALL_PROMPT_SCRIPT}`,
					}}
				/>
				<QueryProvider>
					<SetupExperience>{children}</SetupExperience>
				</QueryProvider>
				<Toaster />
			</body>
		</html>
	);
}
