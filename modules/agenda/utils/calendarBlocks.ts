import type { Appointment } from '@/types/appointments.types';
import {
	dateKeyInTimeZone,
	dayMinutesOf,
	toOpenRanges,
	type MinuteRange,
} from './calendarLayout';

/**
 * De citas a bloques dibujables, agrupados por columna.
 *
 * Es puro y está separado del componente porque acá se decide **a qué día
 * pertenece cada cita**, y eso no se puede mirar en la pantalla: una cita en el
 * día equivocado se ve igual de bien que una en el correcto.
 */

export interface AppointmentBlock extends MinuteRange {
	/**
	 * Identifica al bloque, no a la cita: en la vista por profesional una misma
	 * cita puede aportar dos tramos, uno en cada columna.
	 */
	key: string;
	appointment: Appointment;
	/** Profesional del tramo. `null` cuando la cita no tiene ninguno cargado. */
	staffId?: string | null;
	/** Nombre de ese profesional, que no es el de la cita: puede ser "Varios". */
	staffName?: string | null;
	/**
	 * Qué decir en la card. En la columna de un profesional se dice el servicio de
	 * *ese* tramo: repetir "Varios" en las dos columnas de una cita compartida
	 * sería decir menos de lo que ya se sabe por estar en esa columna.
	 */
	detail?: string;
}

/**
 * Reparte las citas por día del calendario.
 *
 * El día lo decide la zona del negocio y no la del navegador: una cita de las
 * 22:00 en Bolivia pertenece a ese día aunque en UTC ya sea el siguiente.
 *
 * Una cita sin instante legible se saltea en lugar de dibujarse a la medianoche,
 * que sería información falsa en un lugar creíble.
 */
export const groupBlocksByDay = (
	appointments: Appointment[],
	timezone?: string,
): Map<string, AppointmentBlock[]> => {
	const grouped = new Map<string, AppointmentBlock[]>();

	for (const appointment of appointments) {
		const zone = timezone ?? appointment.timezone;
		const day = dateKeyInTimeZone(appointment.startTime, zone);
		const minutes = dayMinutesOf({ ...appointment, timezone: zone });

		if (!day || !minutes) continue;

		const blocks = grouped.get(day) ?? [];
		blocks.push({ key: appointment.id, appointment, ...minutes });
		grouped.set(day, blocks);
	}

	return grouped;
};

/** Cómo se llama la columna de los tramos que no tienen profesional. */
export const UNASSIGNED_COLUMN = 'unassigned';

export interface StaffColumnInput {
	id: string;
	name: string;
	/** Jornada del día, en horas de reloj. */
	ranges: Array<{ from: string; to: string }>;
}

export interface StaffColumn {
	key: string;
	/** `null` en la columna de lo que quedó sin asignar. */
	staffId: string | null;
	name: string;
	openRanges: MinuteRange[];
	blocks: AppointmentBlock[];
	/** No le toca trabajar ese día, pero tiene citas. Su columna va cerrada. */
	offDuty?: boolean;
}

/**
 * Los tramos de una cita, uno por servicio.
 *
 * Una cita de corte con Diego y barba con Carlos son dos tramos con horario
 * propio, y en la vista por profesional cada uno va en su columna. Dibujar la
 * cita entera en las dos diría que ambos están ocupados todo el rato, que es
 * justamente lo que esa vista tiene que responder bien.
 *
 * Una cita sin tramos —dato viejo— cae en un único bloque sin profesional: es
 * preferible verla en "Sin asignar" a que desaparezca del día.
 */
export const segmentBlocksOf = (
	appointment: Appointment,
	timezone?: string,
): AppointmentBlock[] => {
	const zone = timezone ?? appointment.timezone;

	if (appointment.segments.length === 0) {
		const minutes = dayMinutesOf({ ...appointment, timezone: zone });
		return minutes
			? [
					{
						key: appointment.id,
						appointment,
						staffId: null,
						staffName: null,
						detail: appointment.service,
						...minutes,
					},
				]
			: [];
	}

	return appointment.segments.flatMap((segment, index) => {
		const minutes = dayMinutesOf({
			startTime: segment.startTime,
			endTime: segment.endTime,
			duration: appointment.duration,
			timezone: zone,
		});

		if (!minutes) return [];

		return [
			{
				key: `${appointment.id}:${index}`,
				appointment,
				staffId: segment.staffId,
				staffName: segment.staffName,
				detail: segment.serviceName ?? appointment.service,
				...minutes,
			},
		];
	});
};

/**
 * Las columnas de la vista diaria: una por profesional.
 *
 * El orden lo encabezan los que trabajan ese día, que es lo que se mira. Detrás
 * van los que tienen citas sin estar de turno —pasa cuando alguien cambia su
 * jornada después de que ya le reservaron— porque esconderlos haría desaparecer
 * citas reales del día. Su columna se dibuja cerrada, que es la verdad: hay una
 * cita fuera de su horario.
 *
 * "Sin asignar" aparece solo si hay algún tramo sin profesional, y si no hay
 * nadie ni nada queda una única columna con el horario del negocio, para que el
 * día siga siendo un día y no una pantalla vacía.
 */
export const buildStaffColumns = (input: {
	appointments: Appointment[];
	workingStaff: StaffColumnInput[];
	/** Horario del negocio ese día: sombrea "Sin asignar" y el caso sin personal. */
	businessRanges: MinuteRange[];
	timezone?: string;
}): StaffColumn[] => {
	const blocks = input.appointments.flatMap((appointment) =>
		segmentBlocksOf(appointment, input.timezone),
	);

	const blocksOf = (staffId: string | null) =>
		blocks.filter((block) => (block.staffId ?? null) === staffId);

	const working = input.workingStaff.map<StaffColumn>((staff) => ({
		key: staff.id,
		staffId: staff.id,
		name: staff.name,
		openRanges: toOpenRanges(staff.ranges),
		blocks: blocksOf(staff.id),
	}));

	const workingIds = new Set(input.workingStaff.map((staff) => staff.id));

	// De a un nombre por profesional: el mismo puede tener varias citas.
	const offDutyNames = new Map<string, string>();
	for (const block of blocks) {
		const staffId = block.staffId ?? null;
		if (!staffId || workingIds.has(staffId) || offDutyNames.has(staffId)) {
			continue;
		}

		/*
		 * El nombre sale del tramo y no de la cita: de este profesional no vino
		 * jornada, y `appointment.staff` dice "Varios" cuando la atienden dos, que
		 * sería un nombre inútil para encabezar su columna.
		 */
		offDutyNames.set(staffId, block.staffName ?? block.appointment.staff);
	}

	const offDuty = [...offDutyNames.entries()]
		.sort((a, b) => a[1].localeCompare(b[1]))
		.map<StaffColumn>(([staffId, name]) => ({
			key: staffId,
			staffId,
			name,
			openRanges: [],
			offDuty: true,
			blocks: blocksOf(staffId),
		}));

	const unassigned = blocksOf(null);
	const columns = [...working, ...offDuty];

	if (unassigned.length > 0) {
		columns.push({
			key: UNASSIGNED_COLUMN,
			staffId: null,
			name: 'Sin asignar',
			openRanges: input.businessRanges,
			blocks: unassigned,
		});
	}

	if (columns.length > 0) return columns;

	return [
		{
			key: UNASSIGNED_COLUMN,
			staffId: null,
			name: 'Sin profesionales',
			openRanges: input.businessRanges,
			blocks: [],
		},
	];
};
