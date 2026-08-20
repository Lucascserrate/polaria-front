'use client';

import { useCallback, useState } from 'react';

export interface AppointmentDraft {
	clientName: string;
	serviceId: string | null;
	staffId: string | null;
	/**
	 * Instante de inicio, en ISO. Quién lo propone depende del contexto: Agenda
	 * lo toma de la disponibilidad real, y un registro histórico lo tomaría de
	 * otro lado. El borrador solo guarda cuál quedó elegido.
	 */
	startTime: string | null;
}

const EMPTY: AppointmentDraft = {
	clientName: '',
	serviceId: null,
	staffId: null,
	startTime: null,
};

/**
 * La cita en construcción, con la invalidación en cascada que exige el orden de
 * los pasos.
 *
 * Cada elección acota a la siguiente: el servicio define qué profesionales
 * pueden hacerlo, y el profesional define qué horarios tiene libres. Por eso
 * cambiar uno **limpia** los que dependían de él en lugar de conservarlos: un
 * horario calculado para otro profesional no significa nada, y arrastrarlo
 * dejaría al formulario mostrando una selección que ya no existe.
 *
 * El nombre del cliente no acota nada, así que no invalida nada.
 */
export const useAppointmentDraft = () => {
	const [draft, setDraft] = useState<AppointmentDraft>(EMPTY);

	const setClientName = useCallback(
		(clientName: string) => setDraft((prev) => ({ ...prev, clientName })),
		[],
	);

	const setServiceId = useCallback(
		(serviceId: string) =>
			setDraft((prev) => ({
				...prev,
				serviceId,
				staffId: null,
				startTime: null,
			})),
		[],
	);

	const setStaffId = useCallback(
		(staffId: string) =>
			setDraft((prev) => ({ ...prev, staffId, startTime: null })),
		[],
	);

	const setStartTime = useCallback(
		(startTime: string | null) => setDraft((prev) => ({ ...prev, startTime })),
		[],
	);

	const reset = useCallback(() => setDraft(EMPTY), []);

	return {
		draft,
		setClientName,
		setServiceId,
		setStaffId,
		setStartTime,
		reset,
	};
};
