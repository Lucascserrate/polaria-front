'use client';

import SetupDrawer from '@/modules/onboarding/SetupDrawer';
import { TourProvider } from '@/modules/onboarding/tour/TourContext';
import TourOverlay from '@/modules/onboarding/tour/TourOverlay';

interface Props {
	children: React.ReactNode;
}

/**
 * Los primeros pasos, colgados del layout raíz.
 *
 * Tienen que estar acá arriba y no en el marco del panel porque el tutorial
 * cruza pantallas: del menú a Servicios, de Servicios al editor. En el App
 * Router cada sección tiene su propio layout y se desmonta al salir de ella, así
 * que colgado del marco el tutorial se cortaría solo en el primer paso.
 *
 * Mientras no haya nada abierto no dibuja nada ni pide nada al servidor: el
 * cajón consulta el estado recién cuando se abre, y el velo no existe hasta que
 * hay una lección andando. Por eso puede vivir sobre todas las pantallas,
 * incluidas las que se ven sin sesión.
 */
const SetupExperience: React.FC<Props> = ({ children }) => (
	<TourProvider>
		{children}
		<SetupDrawer />
		<TourOverlay />
	</TourProvider>
);

export default SetupExperience;
