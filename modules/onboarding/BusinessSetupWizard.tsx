'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	fromScheduleDraft,
	toScheduleDraft,
	validateScheduleDraft,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';
import { DEFAULT_BUSINESS_HOURS } from '@/modules/settings/utils/constants';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';
import { ROUTES } from '@/constants/routes';
import { detectTimezone } from './constants';
import BusinessTypeStep from './steps/BusinessTypeStep';
import HoursStep from './steps/HoursStep';
import type { Coordinates } from './LocationPicker';

/**
 * Mapbox GL toca `window` al importarse, así que el mapa se carga en el navegador.
 * Además solo hace falta en un paso: cargarlo antes sería bajar peso para una
 * pantalla que el usuario puede saltear.
 */
const LocationPicker = dynamic(() => import('./LocationPicker'), {
	ssr: false,
	loading: () => (
		<div className="h-64 animate-pulse rounded-lg border border-border bg-muted" />
	),
});

/**
 * Los cuatro pasos, en orden.
 *
 * El paso actual es **estado de interfaz**, no algo que se guarde. Lo que está
 * configurado de verdad lo responde `GET /onboarding/status` derivándolo de las
 * entidades; un `onboardingStep` en la base sería una segunda verdad que se
 * desincroniza en cuanto alguien borre un servicio o desconecte WhatsApp.
 */
const STEPS = ['name', 'type', 'location', 'hours'] as const;
type Step = (typeof STEPS)[number];

const TITLES: Record<Step, { title: string; hint: string }> = {
	name: {
		title: '¿Cómo se llama tu negocio?',
		hint: 'Es el nombre con el que Polaria se presenta a tus clientes.',
	},
	type: {
		title: '¿A qué se dedica?',
		hint: 'Nos ayuda a adaptar Polaria a tu rubro.',
	},
	location: {
		title: '¿Dónde queda?',
		hint: 'Si la cargás, Polaria puede enviarles la ubicación por WhatsApp. Podés dejarlo para después.',
	},
	hours: {
		title: 'Tus horarios',
		hint: 'Polaria solo agenda dentro de estos horarios.',
	},
};

const BusinessSetupWizard: React.FC = () => {
	const router = useRouter();
	const { data: settings, isLoading } = useGetSettings();
	const { mutateAsync: save, isPending, isError } = useUpdateSettings();

	const [step, setStep] = useState<Step>('name');

	const [name, setName] = useState<string | null>(null);
	const [businessType, setBusinessType] = useState<string | null>(null);
	const [location, setLocation] = useState<Coordinates | null>(null);
	const [locationTouched, setLocationTouched] = useState(false);
	const [schedule, setSchedule] = useState<ScheduleDraft | null>(null);

	const savedSchedule = useMemo(
		() =>
			toScheduleDraft(
				settings?.businessHours?.length
					? settings.businessHours
					: DEFAULT_BUSINESS_HOURS,
			),
		[settings?.businessHours],
	);

	const currentName = name ?? settings?.polariaName ?? '';
	const currentType = businessType ?? settings?.businessType ?? '';
	const currentSchedule = schedule ?? savedSchedule;
	const currentLocation = locationTouched
		? location
		: (settings?.location ?? null);

	const scheduleError = validateScheduleDraft(
		currentSchedule,
		'Marcá al menos un día de atención: sin horarios no se pueden tomar reservas.',
	);

	const stepIndex = STEPS.indexOf(step);

	// Cada paso decide si puede avanzar. La ubicación no aparece: es opcional y
	// saltearla es una respuesta válida, no un formulario incompleto.
	const canAdvance: Record<Step, boolean> = {
		name: currentName.trim().length > 0,
		type: Boolean(currentType),
		location: true,
		hours: !scheduleError,
	};

	const goBack = () => setStep(STEPS[Math.max(0, stepIndex - 1)]);
	const goNext = () =>
		setStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)]);

	/**
	 * Se guarda todo junto al final y no paso por paso.
	 *
	 * Un guardado por pantalla dejaría al negocio a mitad de camino si alguien
	 * abandona en el paso 3: con nombre y rubro cargados pero sin horarios,
	 * `businessSetupComplete` seguiría en falso y la próxima entrada lo traería
	 * de vuelta acá igual. Una sola escritura mantiene el estado coherente.
	 */
	const handleFinish = async () => {
		if (!canAdvance.hours) return;

		await save({
			polariaName: currentName.trim(),
			businessType: currentType,
			timezone: detectTimezone(),
			location: currentLocation,
			businessHours: fromScheduleDraft(currentSchedule),
		});

		// A los pasos que faltan y no a la agenda: crear el negocio es la mitad
		// del camino, y ahí es donde el usuario ve qué sigue.
		router.replace(ROUTES.setup);
	};

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-muted-foreground">
				Cargando...
			</div>
		);
	}

	const { title, hint } = TITLES[step];
	const isLast = stepIndex === STEPS.length - 1;

	return (
		<div className="flex min-h-dvh flex-col">
			<div className="flex-1 space-y-8">
				<div className="space-y-4">
					{/* Progreso: cuántos pasos hay y en cuál va, sin números. */}
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Configura tu negocio · {stepIndex + 1} de {STEPS.length}
						</span>
					</div>
					<div className="flex gap-2" aria-hidden="true">
						{STEPS.map((value, index) => (
							<span
								key={value}
								className={`h-0.5 flex-1 rounded-full ${
									index <= stepIndex ? 'bg-foreground' : 'bg-border'
								}`}
							/>
						))}
					</div>
				</div>

				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
					<p className="text-sm text-muted-foreground">{hint}</p>
				</div>

				{step === 'name' && (
					<Input
						autoFocus
						placeholder="Studio Nova"
						className="h-14 text-lg"
						value={currentName}
						onChange={(event) => setName(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter' && canAdvance.name) goNext();
						}}
					/>
				)}

				{step === 'type' && (
					<BusinessTypeStep value={currentType} onChange={setBusinessType} />
				)}

				{step === 'location' && (
					<LocationPicker
						value={currentLocation}
						onChange={(next) => {
							setLocationTouched(true);
							setLocation(next);
						}}
					/>
				)}

				{step === 'hours' && (
					<HoursStep
						value={currentSchedule}
						onChange={setSchedule}
						error={scheduleError}
					/>
				)}

				{isError && (
					<p className="text-sm text-red-600">
						No se pudo guardar. Intentá de nuevo.
					</p>
				)}
			</div>

			<div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background py-4">
				<Button
					type="button"
					variant="ghost"
					disabled={stepIndex === 0 || isPending}
					onClick={goBack}
				>
					<ArrowLeft className="mr-1 h-4 w-4" />
					Atrás
				</Button>

				<div className="flex items-center gap-2">
					{/* Saltear solo existe donde saltear es una respuesta válida. */}
					{step === 'location' && !currentLocation && (
						<Button type="button" variant="ghost" onClick={goNext}>
							Omitir
						</Button>
					)}

					<Button
						type="button"
						size="lg"
						disabled={!canAdvance[step] || isPending}
						onClick={() => (isLast ? void handleFinish() : goNext())}
					>
						{isPending
							? 'Guardando...'
							: isLast
								? 'Crear mi negocio'
								: 'Siguiente'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default BusinessSetupWizard;
