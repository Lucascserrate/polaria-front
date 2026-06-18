'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { AppointmentStatus } from '@/types/appointments.types';
import {
	getAppointment,
	updateAppointment,
	type AppointmentDetailApi,
} from '@/services/appointments';

type Props = {
	appointmentId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
};

const toDateTimeLocal = (value?: string) => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate(),
	)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EditAppointmentDialog = ({
	appointmentId,
	open,
	onOpenChange,
	onSaved,
}: Props) => {
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [appointment, setAppointment] = useState<AppointmentDetailApi | null>(
		null,
	);
	const [startTime, setStartTime] = useState('');
	const [status, setStatus] = useState<AppointmentStatus>('confirmed');
	const [error, setError] = useState('');

	useEffect(() => {
		if (!open || !appointmentId) return;

		let active = true;
		setLoading(true);
		setError('');

		void getAppointment(appointmentId)
			.then((data) => {
				if (!active) return;
				setAppointment(data);
				setStartTime(toDateTimeLocal(data.startTime ?? data.startTimeFormatted));
				setStatus(data.status);
			})
			.catch((err) => {
				if (!active) return;
				console.error('Error loading appointment:', err);
				setError('No se pudo cargar la cita para editarla.');
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [appointmentId, open]);

	const handleSave = async () => {
		if (!appointment || !startTime) return;

		const nextStart = new Date(startTime);
		if (Number.isNaN(nextStart.getTime())) {
			setError('La fecha u hora no es válida.');
			return;
		}

		const currentStart = appointment.startTime
			? new Date(appointment.startTime)
			: new Date(appointment.startTimeFormatted);
		const currentEnd = appointment.endTime
			? new Date(appointment.endTime)
			: new Date(appointment.endTimeFormatted);
		const durationMinutes = Math.max(
			15,
			Math.round((currentEnd.getTime() - currentStart.getTime()) / 60000),
		);
		const nextEnd = new Date(nextStart.getTime() + durationMinutes * 60000);

		try {
			setSaving(true);
			setError('');
			await updateAppointment(appointment.id, {
				startTime: nextStart.toISOString(),
				endTime: nextEnd.toISOString(),
				status,
			});
			onSaved();
			onOpenChange(false);
		} catch (err) {
			console.error('Error updating appointment:', err);
			setError('No se pudo actualizar la cita. Intenta de nuevo.');
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Editar cita</DialogTitle>
					<DialogDescription>
						Cambia la fecha, hora o estado de la cita sin eliminarla.
					</DialogDescription>
				</DialogHeader>

				{loading ? (
					<p className="text-sm text-muted-foreground">Cargando cita...</p>
				) : (
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Fecha y hora</label>
							<Input
								type="datetime-local"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Estado</label>
							<Select
								value={status}
								onValueChange={(value: AppointmentStatus) => setStatus(value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pendiente</SelectItem>
									<SelectItem value="booked">Reservada</SelectItem>
									<SelectItem value="confirmed">Confirmada</SelectItem>
									<SelectItem value="completed">Completada</SelectItem>
									<SelectItem value="cancelled">Cancelada</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{error ? (
							<p className="text-sm text-destructive">{error}</p>
						) : null}

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={saving}
							>
								Cancelar
							</Button>
							<Button type="button" onClick={handleSave} disabled={saving}>
								{saving ? 'Guardando...' : 'Guardar cambios'}
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default EditAppointmentDialog;
