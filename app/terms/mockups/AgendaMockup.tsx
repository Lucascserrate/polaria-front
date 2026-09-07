'use client';

import { useState } from 'react';
import {
	BarChart3,
	CalendarDays,
	Home,
	LogOut,
	Monitor,
	Moon,
	Power,
	Scissors,
	Search,
	Settings,
	Sun,
	Trash2,
	UserRound,
	Users,
} from 'lucide-react';
import { Logo } from '@/app/logo';
import {
	agendaSidebarItems,
	mockAppointments,
	mockClients,
	mockServices,
	mockStaff,
	weekDays,
	type AgendaSection,
} from '../data';

const icons = {
	inicio: Home,
	agenda: CalendarDays,
	clientes: Users,
	servicios: Scissors,
	personal: UserRound,
	analiticas: BarChart3,
	configuracion: Settings,
} as const;

function initials(name: string) {
	return name
		.split(' ')
		.map((part) => part[0])
		.slice(0, 2)
		.join('');
}

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 17;
const HOUR_HEIGHT = 68;
const MIN_BLOCK_HEIGHT = 44;

function timeToMinutes(time: string) {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
}

type AgendaColumn = {
	key: string;
	label: string;
	sublabel?: string;
	dotColor?: string;
	appointments: {
		id: string;
		client: string;
		serviceId: string;
		start: string;
		color: string;
	}[];
};

