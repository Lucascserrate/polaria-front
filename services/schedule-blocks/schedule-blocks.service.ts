import { axiosInstance } from '@/lib/axios';

/**
 * Las franjas marcadas como no disponibles: `/schedule-blocks`.
 *
 * Colección propia y no un campo de la agenda porque es otra cosa: una cita
 * tiene cliente, servicios y precio, y esto es un rato en el que no se atiende.
 * Comparten la grilla y nada más.
 */
export const scheduleBlockKeys = {
	all: ['schedule-blocks'] as const,
	range: (from: string, to: string) =>
		[...scheduleBlockKeys.all, 'range', from, to] as const,
};

export interface ScheduleBlock {
	id: string;
	/** `null` = el bloqueo es de todo el negocio. */
	staffId: string | null;
	/** Nombre del profesional, para no tener que cruzar con el equipo. */
	staffName: string | null;
	startTime: string;
	endTime: string;
	reason: string | null;
}

export interface ScheduleBlockRange {
	items: ScheduleBlock[];
	from: string;
	to: string;
	timezone: string;
}

/**
 * Lo que hace falta para marcar una franja.
 *
 * `startTime` viaja en ISO y no como `{ fecha, hora }`: la pantalla ya sabe
 * convertir el hueco que se clickeó a un instante con la zona del negocio
 * (`instantAtMinute`), y es la misma forma que usa la creación de una cita.
 */
export interface CreateScheduleBlock {
	startTime: string;
	durationMinutes: number;
	/** Ausente o `null` bloquea a todo el negocio. */
	staffId?: string | null;
	reason?: string | null;
}

export const getScheduleBlocksRange = async (
	from: string,
	to: string,
): Promise<ScheduleBlockRange> => {
	const { data } = await axiosInstance.get<ScheduleBlockRange>(
		'/schedule-blocks/range',
		{ params: { from, to } },
	);

	return data;
};

export const createScheduleBlock = async (
	payload: CreateScheduleBlock,
): Promise<ScheduleBlock> => {
	const { data } = await axiosInstance.post<ScheduleBlock>(
		'/schedule-blocks',
		payload,
	);

	return data;
};

export const deleteScheduleBlock = async (id: string): Promise<void> => {
	await axiosInstance.delete(`/schedule-blocks/${id}`);
};
