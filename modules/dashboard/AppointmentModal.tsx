'use client';

import { useState } from 'react';
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
import { MOCK_STAFF, MOCK_SERVICES, MOCK_APPOINTMENTS } from '@/lib/mocks';
import { Plus } from 'lucide-react';

interface Props {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onAddAppointment: (appointment: any) => void;
}

const AppointmentModal = ({ onAddAppointment }: Props) => {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		clientName: '',
		time: '09:00',
		service: '',
		barber: '',
	});

	const activeStaff = MOCK_STAFF.filter((s) => s.active);
	const selectedService = MOCK_SERVICES.find((s) => s.id === formData.service);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.clientName ||
			!formData.time ||
			!formData.service ||
			!formData.barber
		) {
			return;
		}

		const [hours, minutes] = formData.time.split(':').map(Number);
		const appointmentTime = new Date();
		appointmentTime.setHours(hours, minutes, 0, 0);

		const newAppointment = {
			id: String(
				Math.max(...MOCK_APPOINTMENTS.map((a) => parseInt(a.id)), 0) + 1,
			),
			clientName: formData.clientName,
			time: appointmentTime,
			service: formData.service,
			barber: formData.barber,
			status: 'confirmed' as const,
			duration: selectedService?.durationMinutes || 30,
		};

		onAddAppointment(newAppointment);
		setFormData({ clientName: '', time: '09:00', service: '', barber: '' });
		setOpen(false);
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
						<div>
							<Label htmlFor="client">Nombre del cliente</Label>
							<Input
								id="client"
								placeholder="Ingrese el nombre del cliente"
								value={formData.clientName}
								onChange={(e) =>
									setFormData({ ...formData, clientName: e.target.value })
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
							<Select
								value={formData.service}
								onValueChange={(value) =>
									setFormData({ ...formData, service: value })
								}
							>
								<SelectTrigger id="service">
									<SelectValue placeholder="Seleccionar servicio" />
								</SelectTrigger>
								<SelectContent>
									{MOCK_SERVICES.map((service) => (
										<SelectItem key={service.id} value={service.id}>
											{service.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="barber">Barbero</Label>
							<Select
								value={formData.barber}
								onValueChange={(value) =>
									setFormData({ ...formData, barber: value })
								}
							>
								<SelectTrigger id="barber">
									<SelectValue placeholder="Seleccionar barbero" />
								</SelectTrigger>
								<SelectContent>
									{activeStaff.map((staff) => (
										<SelectItem key={staff.id} value={staff.name}>
											{staff.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Create Appointment</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AppointmentModal;
