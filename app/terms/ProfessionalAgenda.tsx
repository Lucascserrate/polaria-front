import React from 'react';
import { CalendarRange, Search, SlidersHorizontal } from 'lucide-react';

import {
	appointmentStatuses,
	mockAppointments,
	mockServices,
	mockStaff,
	scheduleTimeSlots,
} from './data';
import { SectionTitle } from './Section';

export function ProfessionalAgenda() {
	return (
		<section className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
				<SectionTitle
					eyebrow="Agenda profesional"
					title="Tu agenda profesional, siempre bajo control."
					description="Conoce el estado de tu día al instante. Gestiona múltiples profesionales, solapamientos y turnos sin estrés."
				/>
				<div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
						<div className="flex items-center gap-2 text-xs text-neutral-500">
							<CalendarRange className="size-4" /> Lunes, 5 de septiembre
						</div>
						<div className="flex gap-2">
							<span className="rounded-full bg-neutral-950 px-3 py-1 text-[11px] text-white">
								Día
							</span>
							<span className="rounded-full border border-neutral-200 px-3 py-1 text-[11px] text-neutral-500">
								Semana
							</span>
						</div>
					</div>
					<div className="mb-3 flex flex-wrap gap-2">
						{appointmentStatuses.map((status) => (
							<span
								key={status}
								className="rounded-full border border-neutral-200 px-2.5 py-1 text-[10px] text-neutral-500"
							>
								{status}
							</span>
						))}
					</div>
					<div className="overflow-x-auto pb-1">
						<div className="min-w-172.5">
							<div className="grid grid-cols-[72px_repeat(4,minmax(150px,1fr))] gap-2">
								<div className="flex items-center gap-1 rounded-xl border border-neutral-200 px-2 text-[10px] text-neutral-500">
									<Search className="size-3" /> Filtrar
								</div>
								{mockStaff.map((staff) => (
									<div
										key={staff.id}
										className="rounded-xl border border-neutral-200 px-3 py-2"
									>
										<p className="text-xs font-medium">{staff.name}</p>
										<p className="text-[10px] text-neutral-500">{staff.role}</p>
									</div>
								))}
								{scheduleTimeSlots.map((time) => (
									<React.Fragment key={time}>
										<div className="border-t border-neutral-100 py-4 text-[10px] text-neutral-400">
											{time}
										</div>
										{mockStaff.map((staff) => {
											const appointment = mockAppointments.find(
												(item) =>
													item.staffId === staff.id && item.start === time,
											);
											const service =
												appointment &&
												mockServices.find(
													(item) => item.id === appointment.serviceId,
												);
											return (
												<div
													key={`${time}-${staff.id}`}
													className="min-h-14 border-t border-neutral-100 p-1"
												>
													{appointment && service && (
														<div
															className="rounded-lg p-2 text-[10px] text-white"
															style={{ backgroundColor: staff.color }}
														>
															<p className="font-medium">{service.name}</p>
															<p className="mt-1 text-white/70">
																{appointment.client} · {service.duration} min ·{' '}
																{appointment.status}
															</p>
														</div>
													)}
												</div>
											);
										})}
									</React.Fragment>
								))}
							</div>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
						<SlidersHorizontal className="size-3.5" /> Los espacios libres
						respetan duración, jornada y citas existentes.
					</div>
				</div>
			</div>
		</section>
	);
}
