'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Check, Plus } from 'lucide-react';
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
import { Spinner } from '@/components/ui/spinner';
import useCreateAppointment from '@/services/appointments/useCreateAppointment';
import useGetBookingSlots from '@/services/availability/useGetBookingSlots';
import useGetServices from '@/services/services/useGetServices';
import useGetStaff from '@/services/staff/useGetStaff';
import { findOrCreateClient } from '@/services/clients';
import { formatLongDate } from '@/lib/date';

/** Los cuatro pasos, en el orden en que cada uno depende del anterior. */
const STEPS = ['cliente', 'servicio', 'profesional', 'hora'] as const;
type Step = (typeof STEPS)[number];

const STEP_TITLES: Record<Step, string> = {
	cliente: '¿Para quién es la cita?',
	servicio: '¿Qué servicio?',
	profesional: '¿Quién atiende?',
	hora: '¿A qué hora?',
};

/** Opción de una lista de pasos: el borde marca la elegida. */
const selectableClass = (selected: boolean) =>
	[
		'w-full rounded-md border p-3 text-left transition-colors hover:bg-accent',
		selected ? 'border-primary' : 'border-border',
	].join(' ');

interface Props {
	/** Día que se está viendo en la agenda. Es la única fuente de la fecha. */
	selectedDate: string;
}

/**
 * Creación manual de una cita, en cuatro pasos.
 *
 * El orden no es estético: cada paso acota al siguiente. El servicio define qué
 * profesionales pueden hacerlo, el profesional define qué horarios tiene libres,
 * y la duración del servicio define cuáles de esos horarios entran completos. Un
 * formulario plano dejaba elegir combinaciones que no existían y recién fallaban
 * al guardar.
 *
 * La fecha no es un paso: sale del día abierto en la agenda. El diálogo es modal
 * y su overlay tapa el calendario, así que no puede cambiar mientras se completa
 * el formulario y no hace falta copiarla a un estado propio.
 */