function HourGrid({ columns }: { columns: AgendaColumn[] }) {
	const serviceById = new Map(
		mockServices.map((service) => [service.id, service]),
	);
	const hours = Array.from(
		{ length: DAY_END_HOUR - DAY_START_HOUR + 1 },
		(_, index) => DAY_START_HOUR + index,
	);
	const gridHeight = (hours.length - 1) * HOUR_HEIGHT;
	const gridColumns = `54px repeat(${columns.length}, minmax(110px,1fr))`;

	return (
		<div
			className="rounded-3xl border border-neutral-200 bg-white p-3"
			style={{ minWidth: 54 + columns.length * 130 }}
		>
			<div
				className="grid gap-2 text-[11px]"
				style={{ gridTemplateColumns: gridColumns }}
			>
				<div />
				{columns.map((column) => (
					<div key={column.key} className="rounded-2xl bg-neutral-50 px-3 py-2">
						<div className="flex items-center gap-2">
							{column.dotColor && (
								<span
									className="size-2 rounded-full"
									style={{ backgroundColor: column.dotColor }}
								/>
							)}
							<span className="font-medium text-neutral-950">
								{column.label}
							</span>
						</div>
						{column.sublabel && (
							<p className="mt-1 text-neutral-500">{column.sublabel}</p>
						)}
					</div>
				))}
			</div>
			<div
				className="relative mt-2 grid"
				style={{ gridTemplateColumns: gridColumns, height: gridHeight }}
			>
				<div className="relative">
					{hours.map((hour, index) => (
						<span
							key={hour}
							className="absolute left-0 -translate-y-1/2 text-[11px] text-neutral-400"
							style={{ top: index * HOUR_HEIGHT }}
						>
							{String(hour).padStart(2, '0')}:00
						</span>
					))}
				</div>
				{columns.map((column) => (
					<div
						key={column.key}
						className="relative border-l border-neutral-100"
					>
						{hours.map((hour, index) => (
							<div
								key={hour}
								className="absolute inset-x-0 border-t border-neutral-100"
								style={{ top: index * HOUR_HEIGHT }}
							/>
						))}
						{column.appointments.map((appointment) => {
							const service = serviceById.get(appointment.serviceId);
							if (!service) return null;
							const startMinutes =
								timeToMinutes(appointment.start) - DAY_START_HOUR * 60;
							const top = (startMinutes / 60) * HOUR_HEIGHT;
							const height = Math.max(
								(service.duration / 60) * HOUR_HEIGHT,
								MIN_BLOCK_HEIGHT,
							);
							if (startMinutes < 0 || startMinutes > gridHeight) return null;
							return (
								<div
									key={appointment.id}
									className="absolute inset-x-1 flex flex-col justify-center overflow-hidden rounded-xl px-2 py-1.5 text-white"
									style={{ top, height, backgroundColor: appointment.color }}
								>
									<p className="truncate text-[11px] font-medium">
										{service.name}
									</p>
									<p className="truncate text-[10px] text-white/70">
										{appointment.client} · {service.duration} min
									</p>
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}

function AgendaView() {
	const [viewMode, setViewMode] = useState<'dia' | 'semana'>('dia');

	const dayColumns: AgendaColumn[] = mockStaff.map((staff) => ({
		key: staff.id,
		label: staff.name,
		sublabel: staff.role,
		dotColor: staff.color,
		appointments: mockAppointments
			.filter((appointment) => appointment.staffId === staff.id)
			.map((appointment) => ({
				id: appointment.id,
				client: appointment.client,
				serviceId: appointment.serviceId,
				start: appointment.start,
				color: staff.color,
			})),
	}));

	const staffById = new Map(mockStaff.map((staff) => [staff.id, staff]));
	const weekColumns: AgendaColumn[] = weekDays.map((day, index) => ({
		key: day.label,
		label: day.label,
		sublabel: day.date,
		appointments: mockAppointments
			.filter((appointment) => appointment.weekday === index)
			.map((appointment) => ({
				id: appointment.id,
				client: appointment.client,
				serviceId: appointment.serviceId,
				start: appointment.start,
				color: staffById.get(appointment.staffId)?.color ?? '#6d78d9',
			})),
	}));

	return (
		<div className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-sm font-medium text-neutral-950">
						{viewMode === 'dia' ? 'Agenda de Hoy' : 'Agenda de la semana'}
					</p>
					<p className="text-xs text-neutral-500">
						{viewMode === 'dia'
							? 'Lunes, 5 de septiembre · Studio Norte'
							: '31 de agosto – 6 de septiembre · Studio Norte'}
					</p>
				</div>
				<div className="flex items-center gap-1 text-xs text-neutral-600">
					<div className="flex items-center rounded-md border border-neutral-200 bg-white p-0.5">
						<button
							type="button"
							onClick={() => setViewMode('dia')}
							className={`rounded px-2 py-1 text-[10px] transition-colors ${viewMode === 'dia' ? 'bg-neutral-100 font-medium text-neutral-950' : 'text-neutral-500 hover:bg-neutral-50'}`}
						>
							Día
						</button>
						<button
							type="button"
							onClick={() => setViewMode('semana')}
							className={`rounded px-2 py-1 text-[10px] transition-colors ${viewMode === 'semana' ? 'bg-neutral-100 font-medium text-neutral-950' : 'text-neutral-500 hover:bg-neutral-50'}`}
						>
							Semana
						</button>
					</div>
					<button
						type="button"
						className="cursor-default rounded-md bg-neutral-950 px-2.5 py-1.5 text-[10px] font-medium text-white"
					>
						<span aria-hidden="true">+</span> Agregar cita
					</button>
				</div>
			</div>
			<div className="mt-5 overflow-x-auto pb-1">
				<HourGrid columns={viewMode === 'dia' ? dayColumns : weekColumns} />
			</div>
		</div>
	);
}

function ClientsView() {
	return (
		<DashboardView
			title="Clientes"
			description="Quiénes reservan en el negocio y cómo contactarlos."
			count={mockClients.length}
		>
			<div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-400">
				<Search className="size-3.5" />
				Nombre, teléfono o email
			</div>
			<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				<div className="grid grid-cols-[1.4fr_1fr_0.9fr_0.9fr] border-b border-neutral-200 px-4 py-3 text-[10px] font-medium text-neutral-500">
					<span>Cliente</span>
					<span>Teléfono</span>
					<span>Origen</span>
					<span>Se unió</span>
				</div>
				{mockClients.map((client) => (
					<div
						key={client.id}
						className="grid grid-cols-[1.4fr_1fr_0.9fr_0.9fr] items-center border-b border-neutral-100 px-4 py-3 text-[11px] last:border-0"
					>
						<div className="flex items-center gap-2 font-medium">
							<span className="flex size-6 items-center justify-center rounded-full bg-neutral-100 text-[9px] text-neutral-600">
								{initials(client.name)}
							</span>
							{client.name}
						</div>
						<span className="text-neutral-500">{client.phone}</span>
						<span className="text-neutral-500">{client.origin}</span>
						<span className="text-neutral-500">{client.joinedAt}</span>
					</div>
				))}
			</div>
		</DashboardView>
	);
}
function ServicesView() {
	return (
		<DashboardView
			title="Servicios"
			description="Qué ofrece el negocio, cuánto dura y cuánto cuesta."
			count={mockServices.length}
		>
			<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				<div className="grid grid-cols-[1.6fr_0.7fr_0.6fr] border-b border-neutral-200 px-4 py-3 text-[10px] font-medium text-neutral-500">
					<span>Servicio</span>
					<span>Duración</span>
					<span className="text-right">Precio</span>
				</div>
				{mockServices.map((service) => (
					<div
						key={service.id}
						className="grid grid-cols-[1.6fr_0.7fr_0.6fr] items-center border-b border-neutral-100 px-4 py-3 text-[11px] last:border-0"
					>
						<div>
							<p className="font-medium text-neutral-950">{service.name}</p>
							<p className="mt-0.5 text-[10px] text-neutral-500">
								{service.description}
							</p>
						</div>
						<span className="text-neutral-500">{service.duration} min</span>
						<span className="text-right font-medium">Bs {service.price}</span>
					</div>
				))}
			</div>
		</DashboardView>
	);
}
function StaffView() {
	return (
		<DashboardView
			title="Equipo"
			description="Quiénes forman parte del negocio y qué hace cada uno."
			count={mockStaff.length}
		>
			<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				<div className="hidden grid-cols-[1.3fr_1fr_0.7fr_0.6fr_0.5fr] px-4 py-3 text-[10px] font-medium text-neutral-500 sm:grid">
					<span>Nombre</span>
					<span>Función</span>
					<span>Servicios</span>
					<span>Comisión</span>
					<span>Activo</span>
				</div>
				{mockStaff.map((staff) => (
					<div
						key={staff.id}
						className="grid gap-2 border-t border-neutral-100 px-4 py-3 first:border-t-0 sm:grid-cols-[1.3fr_1fr_0.7fr_0.6fr_0.5fr] sm:items-center"
					>
						<div className="flex items-center gap-2">
							<span
								className="flex size-7 items-center justify-center rounded-full text-[9px] font-semibold text-white"
								style={{ backgroundColor: staff.color }}
							>
								{staff.initials}
							</span>
							<span className="text-[11px] font-medium">{staff.name}</span>
						</div>
						<span className="text-[10px] text-neutral-500">{staff.role}</span>
						<span className="text-[10px] text-neutral-500">
							{staff.services.length}
						</span>
						<span className="text-[10px] text-neutral-500">
							{staff.commission}
						</span>
						<div className="flex items-center justify-between">
							<span
								className={`h-4 w-7 rounded-full ${staff.active ? 'bg-neutral-950' : 'bg-neutral-200'}`}
							/>
							<Trash2 className="size-3.5 text-red-400 sm:hidden" />
						</div>
					</div>
				))}
			</div>
		</DashboardView>
	);
}
function AnalyticsView() {
	const totalRevenue = mockServices.reduce(
		(sum, service) => sum + service.price,
		0,
	);
	const totalAppointments = mockServices.length + 2;
	const staffRevenue = mockStaff.map((staff) => ({
		staff,
		revenue: Math.round(totalRevenue / mockStaff.length),
	}));
	const topServices = [...mockServices]
		.sort((a, b) => b.price - a.price)
		.slice(0, 3);
	const maxServicePrice = topServices[0]?.price ?? 1;
	return (
		<DashboardView
			title="Analíticas"
			description="Cómo viene el negocio: cuánto factura, quién atiende y qué se vende."
			hideAdd
		>
			<div className="rounded-2xl border border-neutral-200 bg-white p-4">
				<p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
					Facturado · este mes
				</p>
				<p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
					Bs {totalRevenue}
				</p>
				<p className="mt-1 text-xs text-neutral-500">
					{totalAppointments} citas atendidas · Bs{' '}
					{Math.round(totalRevenue / totalAppointments)} por cita
				</p>
			</div>
			<div className="mt-4 grid gap-3 sm:grid-cols-2">
				<div className="rounded-2xl border border-neutral-200 bg-white p-4">
					<p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
						Profesionales
					</p>
					<div className="mt-3 space-y-3">
						{staffRevenue.map(({ staff, revenue }) => (
							<div key={staff.id}>
								<div className="flex items-center justify-between text-[11px] font-medium">
									<span>{staff.name}</span>
									<span>Bs {revenue}</span>
								</div>
								<div className="mt-1.5 h-1.5 rounded-full bg-neutral-100">
									<div
										className="h-1.5 rounded-full bg-neutral-950"
										style={{
											width: `${(revenue / totalRevenue) * 100}%`,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="rounded-2xl border border-neutral-200 bg-white p-4">
					<p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
						Servicios
					</p>
					<div className="mt-3 space-y-3">
						{topServices.map((service) => (
							<div key={service.id}>
								<div className="flex items-center justify-between text-[11px] font-medium">
									<span>{service.name}</span>
									<span>Bs {service.price}</span>
								</div>
								<div className="mt-1.5 h-1.5 rounded-full bg-neutral-100">
									<div
										className="h-1.5 rounded-full bg-neutral-950"
										style={{
											width: `${(service.price / maxServicePrice) * 100}%`,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</DashboardView>
	);
}
function SettingsView() {
	const rows = [
		{
			title: 'Información del negocio',
			subtitle: 'Nombre, rubro, zona horaria y ubicación.',
		},
		{ title: 'Horarios de atención', subtitle: '6 días de atención' },
		{ title: 'WhatsApp', subtitle: 'Sin conectar' },
		{ title: 'Mensaje de bienvenida', subtitle: 'Texto original' },
		{ title: 'Recordatorios', subtitle: '24 horas antes' },
	];
	return (
		<DashboardView
			title="Configuración"
			description="Los ajustes de tu negocio, por sección."
			hideAdd
		>
			<div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4">
				<div className="flex items-center gap-3">
					<Power className="size-4 text-neutral-950" />
					<div>
						<p className="text-[11px] font-medium">Polaria activa</p>
						<p className="mt-0.5 text-[10px] text-neutral-500">
							Responde los mensajes de WhatsApp y toma reservas.
						</p>
					</div>
				</div>
				<span className="h-4 w-7 rounded-full bg-neutral-950" />
			</div>
			<div className="mt-3 space-y-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
				{rows.map((row) => (
					<div
						key={row.title}
						className="border-b border-neutral-100 px-4 py-4 last:border-0"
					>
						<p className="text-[11px] font-medium">{row.title}</p>
						<p className="mt-1 text-[10px] text-neutral-500">{row.subtitle}</p>
					</div>
				))}
			</div>
			<div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
				<p className="text-[11px] font-medium">Apariencia</p>
				<p className="mt-1 text-[10px] text-neutral-500">
					Cómo se ve el panel en este dispositivo.
				</p>
				<div className="mt-3 grid grid-cols-3 gap-2">
					{[
						{ label: 'Sistema', icon: Monitor, active: false },
						{ label: 'Claro', icon: Sun, active: true },
						{ label: 'Oscuro', icon: Moon, active: false },
					].map(({ label, icon: Icon, active }) => (
						<div
							key={label}
							className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-[10px] ${active ? 'border-neutral-950 bg-neutral-50 text-neutral-950' : 'border-neutral-200 text-neutral-500'}`}
						>
							<Icon className="size-3.5" />
							{label}
						</div>
					))}
				</div>
			</div>
		</DashboardView>
	);
}
function DashboardView({
	title,
	description,
	count,
	hideAdd,
	children,
}: {
	title: string;
	description: string;
	count?: number;
	hideAdd?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
			<div className="flex shrink-0 items-start justify-between">
				<div>
					<h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.04em] text-neutral-950">
						{title}
						{typeof count === 'number' && (
							<span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
								{count}
							</span>
						)}
					</h2>
					<p className="mt-1 text-xs text-neutral-500">{description}</p>
				</div>
				{!hideAdd && (
					<button
						type="button"
						className="cursor-default rounded-md bg-neutral-950 px-2.5 py-1.5 text-[10px] font-medium text-white"
					>
						+ Añadir
					</button>
				)}
			</div>
			<div className="mt-5">{children}</div>
		</div>
	);
}

export function AgendaMockup() {
	const [activeSection, setActiveSection] = useState<AgendaSection>('agenda');
	const view =
		activeSection === 'agenda' ? (
			<AgendaView />
		) : activeSection === 'clientes' ? (
			<ClientsView />
		) : activeSection === 'servicios' ? (
			<ServicesView />
		) : activeSection === 'personal' ? (
			<StaffView />
		) : activeSection === 'analiticas' ? (
			<AnalyticsView />
		) : (
			<SettingsView />
		);
	return (
		<section className="px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
			<div className="mx-auto max-w-7xl">
				<div className="h-170 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-3 shadow-[0_30px_80px_rgba(0,0,0,0.08)] sm:h-180 sm:p-4">
					<div className="grid h-full gap-3 sm:grid-cols-[185px_minmax(0,1fr)]">
						<aside className="flex h-auto flex-col rounded-[1.5rem] border border-neutral-200 bg-white p-3 text-neutral-950 shadow-sm sm:h-full">
							<div className="flex shrink-0 items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
									<Logo
										tone="dark"
										showWordmark={false}
										className="text-[12px]"
									/>
								</div>
								<div>
									<p className="text-sm font-medium">Studio Norte</p>
									<p className="text-xs text-neutral-400">Panel operativo</p>
								</div>
							</div>
							<div className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-x-auto text-sm lg:space-y-1">
								{agendaSidebarItems.map((item) => {
									const Icon = icons[item.id];
									return (
										<button
											type="button"
											key={item.id}
											onClick={() => setActiveSection(item.id)}
											className={`flex min-w-fit w-full shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-left transition-colors ${activeSection === item.id ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-600 hover:bg-neutral-50'}`}
										>
											<Icon className="size-3.5" />
											{item.label}
										</button>
									);
								})}
							</div>
							<button
								type="button"
								className="mt-auto flex shrink-0 items-center gap-2 border-t border-neutral-200 px-3 pt-4 text-left text-sm text-neutral-600 transition-colors hover:text-neutral-950"
							>
								<LogOut className="size-3.5" />
								Cerrar sesión
							</button>
						</aside>
						<div className="min-h-0 min-w-0 sm:h-full">{view}</div>
					</div>
				</div>
			</div>
		</section>
	);
}

