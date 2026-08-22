'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import WeeklyScheduleFields from '@/modules/schedule/WeeklyScheduleFields';
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
import { BUSINESS_TYPE_OPTIONS, detectTimezone } from './constants';
import type { Coordinates } from './LocationPicker';

/**
 * El mapa se carga solo en el navegador.
 *
 * Leaflet toca `window` al importarse, así que renderizarlo en el servidor
 * rompe el build. Y el resto del formulario no debería esperar a que baje el
 * mapa para poder completarse.
 */
const LocationPicker = dynamic(() => import('./LocationPicker'), {
	ssr: false,
	loading: () => (
		<div className="h-64 animate-pulse rounded-lg border border-border bg-muted" />
	),
});

/**
 * Configuración inicial del negocio: lo mínimo para que exista y sea reconocible.
 *
 * No pide servicios, staff ni WhatsApp a propósito. Eso es activar Polaria y va
 * después: obligar a cargarlo todo antes de ver el producto es la forma más
 * segura de que alguien abandone en el camino.
 *
 * Escribe por `/settings`, que ya es donde vive la configuración del negocio, en
 * lugar de un endpoint propio de onboarding: son los mismos campos y las mismas
 * validaciones.
 */
const BusinessSetupForm: React.FC = () => {
	const router = useRouter();
	const { data: settings, isLoading } = useGetSettings();
	const { mutateAsync: save, isPending, isError } = useUpdateSettings();

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
		'Marca al menos un día de atención: sin horarios no se pueden tomar reservas.',
	);

	const canSubmit =
		currentName.trim().length > 0 && Boolean(currentType) && !scheduleError;

	const handleSubmit = async () => {
		if (!canSubmit) return;

		await save({
			polariaName: currentName.trim(),
			businessType: currentType,
			// La zona del dispositivo se manda ahora: el negocio nace con la de
			// Bolivia y el horario que se está cargando se interpreta en esa zona.
			timezone: detectTimezone(),
			location: currentLocation,
			businessHours: fromScheduleDraft(currentSchedule),
		});

		router.replace(ROUTES.agenda);
	};

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-muted-foreground">
				Cargando...
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">
					Contanos de tu negocio
				</h1>
				<p className="text-sm text-muted-foreground">
					Con esto ya podés entrar. Después configurás tus servicios, tu equipo
					y WhatsApp.
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="business-name">Nombre del negocio</Label>
				<Input
					id="business-name"
					autoFocus
					placeholder="Studio Nova"
					value={currentName}
					onChange={(event) => setName(event.target.value)}
				/>
				<p className="text-xs text-muted-foreground">
					Es el nombre con el que Polaria se presenta a tus clientes.
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="business-type">Tipo de negocio</Label>
				<Select value={currentType} onValueChange={setBusinessType}>
					<SelectTrigger id="business-type">
						<SelectValue placeholder="Elegí una opción" />
					</SelectTrigger>
					<SelectContent>
						{BUSINESS_TYPE_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between gap-2">
					<Label>Ubicación</Label>
					<span className="text-xs text-muted-foreground">Opcional</span>
				</div>
				<p className="text-xs text-muted-foreground">
					Si la cargás, Polaria puede enviarles la ubicación por WhatsApp a tus
					clientes. Podés dejarla para después.
				</p>
				<LocationPicker
					value={currentLocation}
					onChange={(next) => {
						setLocationTouched(true);
						setLocation(next);
					}}
				/>
			</div>

			<div className="space-y-2">
				<Label>Horario de atención</Label>
				<p className="text-xs text-muted-foreground">
					Marcá los días que abrís y el horario de cada uno. Podés agregar una
					segunda franja si cerrás al mediodía.
				</p>
				{/* El mismo componente que usa Configuración: un solo lugar donde se
				    edita una jornada semanal. */}
				<WeeklyScheduleFields
					draft={currentSchedule}
					onChange={setSchedule}
				/>
				{scheduleError && (
					<p className="text-sm text-red-600">{scheduleError}</p>
				)}
			</div>

			{isError && (
				<p className="text-sm text-red-600">
					No se pudo guardar. Intentá de nuevo.
				</p>
			)}

			<Button
				size="lg"
				className="w-full"
				disabled={!canSubmit || isPending}
				onClick={() => void handleSubmit()}
			>
				{isPending ? 'Guardando...' : 'Crear mi negocio'}
			</Button>
		</div>
	);
};

export default BusinessSetupForm;
