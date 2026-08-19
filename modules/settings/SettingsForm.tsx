'use client';

import { useMemo, useState } from 'react';
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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import WhatsappEmbeddedSignupButton from '@/modules/settings/WhatsappEmbeddedSignupButton';
import BotSwitchCard from '@/modules/settings/BotSwitchCard';
import WeeklyScheduleFields from '@/modules/schedule/WeeklyScheduleFields';
import {
	fromScheduleDraft,
	toScheduleDraft,
	validateScheduleDraft,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';
import {
	DEFAULT_BUSINESS_HOURS,
	DEFAULT_SETTINGS,
} from '@/modules/settings/utils/constants';
import { Check } from 'lucide-react';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';

type SettingsDraft = {
	polariaName?: string;
	schedule?: ScheduleDraft;
};

const SettingsForm: React.FC = () => {
	const { data, isLoading, isError } = useGetSettings();
	const {
		mutate: save,
		isPending,
		isSuccess,
		isError: saveError,
	} = useUpdateSettings();

	const [draft, setDraft] = useState<SettingsDraft>({});

	// Preferencias que hoy no viajan al backend; ver la nota al pie del archivo.
	const [slotDuration, setSlotDuration] = useState(
		DEFAULT_SETTINGS.appointmentSlotDuration,
	);
	const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');

	const polariaName =
		draft.polariaName ?? data?.polariaName ?? DEFAULT_SETTINGS.polariaName;

	const savedSchedule = useMemo(
		() =>
			toScheduleDraft(
				data?.businessHours?.length
					? data.businessHours
					: DEFAULT_BUSINESS_HOURS,
			),
		[data?.businessHours],
	);

	const schedule = draft.schedule ?? savedSchedule;

	const scheduleError = validateScheduleDraft(
		schedule,
		'Marca al menos un día de atención: sin horarios el negocio no puede recibir reservas.',
	);

	const whatsapp = data?.whatsappConnection;
	const disabled = isLoading || isPending;

	const handleSave = () => {
		if (scheduleError) return;

		save(
			{
				polariaName,
				businessHours: fromScheduleDraft(schedule),
			},
			{ onSuccess: () => setDraft({}) },
		);
	};

	return (
		<div className="space-y-6 max-w-2xl">
			{isError && (
				<p className="text-sm text-red-500">
					No se pudo cargar la configuración.
				</p>
			)}
			{saveError && (
				<p className="text-sm text-red-500">
					No se pudo guardar la configuración.
				</p>
			)}

			<BotSwitchCard />

			<WhatsappEmbeddedSignupButton
				connected={whatsapp?.connected ?? false}
				connectedAt={whatsapp?.connectedAt ?? null}
				phoneNumber={whatsapp?.phoneNumber ?? null}
				verifiedName={whatsapp?.verifiedName ?? null}
			/>
			{/* Barbershop Name */}
			<Card>
				<CardHeader>
					<CardTitle>Información de la Barbería</CardTitle>
					<CardDescription>
						Información básica sobre tu barbería
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="barbershop-name">Nombre de la Barbería</Label>
						<Input
							id="barbershop-name"
							value={polariaName}
							disabled={disabled}
							onChange={(e) =>
								setDraft((prev) => ({ ...prev, polariaName: e.target.value }))
							}
							placeholder="Ingresa el nombre de tu barbería"
						/>
					</div>
				</CardContent>
			</Card>

			{/*
			 * Días y horas se editan juntos porque son el mismo dato: un día abierto
			 * es un día con franjas. Separarlos obligaba a que todos compartieran un
			 * único horario, y el sábado corto no se podía expresar.
			 */}
			<Card>
				<CardHeader>
					<CardTitle>Horario de Atención</CardTitle>
					<CardDescription>
						Marca los días que abres y el horario de cada uno. Puedes agregar
						una segunda franja si cierras al mediodía.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<WeeklyScheduleFields
						draft={schedule}
						onChange={(next) =>
							setDraft((prev) => ({ ...prev, schedule: next }))
						}
					/>

					{scheduleError && (
						<p className="text-sm text-red-600">{scheduleError}</p>
					)}
				</CardContent>
			</Card>

			{/* Appointment Duration */}
			<Card>
				<CardHeader>
					<CardTitle>Configuración de Citas</CardTitle>
					<CardDescription>
						Configura la duración por defecto de los espacios de citas
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="slot-duration">
							Duración por Defecto de Espacios
						</Label>
						<Select
							value={String(slotDuration)}
							disabled={disabled}
							onValueChange={(value) => setSlotDuration(parseInt(value))}
						>
							<SelectTrigger id="slot-duration">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="15">15 minutos</SelectItem>
								<SelectItem value="20">20 minutos</SelectItem>
								<SelectItem value="30">30 minutos</SelectItem>
								<SelectItem value="45">45 minutos</SelectItem>
								<SelectItem value="60">60 minutos</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-sm text-muted-foreground mt-2">
							Esta duración se utiliza por defecto para nuevas citas
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Time Format Preference */}
			<Card>
				<CardHeader>
					<CardTitle>Formato de Hora</CardTitle>
					<CardDescription>
						Elige cómo se mostrarán las horas en toda la aplicación
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						<Label htmlFor="time-format">Formato de Hora</Label>
						<Select
							value={timeFormat}
							disabled={disabled}
							onValueChange={(value) => setTimeFormat(value as '24h' | '12h')}
						>
							<SelectTrigger id="time-format">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="24h">24 horas </SelectItem>
								<SelectItem value="12h">12 horas (3:00 PM)</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-sm text-muted-foreground mt-2">
							Este formato se aplicará en citas, horarios y toda la aplicación
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Save Button */}
			<Button
				onClick={handleSave}
				className="w-full md:w-auto"
				size="lg"
				disabled={disabled || Boolean(scheduleError)}
			>
				{isPending ? (
					'Guardando...'
				) : isSuccess ? (
					<>
						<Check className="w-4 h-4 mr-2" />
						Guardado
					</>
				) : (
					'Guardar Configuración'
				)}
			</Button>
		</div>
	);
};

export default SettingsForm;
