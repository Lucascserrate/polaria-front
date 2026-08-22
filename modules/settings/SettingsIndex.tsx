'use client';

import Link from 'next/link';
import {
	BellRing,
	Building2,
	ChevronRight,
	Clock,
	MessageCircle,
	type LucideIcon,
} from 'lucide-react';
import BotSwitchCard from '@/modules/settings/BotSwitchCard';
import { ROUTES } from '@/constants/routes';
import { describeReminderOffsets } from '@/modules/settings/utils/reminders';
import useGetSettings from '@/services/settings/useGetSettings';

type Section = {
	href: string;
	label: string;
	description: string;
	icon: LucideIcon;
	/** Dato de estado, cuando decirlo ahorra entrar. */
	status?: (settings: SettingsSummary) => string | null;
};

type SettingsSummary = {
	businessType: string | null;
	businessHoursDays: number;
	whatsappConnected: boolean;
	whatsappNumber: string | null;
	reminderOffsets: number[];
};

/**
 * Las secciones del hub.
 *
 * Cada una lleva un resumen de su estado. Es lo que evita que el índice sea una
 * lista de nombres que obliga a entrar en las cinco para saber qué falta.
 */
const SECTIONS: Section[] = [
	{
		href: ROUTES.settingsBusiness,
		label: 'Información del negocio',
		description: 'Nombre, rubro, zona horaria y ubicación.',
		icon: Building2,
		status: (settings) => (settings.businessType ? null : 'Falta el rubro'),
	},
	{
		href: ROUTES.settingsHours,
		label: 'Horarios de atención',
		description: 'Los días y las horas en que se toman reservas.',
		icon: Clock,
		status: (settings) =>
			settings.businessHoursDays > 0
				? `${settings.businessHoursDays} ${settings.businessHoursDays === 1 ? 'día' : 'días'} de atención`
				: 'Sin horarios cargados',
	},
	{
		href: ROUTES.settingsWhatsapp,
		label: 'WhatsApp',
		description: 'La cuenta por la que tus clientes reservan.',
		icon: MessageCircle,
		status: (settings) =>
			settings.whatsappConnected
				? (settings.whatsappNumber ?? 'Conectado')
				: 'Sin conectar',
	},
	{
		href: ROUTES.settingsReminders,
		label: 'Recordatorios',
		description: 'El aviso automático antes de cada cita.',
		icon: BellRing,
		status: (settings) => describeReminderOffsets(settings.reminderOffsets),
	},
];

/**
 * Índice de Configuración.
 *
 * Cada sección tiene pantalla propia y acá solo queda la lista. Configuración
 * había crecido a seis tarjetas apiladas, y en una sola página larga cualquier
 * cosa que se agregue empuja al resto más abajo.
 *
 * El interruptor de Polaria se queda en el índice: no es una categoría, es el
 * estado general del producto, y esconderlo dentro de una sección haría más
 * difícil llegar a lo que es un corte de emergencia.
 */
const SettingsIndex: React.FC = () => {
	const { data } = useGetSettings();

	const summary: SettingsSummary = {
		businessType: data?.businessType ?? null,
		businessHoursDays: new Set(
			(data?.businessHours ?? []).map((range) => range.dayOfWeek),
		).size,
		whatsappConnected: data?.whatsappConnection.connected ?? false,
		whatsappNumber: data?.whatsappConnection.phoneNumber ?? null,
		reminderOffsets: data?.reminders.offsets ?? [],
	};

	return (
		<div className="space-y-6">
			<BotSwitchCard />

			<div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
				{SECTIONS.map((section) => {
					const Icon = section.icon;
					const status = data ? section.status?.(summary) : null;

					return (
						<Link
							key={section.href}
							href={section.href}
							className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-accent"
						>
							<Icon className="h-5 w-5 shrink-0 text-muted-foreground" />

							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium">{section.label}</p>
								<p className="text-xs text-muted-foreground">
									{section.description}
								</p>
							</div>

							{status && (
								<span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
									{status}
								</span>
							)}

							<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default SettingsIndex;
