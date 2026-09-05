import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { SIDEBAR_PREFERENCE_SCRIPT } from '@/components/sidebar-preference';
import { THEME_PREFERENCE_SCRIPT } from '@/components/theme-preference';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Polaria',
	description: 'AI Booking Assistant',
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
				 * Los dos corren antes que nada de lo que sigue: deciden el ancho del
				 * menú y el color del fondo, y las dos cosas tienen que estar resueltas
				 * en el primer pintado. Van juntos en un solo `script` para no pagar
				 * dos veces el corte del parseo del documento.
				 */}
				<script
					dangerouslySetInnerHTML={{
						__html: `${THEME_PREFERENCE_SCRIPT}${SIDEBAR_PREFERENCE_SCRIPT}`,
					}}
				/>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
