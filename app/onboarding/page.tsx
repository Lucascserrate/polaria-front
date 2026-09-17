import type { Metadata } from 'next';
import BusinessSetupWizard from '@/modules/onboarding/BusinessSetupWizard';

/**
 * Configuración inicial, fuera del layout del panel a propósito: quien llega acá
 * todavía no tiene un negocio configurado, y ofrecerle la barra lateral con
 * Agenda y Reportes vacíos sería invitarlo a perderse antes de empezar.
 */
export const metadata: Metadata = { title: 'Configurá tu negocio' };

export default function OnboardingPage() {
	return (
		<main className="mx-auto w-full max-w-xl px-4 py-10">
			<BusinessSetupWizard />
		</main>
	);
}
