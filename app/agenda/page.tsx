'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleMobileSidebar } from '@/components/sidebar-mobile';
import { useBottomNav } from '@/components/BottomNav';
import AgendaToolbar, { type AgendaView } from '@/modules/agenda/AgendaToolbar';
import CalendarGrid, {
	type CalendarColumn,
} from '@/modules/agenda/CalendarGrid';
import AddAppointmentFab from '@/modules/agenda/AddAppointmentFab';
import FloatingAttention from '@/modules/agenda/FloatingAttention';
import AppointmentBlocks from '@/modules/agenda/AppointmentBlocks';
import BookingDrawer from '@/modules/agenda/BookingDrawer';
import NewBookingDrawer, {
	type BookingSeed,
} from '@/modules/agenda/NewBookingDrawer';
import type { BookingWarning } from '@/services/appointments/appointments.service';
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
import useDeleteBooking from '@/services/appointments/useDeleteBooking';
import useGetSettings from '@/services/settings/useGetSettings';
import { colorOf, fillStyleOf } from '@/modules/team/utils/colors';

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
	const bottomNav = useBottomNav();
	const [view, setView] = useState<AgendaView>('week');
	const [picked, setPicked] = useState<string | null>(null);

	/**
	 * La Agenda se puede abrir en una vista y una fecha concretas.
	 *
	 * `?view=day&date=2026-08-24` sirve para compartir un día puntual con alguien
	 * del equipo, que hasta ahora obligaba a explicarle a mano dónde mirar.
	 *
	 * Se aplica una sola vez, al abrir, y después manda lo que se elija en
	 * pantalla: sincronizar la URL con cada click convertiría cada cambio de día
	 * en una entrada del historial, y volver atrás dejaría de significar "salir de
	 * la Agenda".
	 */
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);

		if (params.get('view') === 'day') setView('day');

		const date = params.get('date');
		if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) setPicked(date);
	}, []);

	/**
	 * El hueco desde el que se está creando una cita.
	 *
	 * Guarda de dónde salió el click —día, minuto y columna— porque eso es lo que
	 * el asistente puede dar por respondido. El botón de la barra abre el mismo
	 * asistente sin hora ni profesional.
	 */
	const [draftSlot, setDraftSlot] = useState<BookingSeed | null>(null);

	/** Reserva abierta en el panel lateral. */
	const [editingId, setEditingId] = useState<string | null>(null);

	/**
	 * Lo que el backend advirtió de la última reserva guardada, creada o editada.
	 *
	 * La cita ya existe: esto no es un error, es lo que hay que saber sobre ella.
	 * Se muestra en la agenda y no en el panel porque el panel se cierra al
	 * guardar, y lo que quedó raro sigue importando después.
	 */
	const [saveWarnings, setSaveWarnings] = useState<BookingWarning[]>([]);

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

	const {
		mutate: deleteBooking,
		isPending: isDeleting,
		variables: deletingId,
		isError: deleteError,
	} = useDeleteBooking();

	const handleDelete = useCallback(
		(id: string) => deleteBooking(id),
		[deleteBooking],
	);

	/*
	 * La cita en curso sale de la mutación, así que no hace falta un estado
	 * aparte. Borrar también cuenta: mientras la petición viaja, sus acciones se
	 * apagan igual que al cambiar de estado.
	 */
	const updatingId = isUpdatingStatus
		? (statusVariables?.id ?? null)
		: isDeleting
			? (deletingId ?? null)
			: null;

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
							onDelete={handleDelete}
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
			handleDelete,
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
					onEdit={setEditingId}
					onDelete={handleDelete}
					updatingId={updatingId}
				/>
			),
			header: (
				<div className="flex items-center justify-center gap-2">
					{column.staffId && (
						/*
						 * Las iniciales en su color, el mismo con el que se pintan sus citas
						 * abajo. Es lo que hace que la columna se lea como una unidad en
						 * lugar de como un nombre con bloques de color al azar debajo.
						 */
						<span
							className="flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
							style={fillStyleOf(
								colorOf({
									id: column.staffId,
									calendarColor: column.calendarColor,
								}),
							)}
						>
							{initialsOf(column.name)}
						</span>
					)}
					<span className="truncate text-sm font-medium">{column.name}</span>
					{/* Tiene citas pero no le toca trabajar: si no se dice, su columna
					    cerrada parece un error de horario. */}
					{column.offDuty && (
						<span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
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
		handleDelete,
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
	 * La cabecera de un día lleva a su vista diaria.
	 *
	 * Solo en la semanal: en la diaria las columnas son personas, y clickear a un
	 * profesional no significa "ir a" ninguna parte.
	 */
	const openBlankBooking = useCallback(
		() => setDraftSlot({ date: selectedDate, minute: null, staffId: null }),
		[selectedDate],
	);

	const handleColumnSelect = useCallback((day: string) => {
		setPicked(day);
		setView('day');
	}, []);

	/**
	 * Un hueco abre el panel de reserva con lo que el click ya dijo.
	 *
	 * En la vista semanal la columna es el día; en la diaria es el profesional, y
	 * ahí también viaja quién atiende.
	 *
	 * Los días pasados también abren: la agenda del panel no sirve solo para
	 * agendar, también para registrar lo que ocurrió y no se cargó. Lo que era raro
	 * —una hora que ya pasó, un día cerrado— se advierte, no se impide.
	 */
	const handleSlotClick = useCallback(
		(columnKey: string, minute: number) => {
			const date = view === 'week' ? columnKey : selectedDate;

			setDraftSlot({
				date,
				minute,
				staffId:
					view === 'day' && columnKey !== UNASSIGNED_COLUMN ? columnKey : null,
			});
		},
		[view, selectedDate],
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
					<Button className="gap-2" onClick={openBlankBooking}>
						<Plus className="h-4 w-4" />
						Agregar cita
					</Button>
				}
				menu={
					/*
					 * Con la barra de abajo no va: abriría un cajón que dice lo mismo que
					 * la barra. Queda para mientras la sesión no se resolvió.
					 *
					 * Solo abre. Cerrar es tocar afuera, como ya era: con el menú
					 * abierto este botón queda debajo del velo y no se puede volver a
					 * tocar, así que una "X" acá sería una salida que no funciona.
					 */
					bottomNav ? undefined : (
						<Button
							variant="ghost"
							size="icon"
							aria-label="Abrir menú"
							onClick={() => toggleMobileSidebar()}
						>
							<Menu className="h-5 w-5" />
						</Button>
					)
				}
			/>

			{saveWarnings.length > 0 && (
				<div className="shrink-0 border-b border-amber-500/50 bg-amber-500/10 px-3 py-1.5">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-0.5">
							<p className="text-xs font-medium">Cita guardada.</p>
							{saveWarnings.map((warning) => (
								<p key={warning.code} className="text-xs">
									{warning.message}
								</p>
							))}
						</div>
						<button
							type="button"
							className="shrink-0 text-xs text-muted-foreground underline"
							onClick={() => setSaveWarnings([])}
						>
							Entendido
						</button>
					</div>
				</div>
			)}

			{(isError || statusError || deleteError) && (
				<p className="shrink-0 border-b border-border bg-red-50 px-3 py-1.5 text-xs text-destructive dark:bg-red-950/40">
					{isError
						? 'No se pudieron cargar las citas. Se vuelve a intentar solo.'
						: deleteError
							? 'No se pudo eliminar la reserva. Intentá de nuevo.'
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

			{/*
			 * Un panel por operación. Comparten las cuentas del borrador, pero no la
			 * forma: la reserva nueva es una secuencia que arranca en el servicio, y
			 * editar es una ficha donde ya está todo elegido y sólo se corrige.
			 */}
			<BookingDrawer
				appointmentId={editingId}
				todayKey={todayKey}
				onClose={() => setEditingId(null)}
				onSaved={setSaveWarnings}
			/>

			<NewBookingDrawer
				seed={editingId === null ? draftSlot : null}
				todayKey={todayKey}
				onClose={() => setDraftSlot(null)}
				onSaved={setSaveWarnings}
			/>

			<AddAppointmentFab onClick={openBlankBooking} />

			<FloatingAttention />
		</>
	);
};

export default AgendaPage;
