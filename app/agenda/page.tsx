'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgendaToolbar, { type AgendaView } from '@/modules/agenda/AgendaToolbar';
import AppointmentModal from '@/modules/agenda/AppointmentModal';
import CalendarGrid, {
	type CalendarColumn,
} from '@/modules/agenda/CalendarGrid';
import FloatingAttention from '@/modules/agenda/FloatingAttention';
import AppointmentBlocks from '@/modules/agenda/AppointmentBlocks';
import BookingDrawer from '@/modules/agenda/BookingDrawer';
import {
	buildStaffColumns,
	groupBlocksByDay,
	UNASSIGNED_COLUMN,
} from '@/modules/agenda/utils/calendarBlocks';
import {
	dayNumber,
	describeDay,
	weekdayLabel,
} from '@/modules/agenda/utils/calendarLabels';
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
import useGetWorkingStaff from '@/services/staff/useGetWorkingStaff';
import useUpdateAppointmentStatus from '@/services/appointments/useUpdateAppointmentStatus';
import useGetSettings from '@/services/settings/useGetSettings';

/** Iniciales del profesional, para la cabecera angosta de su columna. */
const initialsOf = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join('');

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

	/**
	 * El hueco desde el que se está creando una cita.
	 *
	 * Guarda de dónde salió el click —día, minuto y columna— porque eso es lo que
	 * el asistente puede dar por respondido. El botón de la barra abre el mismo
	 * asistente sin hora ni profesional.
	 */
	const [draftSlot, setDraftSlot] = useState<{
		date: string;
		minute: number | null;
		staffId: string | null;
	} | null>(null);

	/** Reserva abierta en el panel lateral. */
	const [editingId, setEditingId] = useState<string | null>(null);

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

	// Solo en la vista diaria: en la semanal sería un pedido que nadie mira.
	const { data: working } = useGetWorkingStaff(selectedDate, view === 'day');

	const blocksByDay = useMemo(
		() => groupBlocksByDay(range?.items ?? [], timezone),
		[range?.items, timezone],
	);

	const weekColumns = useMemo<CalendarColumn[]>(
		() =>
			days.map((day) => {
				const isToday = day === todayKey;

				return {
					key: day,
					isToday,
					selectLabel: `Ver ${describeDay(day).toLowerCase()}`,
					openRanges: openRangesForWeekday(
						settings?.businessHours,
						weekdayOf(day),
					),
					content: (
						<AppointmentBlocks
							blocks={blocksByDay.get(day) ?? []}
							onMarkAttended={handleMarkAttended}
							onCancel={handleCancel}
							onEdit={setEditingId}
							updatingId={updatingId}
						/>
					),
					header: (
						<div className="leading-tight">
							<p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
								{weekdayLabel(day)}
							</p>
							<p
								className={
									isToday
										? 'text-lg font-semibold text-sky-500'
										: 'text-lg font-semibold'
								}
							>
								{dayNumber(day)}
							</p>
						</div>
					),
				};
			}),
		[
			days,
			todayKey,
			settings?.businessHours,
			blocksByDay,
			handleMarkAttended,
			handleCancel,
			updatingId,
		],
	);

	/**
	 * La vista diaria se parte por profesional.
	 *
	 * Cada columna se sombrea con **su** jornada, no con el horario del negocio:
	 * es lo que responde "qué está haciendo cada uno", incluida la pausa del que
	 * corta al mediodía mientras el local sigue abierto.
	 */
	const dayColumns = useMemo<CalendarColumn[]>(() => {
		const isToday = selectedDate === todayKey;

		return buildStaffColumns({
			appointments: range?.items ?? [],
			workingStaff: working?.staff ?? [],
			businessRanges: openRangesForWeekday(
				settings?.businessHours,
				weekdayOf(selectedDate),
			),
			timezone,
		}).map((column) => ({
			key: column.key,
			isToday,
			openRanges: column.openRanges,
			content: (
				<AppointmentBlocks
					blocks={column.blocks}
					onMarkAttended={handleMarkAttended}
					onCancel={handleCancel}
					updatingId={updatingId}
				/>
			),
			header: (
				<div className="flex items-center justify-center gap-2">
					{column.staffId && (
						<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
							{initialsOf(column.name)}
						</span>
					)}
					<span className="truncate text-sm font-medium">{column.name}</span>
					{/* Tiene citas pero no le toca trabajar: si no se dice, su columna
					    cerrada parece un error de horario. */}
					{column.offDuty && (
						<span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-500">
							Fuera de turno
						</span>
					)}
				</div>
			),
		}));
	}, [
		selectedDate,
		todayKey,
		range?.items,
		working?.staff,
		settings?.businessHours,
		timezone,
		handleMarkAttended,
		handleCancel,
		updatingId,
	]);

	const columns = view === 'week' ? weekColumns : dayColumns;

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

	/**
	 * Un hueco libre abre el asistente con lo que el click ya dijo.
	 *
	 * En la vista semanal la columna es el día; en la diaria es el profesional, y
	 * ahí también viaja quién atiende. Los días pasados no abren nada: no hay
	 * disponibilidad que consultar hacia atrás, y registrar una atención que ya
	 * ocurrió es otra pregunta.
	 */
	const canCreateOn = useCallback(
		(date: string) => date >= todayKey,
		[todayKey],
	);

	/**
	 * La cabecera de un día lleva a su vista diaria.
	 *
	 * Solo en la semanal: en la diaria las columnas son personas, y clickear a un
	 * profesional no significa "ir a" ninguna parte.
	 */
	const handleColumnSelect = useCallback((day: string) => {
		setPicked(day);
		setView('day');
	}, []);

	const handleSlotClick = useCallback(
		(columnKey: string, minute: number) => {
			const date = view === 'week' ? columnKey : selectedDate;
			if (!canCreateOn(date)) return;

			setDraftSlot({
				date,
				minute,
				staffId:
					view === 'day' && columnKey !== UNASSIGNED_COLUMN ? columnKey : null,
			});
		},
		[view, selectedDate, canCreateOn],
	);

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
				action={
					<Button
						className="gap-2"
						disabled={!canCreateOn(selectedDate)}
						title={
							canCreateOn(selectedDate)
								? undefined
								: 'No se pueden agendar citas en días que ya pasaron'
						}
						onClick={() =>
							setDraftSlot({
								date: selectedDate,
								minute: null,
								staffId: null,
							})
						}
					>
						<Plus className="h-4 w-4" />
						Agregar cita
					</Button>
				}
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
					onSlotClick={handleSlotClick}
					onColumnSelect={view === 'week' ? handleColumnSelect : undefined}
				/>
			</div>

			<AppointmentModal
				open={draftSlot !== null}
				onClose={() => setDraftSlot(null)}
				date={draftSlot?.date ?? selectedDate}
				minute={draftSlot?.minute ?? null}
				staffId={draftSlot?.staffId ?? null}
			/>

			<BookingDrawer
				appointmentId={editingId}
				todayKey={todayKey}
				onClose={() => setEditingId(null)}
			/>

			<FloatingAttention />
		</>
	);
};

export default AgendaPage;
