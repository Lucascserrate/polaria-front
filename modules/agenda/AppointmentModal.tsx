'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WizardShell from '@/modules/appointment-wizard/WizardShell';
import ClientStep from '@/modules/appointment-wizard/steps/ClientStep';
import ServiceStep from '@/modules/appointment-wizard/steps/ServiceStep';
import StaffStep from '@/modules/appointment-wizard/steps/StaffStep';
import { eligibleStaffFor } from '@/modules/appointment-wizard/options';
import { useAppointmentDraft } from '@/modules/appointment-wizard/useAppointmentDraft';
import AvailableSlotStep from '@/modules/agenda/steps/AvailableSlotStep';
import useCreateAppointment from '@/services/appointments/useCreateAppointment';
import useGetBookingSlots from '@/services/availability/useGetBookingSlots';
import useGetServices from '@/services/services/useGetServices';
import useGetStaff from '@/services/staff/useGetStaff';
import { findOrCreateClient } from '@/services/clients';
import useGetSettings from '@/services/settings/useGetSettings';
import {
	formatMinute,
	minutesInTimeZone,
} from '@/modules/agenda/utils/calendarLayout';
import { describeDay } from '@/modules/agenda/utils/calendarLabels';

/** Los cuatro pasos, en el orden en que cada uno depende del anterior. */
const STEPS = ['cliente', 'servicio', 'profesional', 'hora'] as const;
type Step = (typeof STEPS)[number];

const STEP_TITLES: Record<Step, string> = {
	cliente: '¿Para quién es la cita?',
	servicio: '¿Qué servicio?',
	profesional: '¿Quién atiende?',
	hora: '¿A qué hora?',
};

interface Props {
	open: boolean;
	onClose: () => void;
	/** Día para el que se crea la cita, `YYYY-MM-DD`. */
	date: string;
	/**
	 * Hora pedida al hacer click en un hueco de la grilla, en minutos del día.
	 *
	 * Es una preferencia y no un dato: el horario tiene que existir entre los que
	 * la disponibilidad ofrece para ese servicio y ese profesional. Si no existe,
	 * se dice y se elige de la lista.
	 */
	minute?: number | null;
	/** Profesional pedido, cuando el click salió de su columna. */
	staffId?: string | null;
}

/**
 * Creación de una reserva desde la agenda.
 *
 * Responde a una sola pregunta: **qué se puede reservar**. La fecha sale del día
 * abierto en el calendario y no se edita acá, y los horarios que ofrece son los
 * que quedan libres de ahora en adelante.
 *
 * Registrar una atención que ya ocurrió —la de ayer que quedó sin cargar— no se
 * hace desde acá: es una corrección administrativa, con otra pregunta y sin
 * disponibilidad que consultar. Por eso el botón se apaga en días pasados en vez
 * de relajar el cálculo de horarios.
 *
 * Los pasos de cliente, servicio y profesional viven en `appointment-wizard`,
 * donde no dependen de este contexto; acá queda el armado y el paso de horarios.
 *
 * La apertura la maneja la agenda porque hay dos formas de llegar —el botón de
 * la barra y un click en un hueco de la grilla— y la segunda trae hora y
 * profesional. La regla de no agendar en el pasado también vive allá, para que
 * valga igual para las dos.
 */
