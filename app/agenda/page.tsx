'use client';

import { useCallback, useMemo, useState } from 'react';
import AgendaToolbar, { type AgendaView } from '@/modules/agenda/AgendaToolbar';
import AppointmentModal from '@/modules/agenda/AppointmentModal';
import CalendarGrid, {
	type CalendarColumn,
} from '@/modules/agenda/CalendarGrid';
import FloatingAttention from '@/modules/agenda/FloatingAttention';
import AppointmentBlocks from '@/modules/agenda/AppointmentBlocks';
import { groupBlocksByDay } from '@/modules/agenda/utils/calendarBlocks';
import {
	nowMinuteInTimeZone,
	openRangesForWeekday,
	shiftDateKey,
	todayKeyInTimeZone,
	weekDaysOf,
	weekdayOf,
} from '@/modules/agenda/utils/calendarLayout';
import useNow from '@/lib/useNow';
import useGetAppointmentsRange from '@/services/appointments/useGetAppointmentsRange';
import useUpdateAppointmentStatus from '@/services/appointments/useUpdateAppointmentStatus';
import useGetSettings from '@/services/settings/useGetSettings';

const weekdayFormatter = new Intl.DateTimeFormat('es', { weekday: 'short' });
const longDayFormatter = new Intl.DateTimeFormat('es', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});

const toDate = (key: string): Date => {
	const [year, month, day] = key.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Agenda: el calendario del negocio.
 *
 * El lienzo son las 24 horas y lo cerrado se dibuja cerrado, así que la grilla
 * es la misma para todos los días y para las dos vistas. Acá solo se decide qué
 * columnas mirar —siete días o un día— y con qué franjas de atención.
 *
 * La zona horaria manda: "hoy" es hoy para el local, no para el navegador de
 * quien mira. Hasta que llega la configuración se usa la del navegador, y si
 * nadie tocó la fecha se corrige sola al llegar.
 */
const AgendaPage = () => {
	const [view, setView] = useState<AgendaView>('week');
	const [picked, setPicked] = useState<string | null>(null);

	const { data: settings } = useGetSettings();
	const timezone = settings?.timezone;

	// El reloj solo hace falta para la línea de ahora, que se mueve por minuto.
	const now = useNow(60_000);
	const nowDate = useMemo(() => (now > 0 ? new Date(now) : new Date()), [now]);

	const todayKey = todayKeyInTimeZone(timezone, nowDate);
	const selectedDate = picked ?? todayKey;

	const days = useMemo(
		() => (view === 'week' ? weekDaysOf(selectedDate) : [selectedDate]),
		[view, selectedDate],
	);

	const {
		data: range,
		isFetching,
		isError,
	} = useGetAppointmentsRange(days[0], days[days.length - 1]);

	const {
		mutate: updateStatus,
		isPending: isUpdatingStatus,
		variables: statusVariables,
		isError: statusError,
	} = useUpdateAppointmentStatus();

	const handleMarkAttended = useCallback(
		(id: string) => updateStatus({ id, status: 'completed' }),
		[updateStatus],
	);

	const handleCancel = useCallback(
		(id: string) => updateStatus({ id, status: 'cancelled' }),
		[updateStatus],
	);

	// La cita en curso sale de la mutación, así que no hace falta un estado aparte.
	const updatingId = isUpdatingStatus ? (statusVariables?.id ?? null) : null;

	const blocksByDay = useMemo(
		() => groupBlocksByDay(range?.items ?? [], timezone),
		[range?.items, timezone],
	);

	const columns = useMemo<CalendarColumn[]>(
		() =>
			days.map((day) => {
				const isToday = day === todayKey;
				const date = toDate(day);

				return {
					key: day,
					isToday,
					openRanges: openRangesForWeekday(
						settings?.businessHours,
						weekdayOf(day),
					),
					content: (
						<AppointmentBlocks
							blocks={blocksByDay.get(day) ?? []}
							onMarkAttended={handleMarkAttended}
							onCancel={handleCancel}
							updatingId={updatingId}
						/>
					),
					header:
						view === 'week' ? (
							<div className="leading-tight">
								<p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
									{weekdayFormatter.format(date).replace('.', '')}
								</p>
								<p
									className={
										isToday
											? 'text-lg font-semibold text-sky-500'
											: 'text-lg font-semibold'
									}
								>
									{date.getUTCDate()}
								</p>
							</div>
						) : (
							<p className="text-sm font-medium capitalize">
								{longDayFormatter.format(date)}
							</p>
						),
				};
			}),
		[
			days,
			todayKey,
			settings?.businessHours,
			view,
			blocksByDay,
			handleMarkAttended,
			handleCancel,
			updatingId,
		],
	);

	const nowMinute =
		// `now` en 0 significa que el reloj todavía no montó: no hay hora que dibujar.
		now > 0 ? nowMinuteInTimeZone(nowDate, timezone) : null;

	/**
	 * Dónde arranca la vista.
	 *
	 * Es lo que paga el precio de dibujar el día completo: se abre en la hora
	 * actual si hoy está entre las columnas, y si no, en la primera hora de
	 * atención de la semana. Nunca a la medianoche, que es tiempo que nadie mira.
	 */
	const scrollToMinute = useMemo(() => {
		// Sin el horario todavía no hay dónde ubicarse, y ubicarse dos veces —una
		// con el respaldo y otra con el horario real— se ve como un salto.
		if (!settings) return null;

		const showsToday = days.includes(todayKey);
		if (showsToday && nowMinute !== null) return nowMinute;

		const opens = columns
			.flatMap((column) => column.openRanges)
			.map((range) => range.startMinute);

		return opens.length > 0 ? Math.min(...opens) : 8 * 60;
		// `nowMinute` queda afuera a propósito: la vista se ubica al abrir o al
		// cambiar de fecha, no cada vez que corre el minutero.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [columns, days, todayKey, settings]);

	/*
	 * Hasta que monta el reloj no se dibuja nada.
	 *
	 * `useNow` devuelve 0 en el servidor, y todo lo de esta pantalla arranca en
	 * "qué día es hoy". Dibujar el prerenderizado con la hora del servidor —que
	 * puede estar en otro huso que el navegador— haría que la semana del HTML no
	 * fuera la misma que la de la hidratación, y React reportaría desajuste.
	 */
	if (now === 0) return <div className="flex-1" />;

	return (
		<>
			<AgendaToolbar
				view={view}
				onViewChange={setView}
				selectedDate={selectedDate}
				todayKey={todayKey}
				onDateChange={setPicked}
				onShift={(direction) =>
					setPicked(
						shiftDateKey(selectedDate, direction * (view === 'week' ? 7 : 1)),
					)
				}
				busy={isFetching}
				action={<AppointmentModal selectedDate={selectedDate} />}
			/>

			{(isError || statusError) && (
				<p className="shrink-0 border-b border-border bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
					{isError
						? 'No se pudieron cargar las citas. Se vuelve a intentar solo.'
						: 'No se pudo actualizar la cita. Intentá de nuevo.'}
				</p>
			)}

			<div className="min-h-0 flex-1">
				<CalendarGrid
					columns={columns}
					nowMinute={nowMinute}
					scrollToMinute={scrollToMinute}
				/>
			</div>

			<FloatingAttention />
		</>
	);
};

export default AgendaPage;
