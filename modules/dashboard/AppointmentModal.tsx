'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { getStaff } from '@/services/staff';
import { createAppointment } from '@/services/appointments';
import { findOrCreateClient } from '@/services/clients';
import type { StaffApi } from '@/types/appointments.types';
import useAuth from '@/modules/auth/hooks/useAuth';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import useGetServices from '@/services/services/useGetServices';

interface Props {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onAddAppointment: (appointment: any) => void;
}

const AppointmentModal = ({ onAddAppointment }: Props) => {
	const [open, setOpen] = useState(false);
	const [staff, setStaff] = useState<StaffApi[]>([]);
	const [loadingStaff, setLoadingStaff] = useState(false);
	const [staffError, setStaffError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const { data: user } = useAuth();
	const [formData, setFormData] = useState({
		time: '09:00',
		serviceIds: [] as string[],
		staffId: '',
		clientName: '',
		clientPhone: '',
	});

	const activeStaff = useMemo(() => staff.filter((s) => s.isActive), [staff]);

	const {
		data: servicesData,
		isLoading: isServiceLoading,
		error: serviceError,
	} = useGetServices();

	const services = servicesData || [];

	useEffect(() => {
		if (!open) {
			return;
		}
		const loadStaff = async () => {
			try {
				setLoadingStaff(true);
				setStaffError(null);
				const data = await getStaff();
				setStaff(data);
			} catch (error) {
				console.error('Error loading staff:', error);
				setStaffError('No se pudieron cargar los barberos');
			} finally {
				setLoadingStaff(false);
			}
		};

		loadStaff();
	}, [open]);

	const parseTimeToHoursMinutes = (value: string): { hours: number; minutes: number } | null => {
		const raw = value.trim();

		const match12h = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
		if (match12h) {
			let hours = Number(match12h[1]);
			const minutes = Number(match12h[2]);
			const ampm = match12h[3].toUpperCase();
			if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
			if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
			if (ampm === 'PM' && hours !== 12) hours += 12;
			if (ampm === 'AM' && hours === 12) hours = 0;
			return { hours, minutes };
		}

		const match24h = raw.match(/^(\d{1,2}):(\d{2})$/);
		if (match24h) {
			const hours = Number(match24h[1]);
			const minutes = Number(match24h[2]);
			if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
			if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
			return { hours, minutes };
		}

		return null;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		if (
			!formData.clientName ||
			!formData.clientPhone ||
			!formData.time ||
			formData.serviceIds.length === 0 ||
			!formData.staffId
		) {
			if (!formData.clientPhone) {
				setSubmitError('El teléfono es obligatorio');
			}
			return;
		}

		const parsed = parseTimeToHoursMinutes(formData.time);
		if (!parsed) {
			setSubmitError('Hora inválida. Usa formato 16:00 o 04:00 PM');
			return;
		}
		const { hours, minutes } = parsed;
		const appointmentTime = new Date();
		appointmentTime.setHours(hours, minutes, 0, 0);
		const timeLabel = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		const sortKey = hours * 60 + minutes;
		const selectedServices = services.filter((s) =>
			formData.serviceIds.includes(s.id),
		);
		const totalMinutes = selectedServices.reduce(
			(sum, s) => sum + s.durationMinutes,
			0,
		);
		const endTime = new Date(
			appointmentTime.getTime() + (totalMinutes || 30) * 60000,
		);

		const submit = async () => {
			try {
				setSubmitting(true);

				// Primero buscar o crear el cliente
				const client = await findOrCreateClient({
					name: formData.clientName,
					phone: formData.clientPhone,
				});

				// Luego crear la cita con el clientId
				const created = await createAppointment({
					clientId: client.id,
					staffId: formData.staffId,
					serviceIds: formData.serviceIds,
					startTime: appointmentTime.toISOString(),
					endTime: endTime.toISOString(),
					tenantId: user?.id,
				});

				const staffMember = staff.find((s) => s.name === created.staffName);
				const serviceNames = selectedServices.map((s) => s.name).join(', ');

				onAddAppointment({
					id: created.id,
					clientName: formData.clientName,
					timeLabel,
					sortKey,
					service: serviceNames || 'Sin servicio',
					barber: staffMember?.name ?? 'Sin barbero',
					status: created.status,
					duration: totalMinutes || 30,
				});

				setFormData({
					time: '09:00',
					serviceIds: [],
					staffId: '',
					clientName: '',
					clientPhone: '',
				});
				setOpen(false);
			} catch (error) {
				if (axios.isAxiosError(error)) {
					const status = error.response?.status;
					if (status === 409) {
						const message =
							typeof error.response?.data?.message === 'string'
								? error.response?.data?.message
								: 'Horario no disponible para este staff';
						setSubmitError(message);
						return;
					}
				}
				setSubmitError('No se pudo crear la cita. Intenta de nuevo.');
				console.error('Error creating appointment:', error);
			} finally {
				setSubmitting(false);
			}
		};

		submit();
	};

	return (
		<>
			<Button onClick={() => setOpen(true)} className="gap-2">
				<Plus className="w-4 h-4" />
				Agregar cita
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Agregar cita</DialogTitle>
						<DialogDescription>
							Añade una nueva cita a la agenda
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{submitError && (
							<p className="text-sm text-destructive">{submitError}</p>
						)}
						<div>
							<Label htmlFor="clientName">Nombre del cliente</Label>
							<Input
								id="clientName"
								placeholder="Ingresa el nombre del cliente"
								value={formData.clientName}
								onChange={(e) =>
									setFormData({ ...formData, clientName: e.target.value })
								}
							/>
						</div>
						<div>
							<Label htmlFor="clientPhone">Teléfono</Label>
							<Input
								id="clientPhone"
								placeholder="Ingresa el teléfono del cliente"
								value={formData.clientPhone}
								onChange={(e) =>
									setFormData({ ...formData, clientPhone: e.target.value })
								}
							/>
						</div>

						<div>
							<Label htmlFor="time">Hora</Label>
							<Input
								id="time"
								type="time"
								value={formData.time}
								onChange={(e) =>
									setFormData({ ...formData, time: e.target.value })
								}
							/>
						</div>

						<div>
							<Label htmlFor="service">Servicio</Label>
							<div className="space-y-2 border border-border rounded-md p-3 max-h-40 overflow-y-auto">
								{services.map((service) => {
									const checked = formData.serviceIds.includes(service.id);
									return (
										<label
											key={service.id}
											className="flex items-center gap-2 text-sm"
										>
											<Checkbox
												checked={checked}
												onCheckedChange={(value) => {
													const isChecked = value === true;
													setFormData((prev) => ({
														...prev,
														serviceIds: isChecked
															? [...prev.serviceIds, service.id]
															: prev.serviceIds.filter(
																	(id) => id !== service.id,
																),
													}));
												}}
											/>
											<span>{service.name}</span>
										</label>
									);
								})}
								{services.length === 0 && (
									<p className="text-xs text-muted-foreground">
										{isServiceLoading
											? 'Cargando servicios...'
											: 'No hay servicios disponibles'}
									</p>
								)}
							</div>
							{serviceError && (
								<p className="text-xs text-destructive mt-2">
									{serviceError.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="barber">Barbero</Label>
							<Select
								value={formData.staffId}
								onValueChange={(value) =>
									setFormData({ ...formData, staffId: value })
								}
								disabled={loadingStaff || activeStaff.length === 0}
							>
								<SelectTrigger id="barber">
									<SelectValue
										placeholder={
											loadingStaff
												? 'Cargando barberos...'
												: 'Seleccionar barbero'
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{activeStaff.map((staff) => (
										<SelectItem key={staff.id} value={staff.id}>
											{staff.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{staffError && (
								<p className="text-xs text-destructive mt-2">{staffError}</p>
							)}
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={submitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={submitting}>
								{submitting ? 'Creando...' : 'Create Appointment'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AppointmentModal;
