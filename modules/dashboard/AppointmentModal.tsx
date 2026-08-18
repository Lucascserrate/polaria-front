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
import { getStaff } from '@/services/staff/staff.service';
import useCreateAppointment from '@/services/appointments/useCreateAppointment';
import { findOrCreateClient } from '@/services/clients';
import type { StaffApi } from '@/types/appointments.types';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import useGetServices from '@/services/services/useGetServices';
import { getSettings } from '@/services/settings/settings.service';
import type { WeeklyRange } from '@/modules/schedule/utils/weeklySchedule';

const AppointmentModal = () => {
	// La invalidación vive en el hook, así que crear una cita refresca la agenda
	// sin que el modal tenga que avisarle a nadie.
	const { mutateAsync: createAppointment } = useCreateAppointment();

	const getTodayDate = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const [open, setOpen] = useState(false);
	const [staff, setStaff] = useState<StaffApi[]>([]);
	const [loadingStaff, setLoadingStaff] = useState(false);
	const [staffError, setStaffError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [businessHours, setBusinessHours] = useState<WeeklyRange[]>([]);
	const [formData, setFormData] = useState({
		date: getTodayDate(),
		time: '09:00',
		serviceIds: [] as string[],
		staffId: '',
		clientName: '',
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
		const loadConfig = async () => {
			try {
				const settings = await getSettings();
				setBusinessHours(settings.businessHours ?? []);

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

		loadConfig();
	}, [open]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		if (
			!formData.clientName ||
			!formData.date ||
			!formData.time ||
			formData.serviceIds.length === 0 ||
			!formData.staffId
		) {
			return;
		}

		const selectedDate = new Date(`${formData.date}T00:00:00`);
		if (Number.isNaN(selectedDate.getTime())) {
			setSubmitError('Fecha inválida.');
			return;
		}

		// Un día sin franjas es un día cerrado. Se chequea solo si el horario ya
		// cargó: con la lista vacía no se sabe nada y no hay que bloquear nada.
		const dayIndex = selectedDate.getDay();
		if (
			businessHours.length > 0 &&
			!businessHours.some((range) => range.dayOfWeek === dayIndex)
		) {
			setSubmitError(
				dayIndex === new Date().getDay()
					? 'Hoy no se atiende. Selecciona otro día.'
					: 'Ese día no se atiende. Selecciona otro día.',
			);
			return;
		}

		const [hours, minutes] =
			typeof formData.time === 'string' && formData.time.includes(':')
				? formData.time.split(':').map(Number)
				: [9, 0];
		const appointmentTime = new Date(`${formData.date}T${formData.time}:00`);
		appointmentTime.setHours(hours, minutes, 0, 0);

		const selectedServices = services.filter((service) =>
			formData.serviceIds.includes(service.id),
		);
		const totalMinutes = selectedServices.reduce(
			(sum, service) => sum + service.durationMinutes,
			0,
		);
		const endTime = new Date(
			appointmentTime.getTime() + (totalMinutes || 30) * 60000,
		);

		const submit = async () => {
			try {
				setSubmitting(true);

				const client = await findOrCreateClient({
					name: formData.clientName,
				});

				await createAppointment({
					clientId: client.id,
					staffId: formData.staffId,
					serviceIds: formData.serviceIds,
					startTime: appointmentTime.toISOString(),
					endTime: endTime.toISOString(),
				});

				setFormData({
					date: getTodayDate(),
					time: '09:00',
					serviceIds: [],
					staffId: '',
					clientName: '',
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
				// El hook ya loguea el error; acá solo se traduce a mensaje visible.
				setSubmitError('No se pudo crear la cita. Intenta de nuevo.');
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
							<Label htmlFor="date">Fecha</Label>
							<Input
								id="date"
								type="date"
								value={formData.date}
								onChange={(e) =>
									setFormData({ ...formData, date: e.target.value })
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
								Cancelar
							</Button>
							<Button type="submit" disabled={submitting}>
								{submitting ? 'Creando...' : 'Crear cita'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AppointmentModal;
