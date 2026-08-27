'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleMobileSidebar } from '@/components/sidebar-mobile';
import AgendaToolbar, { type AgendaView } from '@/modules/agenda/AgendaToolbar';
import CalendarGrid, {
	type CalendarColumn,
} from '@/modules/agenda/CalendarGrid';
import AppointmentBlocks from '@/modules/agenda/AppointmentBlocks';
import { groupBlocksByDay } from '@/modules/agenda/utils/calendarBlocks';
import { dayNumber, weekdayLabel } from '@/modules/agenda/utils/calendarLabels';
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
import useGetBusinessContext from '@/services/settings/useGetBusinessContext';
import { useSessionActor } from '@/modules/auth/hooks/useAuth';

/**
 * La agenda de un profesional: solo sus citas.
 *
 * El recorte **no se hace acá**. `/appointments/range` devuelve únicamente las
 * citas en las que atiende quien pide, tomando el `staffId` del token: esta
 * pantalla dibuja lo que le llega y no filtra nada. Si filtrara, el filtro sería
 * la seguridad, y un filtro de frontend no protege nada.
 *
 * Es de lectura. Un profesional ve su día para saber qué le toca, y agendar,
 * reagendar o cancelar siguen siendo del negocio —el backend responde 403 a esas
 * operaciones—. Cuando haga falta que también agende, se abre a propósito y no
 * porque la pantalla ya tenía los botones.
 */
const MyAgendaPage = () => {
	const [view, setView] = useState<AgendaView>('day');
	const [picked, setPicked] = useState<string | null>(null);

	/**
	 * `?date=2026-08-27` abre la agenda en ese día.
	 *
	 * Es a donde lleva el botón "Ver mi agenda" del aviso por WhatsApp: sin esto
	 * caería en hoy, y el aviso de una cita de mañana obligaría a buscarla.
	 *
	 * Se aplica una sola vez, al abrir, igual que en la agenda del negocio: después
	 * manda lo que se elija en pantalla, porque sincronizar la URL con cada click
	 * convertiría cada cambio de día en una entrada del historial.
	 */
	useEffect(() => {
		const date = new URLSearchParams(window.location.search).get('date');
		if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) setPicked(date);
	}, []);

	const { actor } = useSessionActor();
	/*
	 * El marco del negocio, no su configuración: `/settings` es de administración y
	 * a un profesional le responde 403. Sin la zona horaria, esta pantalla mostraría
	 * el día del navegador en lugar del día del local.
	 */
	const { data: settings } = useGetBusinessContext();
	const timezone = settings?.timezone;

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

	const blocksByDay = useMemo(
		() => groupBlocksByDay(range?.items ?? [], timezone),
		[range?.items, timezone],
	);

	/**
	 * Una columna por día, también en la vista diaria.
	 *
	 * La agenda del negocio parte el día por profesional; acá el profesional es uno
	 * solo, así que esa división no diría nada. La columna es siempre el día.
	 */
	const columns = useMemo<CalendarColumn[]>(
		() =>
			days.map((day) => {
				const isToday = day === todayKey;

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
							updatingId={null}
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
		[days, todayKey, settings?.businessHours, blocksByDay],
	);

	const nowMinute = now > 0 ? nowMinuteInTimeZone(nowDate, timezone) : null;

	const scrollToMinute = useMemo(() => {
		if (!settings) return null;

		if (days.includes(todayKey) && nowMinute !== null) return nowMinute;

		const opens = columns
			.flatMap((column) => column.openRanges)
			.map((openRange) => openRange.startMinute);

		return opens.length > 0 ? Math.min(...opens) : 8 * 60;
		// `nowMinute` queda afuera a propósito: la vista se ubica al abrir o al
		// cambiar de fecha, no cada vez que corre el minutero.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [columns, days, todayKey, settings]);

	const handleShift = useCallback(
		(direction: -1 | 1) =>
			setPicked(
				shiftDateKey(selectedDate, direction * (view === 'week' ? 7 : 1)),
			),
		[selectedDate, view],
	);

	// Ver `AgendaPage`: `useNow` devuelve 0 en el servidor y todo acá arranca en
	// "qué día es hoy", así que dibujar antes produciría un desajuste de hidratación.
	if (now === 0) return <div className="flex-1" />;

	return (
		<>
			<AgendaToolbar
				view={view}
				onViewChange={setView}
				selectedDate={selectedDate}
				todayKey={todayKey}
				onDateChange={setPicked}
				onShift={handleShift}
				busy={isFetching}
				menu={
					<Button
						variant="ghost"
						size="icon"
						aria-label="Abrir menú"
						onClick={() => toggleMobileSidebar()}
					>
						<Menu className="h-5 w-5" />
					</Button>
				}
			/>

			{isError && (
				<p className="shrink-0 border-b border-border bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
					No se pudieron cargar tus citas. Se vuelve a intentar solo.
				</p>
			)}

			{range?.items.length === 0 && !isFetching && (
				<p className="shrink-0 border-b border-border px-3 py-2 text-sm text-muted-foreground">
					{actor?.name ? `${actor.name}, no ` : 'No '}tenés citas
					{view === 'day' ? ' este día' : ' esta semana'}.
				</p>
			)}

			<div className="min-h-0 flex-1">
				<CalendarGrid
					columns={columns}
					nowMinute={nowMinute}
					scrollToMinute={scrollToMinute}
				/>
			</div>
		</>
	);
};

export default MyAgendaPage;
