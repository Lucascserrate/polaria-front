import React from 'react';
import { ChevronRight } from 'lucide-react';

import { Logo } from '@/app/logo';
import {
	agendaSidebarItems,
	mockAppointments,
	mockServices,
	mockStaff,
	scheduleTimeSlots,
} from './data';

export function AgendaMockup() {
	const serviceById = new Map(
		mockServices.map((service) => [service.id, service]),
	);

	return (
		<section className="px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
			<div className="mx-auto max-w-7xl">
				<div className="rounded-[2rem] border border-neutral-200 bg-white p-3 shadow-[0_30px_80px_rgba(0,0,0,0.08)] sm:p-4">
					<div className="grid gap-3 lg:grid-cols-[185px_minmax(0,1fr)]">
						<aside className="rounded-[1.5rem] border border-neutral-200 bg-white p-3 text-neutral-950 shadow-sm">
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
									<Logo
										tone="dark"
										showWordmark={false}
										className="text-[12px]"
									/>
								</div>
								<div>
									<p className="text-sm font-medium">Agenda de Hoy</p>
									<p className="text-xs text-neutral-400">Panel operativo</p>
								</div>
							</div>
							<div className="mt-6 space-y-1 text-sm">
								{agendaSidebarItems.map((item, index) => (
									<div
										key={item}
										className={`flex items-center justify-between rounded-2xl px-3 py-2.5 ${index === 0 ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-600 hover:bg-neutral-50'}`}
									>
										<span>{item}</span>
										<ChevronRight className="size-4" />
									</div>
								))}
							</div>
							<div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
								<p className="text-xs uppercase tracking-[0.22em] text-neutral-400">
									Estado
								</p>
								<div className="mt-3 space-y-3 text-sm">
									<div className="flex items-center justify-between">
										<span className="text-neutral-500">Profesionales</span>
										<span>4 activos</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-neutral-500">Citas</span>
										<span>12 hoy</span>
									</div>
								</div>
							</div>
						</aside>
						<div className="min-w-0 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-neutral-950">
										Agenda de Hoy
									</p>
									<p className="text-xs text-neutral-500">
										Lunes, 5 de septiembre · Studio Norte
									</p>
								</div>
								<div className="flex items-center gap-2 text-xs text-neutral-600">
									<span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5">
										Día
									</span>
									<span className="rounded-full border border-neutral-200 bg-neutral-950 px-3 py-1.5 text-white">
										Semana
									</span>
								</div>
							</div>
							<div className="mt-5 overflow-x-auto pb-1">
								<div className="min-w-155 rounded-3xl border border-neutral-200 bg-white p-3">
									<div className="grid grid-cols-[54px_repeat(4,minmax(150px,1fr))] gap-2 text-[11px]">
										<div />
										{mockStaff.map((staff) => (
											<div
												key={staff.id}
												className="rounded-2xl bg-neutral-50 px-3 py-2"
											>
												<div className="flex items-center gap-2">
													<span
														className="size-2 rounded-full"
														style={{ backgroundColor: staff.color }}
													/>
													<span className="font-medium text-neutral-950">
														{staff.name}
													</span>
												</div>
												<p className="mt-1 text-neutral-500">{staff.role}</p>
											</div>
										))}
										{scheduleTimeSlots.map((time) => (
											<React.Fragment key={time}>
												<div className="border-t border-neutral-100 py-4 text-neutral-400">
													{time}
												</div>
												{mockStaff.map((staff) => {
													const appointment = mockAppointments.find(
														(item) =>
															item.staffId === staff.id &&
															item.start.startsWith(time.slice(0, 2)),
													);
													const service = appointment
														? serviceById.get(appointment.serviceId)
														: undefined;
													return (
														<div
															key={`${time}-${staff.id}`}
															className="min-h-12 border-t border-neutral-100 p-1"
														>
															{appointment && service && (
																<div
																	className="rounded-xl px-2 py-2 text-white"
																	style={{
																		backgroundColor: staff.color,
																		minHeight: service.duration * 1.4,
																	}}
																>
																	<p className="truncate font-medium">
																		{service.name}
																	</p>
																	<p className="mt-1 truncate text-white/70">
																		{appointment.client} · {service.duration}{' '}
																		min
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
							<div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
								<div className="rounded-3xl border border-neutral-200 bg-white p-4">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium text-neutral-950">
											Profesionales activos
										</p>
										<p className="text-xs text-neutral-500">Hoy</p>
									</div>
									<div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
										{mockStaff.map((person) => (
											<div
												key={person.id}
												className="rounded-2xl bg-neutral-50 p-3"
											>
												<p className="text-sm font-medium text-neutral-950">
													{person.name}
												</p>
												<p className="text-xs text-neutral-500">
													{person.role}
												</p>
											</div>
										))}
									</div>
								</div>
								<div className="rounded-3xl border border-neutral-200 bg-white p-4">
									<p className="text-sm font-medium text-neutral-950">
										Resumen del día
									</p>
									<div className="mt-4 space-y-3">
										<div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-3 py-2.5 text-sm">
											<span className="text-neutral-600">
												Citas confirmadas
											</span>
											<span className="font-medium text-neutral-950">9</span>
										</div>
										<div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-3 py-2.5 text-sm">
											<span className="text-neutral-600">Disponibles</span>
											<span className="font-medium text-neutral-950">4</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
