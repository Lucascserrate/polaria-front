'use client';

import { useCallback, useMemo, useState } from 'react';
import AppointmentTimeline from '@/modules/agenda/AppointmentTimeline';
import AppointmentModal from '@/modules/agenda/AppointmentModal';
import { SummaryCard } from '@/modules/agenda/SummaryCard';
import MonthCalendar from '@/components/MonthCalendar';
import HumanAttentionCard from '@/modules/agenda/HumanAttentionCard';
import useGetWorkingStaff from '@/services/staff/useGetWorkingStaff';
import { EMPTY_COUNTS } from '@/modules/staff/constants';
import useGetDayAppointments from '@/services/appointments/useGetDayAppointments';
import useUpdateAppointmentStatus from '@/services/appointments/useUpdateAppointmentStatus';
import { formatLongDate, parseDateKey, todayKey } from '@/lib/date';
import useGetSettings from '@/services/settings/useGetSettings';
import { toBusinessRanges } from '@/modules/agenda/utils/dayTimeline';

const AgendaPage = () => {
	const [selectedDate, setSelectedDate] = useState(todayKey);
	const isToday = selectedDate === todayKey();

	const { data: day } = useGetDayAppointments(selectedDate);
	const { data: workingStaff } = useGetWorkingStaff(selectedDate);
	const { data: settings } = useGetSettings();

	const {
		mutate: statusMutation,
		isPending,
		variables,
		isError: statusError,
	} = useUpdateAppointmentStatus();

	const handleMarkAttended = useCallback(
		(id: string) => statusMutation({ id, status: 'completed' }),
		[statusMutation],
	);

	const handleCancel = useCallback(
		(id: string) => statusMutation({ id, status: 'cancelled' }),
		[statusMutation],
	);

	const appointments = day?.items ?? [];

	const counts = day?.counts ?? EMPTY_COUNTS;
	const totalDay = day?.total ?? 0;
	const revenueDay = day?.revenueTotal ?? 0;
	const workingStaffCount = workingStaff?.staff.length ?? 0;

	// La cita en curso sale de la mutación, así que no hace falta un estado aparte.
	const updatingId = isPending ? (variables?.id ?? null) : null;

	// El horario del negocio acota la agenda para no dibujar horas cerradas; el
	// rango se estira solo si alguna cita cae fuera.
	const businessRanges = useMemo(
		() =>
			toBusinessRanges(
				settings?.businessHours,
				parseDateKey(selectedDate).getDay(),
			),
		[settings?.businessHours, selectedDate],
	);

	// La zona del negocio viaja en cada cita. Sin ella la agenda se dibujaría en
	// la hora del navegador, que es la de quien mira y no la del local.
	const timezone = appointments[0]?.timezone;

	return (
		<div className="flex flex-col gap-6 lg:flex-1 lg:flex-row lg:min-h-0">
			<section className="bg-card border border-border rounded-lg flex flex-col lg:flex-1 lg:min-h-0">
				<div className="flex items-center justify-between p-6 pb-2 shrink-0">
					<div>
						<h2 className="text-xl font-semibold">
							{isToday ? 'Agenda de hoy' : 'Agenda'}
						</h2>
						{!isToday && (
							<p className="text-sm text-muted-foreground capitalize mt-0.5">
								{formatLongDate(selectedDate)}
							</p>
						)}
					</div>
					{/* La fecha de la cita nueva es el día abierto: una sola fuente. */}
					<AppointmentModal selectedDate={selectedDate} />
				</div>

				{statusError && (
					<p className="text-sm text-red-600 px-6 pb-4 shrink-0">
						No se pudo actualizar la cita. Intenta de nuevo.
					</p>
				)}

				{/*
				 * El scroll lo maneja la timeline, no este contenedor: al abrir el día
				 * de hoy se desplaza sola hasta la hora actual, y para eso necesita ser
				 * dueña del elemento que scrollea.
				 */}
				<div className="flex-1 px-6 pb-6 lg:min-h-0">
					<AppointmentTimeline
						appointments={appointments}
						onMarkAttended={handleMarkAttended}
						onCancel={handleCancel}
						updatingId={updatingId}
						businessRanges={businessRanges}
						isToday={isToday}
						timezone={timezone}
						emptyMessage={
							isToday
								? 'No hay citas para hoy'
								: `No hay citas para el ${formatLongDate(selectedDate)}`
						}
					/>
				</div>
			</section>

			<aside className="flex flex-col gap-4 shrink-0 lg:w-80 lg:overflow-y-auto lg:min-h-0 pr-2">
				<HumanAttentionCard />

				<MonthCalendar value={selectedDate} onChange={setSelectedDate} />

				<SummaryCard
					count={totalDay}
					confirmed={counts.confirmed}
					completed={counts.completed}
				/>
				<div className="bg-card border border-border rounded-lg p-6">
					<div className="text-sm font-medium text-muted-foreground">
						Ingresos del día
					</div>
					<div className="text-3xl font-bold mt-2">
						BOB {Math.round(revenueDay)}
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						Solo citas atendidas
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-6">
					<div className="text-sm font-medium text-muted-foreground">
						{isToday ? 'Trabajando hoy' : 'Trabajando ese día'}
					</div>
					<div className="text-3xl font-bold mt-2">{workingStaffCount}</div>
					<p className="text-xs text-muted-foreground mt-2">
						Profesionales con jornada
					</p>
				</div>
			</aside>
		</div>
	);
};

export default AgendaPage;
