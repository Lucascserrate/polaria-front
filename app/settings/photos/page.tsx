import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

/**
 * Las fotos se mudaron a "Mi página".
 *
 * Queda la redirección y no un 404 porque esta dirección ya está en marcadores y
 * en mensajes de soporte: llevar a donde ahora vive la pantalla es más útil que
 * decir que no existe.
 */
export default function BusinessPhotosSettingsPage() {
	redirect(ROUTES.myPage);
}
