import type { Metadata } from 'next';
import ImpersonationBanner from '@/components/ImpersonationBanner';

export const metadata: Metadata = { title: 'Soporte' };

/**
 * El panel de soporte no usa `AppShell` —no tiene menú lateral ni barra de
 * abajo— así que la franja de suplantación tiene que ponerse acá a mano.
 *
 * No es cosmético. Mientras hay una sesión de soporte abierta, estas pantallas
 * responden 403: el token que manda el navegador lleva el correo del negocio, no
 * el del super admin, y `SuperAdminGuard` lo rechaza con razón. Sin la franja,
 * eso se vería como que el panel se rompió. Con ella, se ve el motivo y el botón
 * para salir.
 */
const SuperAdminLayout = ({ children }: { children: React.ReactNode }) => (
	<>
		<ImpersonationBanner />
		{children}
	</>
);

export default SuperAdminLayout;