const AppointmentModal: React.FC<Props> = ({ selectedDate }) => {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<Step>('cliente');

	const [clientName, setClientName] = useState('');
	const [serviceId, setServiceId] = useState<string | null>(null);
	const [staffId, setStaffId] = useState<string | null>(null);
	const [slotStart, setSlotStart] = useState<string | null>(null);

	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const { mutateAsync: createAppointment } = useCreateAppointment();
	const { data: services = [] } = useGetServices();
	const { data: staff = [] } = useGetStaff();
	const {
		data: slots = [],
		isFetching: loadingSlots,
		isError: slotsError,
	} = useGetBookingSlots(selectedDate, serviceId, staffId);

	const activeServices = useMemo(
		() => services.filter((service) => service.isActive),
		[services],
	);

	/**
	 * Solo quienes tienen el servicio asignado.
	 *
	 * Es el mismo criterio que aplica el backend al calcular disponibilidad
	 * —activo y con ese servicio—, así que la lista no ofrece a nadie que después
	 * vaya a devolver cero horarios.
	 */
	const eligibleStaff = useMemo(() => {
		if (!serviceId) return [];
		return staff.filter(
			(member) =>
				member.isActive &&
				(member.services ?? []).some((service) => service.id === serviceId),
		);
	}, [staff, serviceId]);

	const selectedService = activeServices.find(
		(service) => service.id === serviceId,
	);
	const selectedStaff = eligibleStaff.find((member) => member.id === staffId);
	const selectedSlot = slots.find((slot) => slot.startTime === slotStart);

	const resetAll = () => {
		setStep('cliente');
		setClientName('');
		setServiceId(null);
		setStaffId(null);
		setSlotStart(null);
		setSubmitError(null);
	};

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) resetAll();
	};

	// Cambiar un paso invalida los que dependían de él. Se limpia en lugar de
	// intentar conservar la selección: un horario calculado para otro profesional
	// no significa nada.
	const chooseService = (id: string) => {
		setServiceId(id);
		setStaffId(null);
		setSlotStart(null);
		setStep('profesional');
	};

	const chooseStaff = (id: string) => {
		setStaffId(id);
		setSlotStart(null);
		setStep('hora');
	};

	const stepIndex = STEPS.indexOf(step);
	const goBack = () => setStep(STEPS[Math.max(0, stepIndex - 1)]);

	const formatSlot = (iso: string) =>
		new Intl.DateTimeFormat('es', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		}).format(new Date(iso));

	const handleCreate = async () => {
		if (!clientName || !serviceId || !staffId || !selectedSlot) return;

		setSubmitError(null);
		setSubmitting(true);

		try {
			const client = await findOrCreateClient({ name: clientName });

			await createAppointment({
				clientId: client.id,
				staffId,
				serviceIds: [serviceId],
				// Los dos instantes salen del slot: la duración ya la resolvió quien
				// calculó la disponibilidad, y recalcularla acá sería una segunda
				// cuenta que puede no coincidir.
				startTime: selectedSlot.startTime,
				endTime: selectedSlot.endTime,
			});

			handleOpenChange(false);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 409) {
				// Entre listar y crear, WhatsApp pudo tomar ese horario.
				setSubmitError('Ese horario acaba de ocuparse. Elegí otro de la lista.');
				setSlotStart(null);
				return;
			}
			setSubmitError('No se pudo crear la cita. Intenta de nuevo.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Button onClick={() => setOpen(true)} className="gap-2">
				<Plus className="h-4 w-4" />
				Agregar cita
			</Button>

			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{STEP_TITLES[step]}</DialogTitle>
						{/* La fecha se muestra como contexto: no se edita acá. */}
						<DialogDescription className="capitalize">
							{formatLongDate(selectedDate)}
						</DialogDescription>
					</DialogHeader>

					{/* Resumen de lo ya elegido, para no perder el hilo entre pasos. */}
					{stepIndex > 0 && (
						<p className="text-xs text-muted-foreground">
							{[clientName, selectedService?.name, selectedStaff?.name]
								.filter(Boolean)
								.join(' · ')}
						</p>
					)}

					<div className="min-h-56 space-y-3">
						{step === 'cliente' && (
							<div className="space-y-2">
								<Label htmlFor="client-name">Nombre del cliente</Label>
								<Input
									id="client-name"
									autoFocus
									placeholder="Ingresa el nombre"
									value={clientName}
									onChange={(e) => setClientName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && clientName.trim()) {
											setStep('servicio');
										}
									}}
								/>
							</div>
						)}

						{step === 'servicio' && (
							<div className="space-y-2">
								{activeServices.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No hay servicios activos. Creá uno en la pantalla de
										Servicios.
									</p>
								) : (
									activeServices.map((service) => (
										<button
											key={service.id}
											type="button"
											onClick={() => chooseService(service.id)}
											className={selectableClass(service.id === serviceId)}
										>
											<span className="block text-sm font-medium">
												{service.name}
											</span>
											<span className="block text-xs text-muted-foreground">
												{service.durationMinutes} min
											</span>
										</button>
									))
								)}
							</div>
						)}

						{step === 'profesional' && (
							<div className="space-y-2">
								{eligibleStaff.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										Ningún profesional tiene asignado este servicio. Asignalo en
										la pantalla de Staff o elegí otro servicio.
									</p>
								) : (
									eligibleStaff.map((member) => (
										<button
											key={member.id}
											type="button"
											onClick={() => chooseStaff(member.id)}
											className={selectableClass(member.id === staffId)}
										>
											<span className="block text-sm font-medium">
												{member.name}
											</span>
										</button>
									))
								)}
							</div>
						)}

						{step === 'hora' && (
							<div className="space-y-3">
								{loadingSlots ? (
									<div className="flex justify-center py-8">
										<Spinner />
									</div>
								) : slotsError ? (
									<p className="text-sm text-red-600">
										No se pudieron cargar los horarios. Intenta de nuevo.
									</p>
								) : slots.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No hay horarios disponibles para ese servicio con ese
										profesional en esta fecha. Probá con otro profesional o con
										otro día.
									</p>
								) : (
									<div className="grid grid-cols-4 gap-2">
										{slots.map((slot) => (
											<Button
												key={slot.startTime}
												type="button"
												size="sm"
												variant={
													slot.startTime === slotStart ? 'default' : 'outline'
												}
												className="tabular-nums"
												onClick={() => setSlotStart(slot.startTime)}
											>
												{formatSlot(slot.startTime)}
											</Button>
										))}
									</div>
								)}
							</div>
						)}

						{submitError && (
							<p className="text-sm text-red-600">{submitError}</p>
						)}
					</div>

					<div className="flex items-center justify-between gap-2 border-t border-border pt-4">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={stepIndex === 0 ? () => handleOpenChange(false) : goBack}
						>
							{stepIndex === 0 ? (
								'Cancelar'
							) : (
								<>
									<ArrowLeft className="mr-1 h-4 w-4" />
									Atrás
								</>
							)}
						</Button>

						{step === 'cliente' && (
							<Button
								type="button"
								disabled={!clientName.trim()}
								onClick={() => setStep('servicio')}
							>
								Continuar
							</Button>
						)}

						{step === 'hora' && (
							<Button
								type="button"
								disabled={!selectedSlot || submitting}
								onClick={() => void handleCreate()}
							>
								<Check className="mr-1 h-4 w-4" />
								{submitting ? 'Creando...' : 'Crear cita'}
							</Button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AppointmentModal;
