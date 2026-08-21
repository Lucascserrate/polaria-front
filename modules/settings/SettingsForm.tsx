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
import RemindersCard from '@/modules/settings/RemindersCard';
import { DEFAULT_REMINDER_LEAD_MINUTES } from '@/modules/settings/utils/reminders';
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
	remindersEnabled?: boolean;
	reminderLeadMinutes?: number;
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

	const remindersEnabled =
		draft.remindersEnabled ?? data?.reminders.enabled ?? true;
	const reminderLeadMinutes =
		draft.reminderLeadMinutes ??
		data?.reminders.leadMinutes ??
		DEFAULT_REMINDER_LEAD_MINUTES;

	const handleSave = () => {
		if (scheduleError) return;

		save(
			{
				polariaName,
				businessHours: fromScheduleDraft(schedule),
				remindersEnabled,
				reminderLeadMinutes,
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
				unavailableSince={whatsapp?.unavailableSince ?? null}
				unavailableReason={whatsapp?.unavailableReason ?? null}
			/>
			{/* Business Name */}
			<Card>
				<CardHeader>
					<CardTitle>Información del Negocio</CardTitle>
					<CardDescription>Información básica sobre tu negocio</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="business-name">Nombre del Negocio</Label>
						<Input
							id="business-name"
							value={polariaName}
							disabled={disabled}
							onChange={(e) =>
								setDraft((prev) => ({ ...prev, polariaName: e.target.value }))
							}
							placeholder="Ingresa el nombre de tu negocio"
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

			{/*
			 * Se guarda con el botón del final, como el resto del formulario. El
			 * interruptor de Polaria es la excepción justificada —es un corte de
			 * emergencia—, y sumar un segundo guardado instantáneo acá dejaría la
			 * pantalla con dos modelos de guardado compitiendo.
			 */}
			<RemindersCard
				enabled={remindersEnabled}
				leadMinutes={reminderLeadMinutes}
				disabled={disabled}
				whatsappConnected={whatsapp?.connected ?? false}
				templateStatus={whatsapp?.reminderTemplateStatus}
				onEnabledChange={(next) =>
					setDraft((prev) => ({ ...prev, remindersEnabled: next }))
				}
				onLeadMinutesChange={(next) =>
					setDraft((prev) => ({ ...prev, reminderLeadMinutes: next }))
				}
			/>

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
