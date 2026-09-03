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
		<html lang="es" className="h-full">
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
