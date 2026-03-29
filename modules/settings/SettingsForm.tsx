'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
	WORKING_DAYS,
	DEFAULT_SETTINGS,
} from '@/modules/settings/utils/constants';
import { Check } from 'lucide-react';

interface Settings {
	barbershopName: string;
	workingDays: boolean[];
	openingHours: { from: string; to: string };
	appointmentSlotDuration: number;
}

const SettingsForm: React.FC = () => {
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [saved, setSaved] = useState(false);
	const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');

	const toggleWorkingDay = (index: number) => {
		const newDays = [...settings.workingDays];
		newDays[index] = !newDays[index];
		setSettings({ ...settings, workingDays: newDays });
	};

	return (
		<div className="space-y-6 max-w-2xl">
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
							value={settings.barbershopName}
							onChange={(e) =>
								setSettings({ ...settings, barbershopName: e.target.value })
							}
							placeholder="Ingresa el nombre de tu barbería"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Working Hours */}
			<Card>
				<CardHeader>
					<CardTitle>Horario de Trabajo</CardTitle>
					<CardDescription>
						Establece los horarios de apertura y cierre de tu barbería
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="opening-time">Hora de Apertura</Label>
							<Input
								id="opening-time"
								type="time"
								value={settings.openingHours.from}
								onChange={(e) =>
									setSettings({
										...settings,
										openingHours: {
											...settings.openingHours,
											from: e.target.value,
										},
									})
								}
							/>
						</div>
						<div>
							<Label htmlFor="closing-time">Hora de Cierre</Label>
							<Input
								id="closing-time"
								type="time"
								value={settings.openingHours.to}
								onChange={(e) =>
									setSettings({
										...settings,
										openingHours: {
											...settings.openingHours,
											to: e.target.value,
										},
									})
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Working Days */}
			<Card>
				<CardHeader>
					<CardTitle>Días de Trabajo</CardTitle>
					<CardDescription>
						Selecciona los días que tu barbería está abierta
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{WORKING_DAYS.map((day, index) => (
							<div key={day} className="flex items-center gap-2">
								<Checkbox
									id={`day-${index}`}
									checked={settings.workingDays[index]}
									onCheckedChange={() => toggleWorkingDay(index)}
								/>
								<Label
									htmlFor={`day-${index}`}
									className="cursor-pointer font-normal"
								>
									{day}
								</Label>
							</div>
						))}
					</div>
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
							value={String(settings.appointmentSlotDuration)}
							onValueChange={(value) =>
								setSettings({
									...settings,
									appointmentSlotDuration: parseInt(value),
								})
							}
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
				onClick={() => setSaved(true)}
				className="w-full md:w-auto"
				size="lg"
			>
				{saved ? (
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