const AppointmentModal: React.FC<Props> = ({
	open,
	onClose,
	date,
	minute = null,
	staffId: requestedStaffId = null,
}) => {
	const [step, setStep] = useState<Step>('cliente');
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		draft,
		setClientName,
		setServiceId,
		setStaffId,
		setStartTime,
		reset,
	} = useAppointmentDraft();

	const { data: settings } = useGetSettings();
	const { mutateAsync: createAppointment } = useCreateAppointment();
	const { data: services = [] } = useGetServices();
	const { data: staff = [] } = useGetStaff();
	const {
		data: slots = [],
		isFetching: loadingSlots,
		isError: slotsError,
	} = useGetBookingSlots(date, draft.serviceId, draft.staffId);

	const activeServices = useMemo(
		() => services.filter((service) => service.isActive),
		[services],
	);

	const eligibleStaff = useMemo(
		() => eligibleStaffFor(staff, draft.serviceId),
		[staff, draft.serviceId],
	);

	const selectedService = activeServices.find(
		(service) => service.id === draft.serviceId,
	);
	const selectedStaff = eligibleStaff.find(
		(member) => member.id === draft.staffId,
	);
	const selectedSlot = slots.find((slot) => slot.startTime === draft.startTime);

	const handleOpenChange = (next: boolean) => {
		if (next) return;

		setStep('cliente');
		setSubmitError(null);
		reset();
		onClose();
	};

	/**
	 * Elegido el servicio, se salta el paso del profesional si el click ya lo
	 * dijo: en la vista diaria cada columna es una persona, así que preguntarlo
	 * otra vez sería pedir un dato que ya se dio.
	 *
	 * Solo si puede hacer ese servicio. Un profesional que no lo ofrece no está
	 * entre los elegibles, y arrastrarlo llevaría a un paso sin horarios.
	 */
	const chooseService = (id: string) => {
		setServiceId(id);

		const preferred = requestedStaffId
			? eligibleStaffFor(staff, id).find(
					(member) => member.id === requestedStaffId,
				)
			: undefined;

		if (preferred) {
			setStaffId(preferred.id);
			setStep('hora');
			return;
		}

		setStep('profesional');
	};

	const chooseStaff = (id: string) => {
		setStaffId(id);
		setStep('hora');
	};

	const stepIndex = STEPS.indexOf(step);
	const goBack = () => setStep(STEPS[Math.max(0, stepIndex - 1)]);

	const handleCreate = async () => {
		if (!draft.clientName || !draft.serviceId || !draft.staffId || !selectedSlot)
			return;

		setSubmitError(null);
		setSubmitting(true);

		try {
			const client = await findOrCreateClient({ name: draft.clientName });

			await createAppointment({
				clientId: client.id,
				staffId: draft.staffId,
				serviceIds: [draft.serviceId],
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
				setStartTime(null);
				return;
			}
			setSubmitError('No se pudo crear la cita. Intenta de nuevo.');
		} finally {
			setSubmitting(false);
		}
	};

	/**
	 * El horario pedido, si la disponibilidad lo ofrece.
	 *
	 * Se busca entre los horarios reales en lugar de construir el instante a mano:
	 * el que decide qué se puede reservar es el motor, el mismo que usa WhatsApp, y
	 * fabricar acá una hora "equivalente" sería una segunda cuenta que puede no
	 * coincidir con la suya.
	 */
	const requestedSlot = useMemo(() => {
		if (minute === null) return null;

		const zone = settings?.timezone;
		return (
			slots.find((slot) => minutesInTimeZone(slot.startTime, zone) === minute) ??
			null
		);
	}, [minute, slots, settings?.timezone]);

	/*
	 * Se aplica una sola vez por apertura: si alguien eligió otro horario y la
	 * lista se recarga, la elección tiene que ganarle a la preselección.
	 */
	const appliedRequest = useRef(false);

	useEffect(() => {
		if (!open) {
			appliedRequest.current = false;
			return;
		}

		if (appliedRequest.current || !requestedSlot) return;

		appliedRequest.current = true;
		setStartTime(requestedSlot.startTime);
	}, [open, requestedSlot, setStartTime]);

	/** Se pidió una hora y no está libre: hay que decirlo, no elegir otra en silencio. */
	const slotNotice =
		minute !== null && !loadingSlots && !requestedSlot
			? `Las ${formatMinute(minute)} no están disponibles para esta combinación. Elegí otro horario.`
			: undefined;

	const summary =
		stepIndex > 0
			? [draft.clientName, selectedService?.name, selectedStaff?.name]
					.filter(Boolean)
					.join(' · ')
			: null;

	return (
		<>
			<WizardShell
				open={open}
				onOpenChange={handleOpenChange}
				title={STEP_TITLES[step]}
				description={describeDay(date)}
				summary={summary}
				onBack={stepIndex === 0 ? undefined : goBack}
				action={
					step === 'cliente' ? (
						<Button
							type="button"
							disabled={!draft.clientName.trim()}
							onClick={() => setStep('servicio')}
						>
							Continuar
						</Button>
					) : step === 'hora' ? (
						<Button
							type="button"
							disabled={!selectedSlot || submitting}
							onClick={() => void handleCreate()}
						>
							<Check className="mr-1 h-4 w-4" />
							{submitting ? 'Creando...' : 'Crear cita'}
						</Button>
					) : null
				}
			>
				{step === 'cliente' && (
					<ClientStep
						value={draft.clientName}
						onChange={setClientName}
						onConfirm={() => setStep('servicio')}
					/>
				)}

				{step === 'servicio' && (
					<ServiceStep
						services={activeServices}
						selectedId={draft.serviceId}
						onSelect={chooseService}
					/>
				)}

				{step === 'profesional' && (
					<StaffStep
						staff={eligibleStaff}
						selectedId={draft.staffId}
						onSelect={chooseStaff}
					/>
				)}

				{step === 'hora' && (
					<AvailableSlotStep
						slots={slots}
						selectedStart={draft.startTime}
						onSelect={setStartTime}
						isLoading={loadingSlots}
						isError={slotsError}
						notice={slotNotice}
					/>
				)}

				{submitError && <p className="text-sm text-red-600">{submitError}</p>}
			</WizardShell>
		</>
	);
};

export default AppointmentModal;
