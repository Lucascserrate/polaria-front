'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';
import type { OnboardingStep } from '@/services/onboarding/onboarding.service';

/**
 * Cada paso, con a dónde manda y por qué importa.
 *
 * Los destinos son las pantallas que ya existen: Servicios, Staff y
 * Configuración. No hay pantallas nuevas de onboarding para servicios ni para
 * staff porque el CRUD ya está hecho, y una versión "de onboarding" sería el
 * mismo formulario con otra ruta y dos lugares que mantener.
 */
const STEP_DETAILS: Record<
	OnboardingStep,
	{ label: string; href: string; pending: string }
> = {
	BUSINESS_INFO: {
		label: 'Información del negocio',
		href: ROUTES.settings,
		pending: 'Falta el nombre o el rubro.',
	},
	BUSINESS_HOURS: {
		label: 'Horarios de atención',
		href: ROUTES.settings,
		pending: 'Sin horarios no se pueden tomar reservas.',
	},
	SERVICES: {
		label: 'Servicios',
		href: ROUTES.services,
		pending: 'Cargá lo que ofrecés, con su duración y precio.',
	},
	STAFF: {
		label: 'Profesionales',
		href: ROUTES.staff,
		pending: 'Agregá quién atiende y qué servicios hace cada uno.',
	},
	WHATSAPP: {
		label: 'WhatsApp',
		href: ROUTES.settings,
		pending: 'Es el canal por donde tus clientes reservan.',
	},
};

/** El orden en que se muestran: el mismo del flujo. */
const ORDER: OnboardingStep[] = [
	'BUSINESS_INFO',
	'BUSINESS_HOURS',
	'SERVICES',
	'STAFF',
	'WHATSAPP',
];

/**
 * Cuántos pasos son. Lo exporta esta lista y no una constante aparte para que el
 * contador del menú no pueda decir "2 de 4" si acá se agrega un paso.
 */
export const SETUP_STEP_COUNT = ORDER.length;

/**
 * Progreso de la configuración de Polaria.
 *
 * Lee `GET /onboarding/status`, que deriva el estado de las entidades. Por eso no
 * hace falta avisarle nada cuando el negocio carga un servicio o desconecta
 * WhatsApp: la próxima consulta ya dice la verdad.
 *
 * Tiene su propia pantalla y una entrada temporal en el menú, en lugar de vivir
 * en la agenda: la agenda es la pantalla del día a día y esto se hace una vez.
 */
const PolariaSetupChecklist: React.FC = () => {
	const { data } = useGetOnboardingStatus();

	if (!data) return null;

	if (data.nextStep === null) {
		return (
			<div className="rounded-lg border border-border bg-card p-6 text-center">
				<Check className="mx-auto h-6 w-6 text-green-600 dark:text-green-400" />
				<p className="mt-2 text-sm font-medium">Polaria está lista</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Ya podés recibir reservas por WhatsApp.
				</p>
			</div>
		);
	}

	const done = ORDER.filter((step) => data.steps[step]).length;
	const trialPending = data.subscription.state === 'NOT_STARTED';

	return (
		<div className="overflow-hidden rounded-lg border border-border bg-card">
			<div className="space-y-1 border-b border-border px-4 py-3">
				<div className="flex items-center justify-between gap-2">
					<span className="text-sm font-medium">Configuración de Polaria</span>
					<span className="text-xs tabular-nums text-muted-foreground">
						{done} de {ORDER.length}
					</span>
				</div>
				<p className="text-xs text-muted-foreground">
					{data.readyForBookings
						? 'Ya podés recibir reservas. Te falta un detalle.'
						: 'Completá estos pasos para empezar a recibir reservas.'}
				</p>
			</div>

			<ul className="divide-y divide-border">
				{ORDER.map((step) => {
					const detail = STEP_DETAILS[step];
					const complete = data.steps[step];

					return (
						<li key={step} className="px-4 py-3">
							<div className="flex items-start gap-2.5">
								{complete ? (
									<Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
								) : (
									<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
								)}

								<div className="min-w-0 flex-1">
									<p
										className={`text-sm ${
											complete
												? 'text-muted-foreground'
												: 'font-medium text-foreground'
										}`}
									>
										{detail.label}
									</p>

									{/* Lo pendiente explica qué hacer; lo hecho no necesita texto. */}
									{!complete && (
										<>
											<p className="mt-0.5 text-xs text-muted-foreground">
												{detail.pending}
											</p>
											{step === 'WHATSAPP' && trialPending && (
												<p className="mt-1 text-xs text-muted-foreground">
													Al conectarlo empieza tu prueba gratuita.
												</p>
											)}
											<Link
												href={detail.href}
												className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
											>
												Configurar
												<ArrowRight className="h-3 w-3" />
											</Link>
										</>
									)}
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default PolariaSetupChecklist;
