'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatServiceMoney } from '@/lib/money';
import { formatDuration } from '@/lib/duration';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/types/staff.types';
import type { EditableService } from './BookingServicesEditor';
import { eligibleStaffFor } from './utils/eligibleStaff';
import { splitServicesByStaff } from './utils/servicesByStaff';

interface Props {
	services: EditableService[];
	staff: StaffMember[];
	onPick: (serviceId: string) => void;
	pickedIds?: string[];
	/**
	 * Con quién se está agendando: el profesional de la columna desde donde se
	 * abrió la reserva, o el que ya está en ella. Cuando viene, la lista se parte
	 * en lo que esa persona hace y lo que no.
	 */
	preferredStaffId?: string | null;
}

interface RowProps {
	service: EditableService;
	staff: StaffMember[];
	picked: boolean;
	onPick: (serviceId: string) => void;
}

const ServiceRow: React.FC<RowProps> = ({ service, staff, picked, onPick }) => {
	// Sin nadie que lo haga, agregarlo dejaría la reserva sin ningún horario
	// posible: se muestra, para que se vea por qué falta.
	const orphan = eligibleStaffFor(staff, service.id).length === 0;

	return (
		<li>
			<button
				type="button"
				disabled={orphan}
				onClick={() => onPick(service.id)}
				className={cn(
					'flex w-full items-stretch gap-3 rounded-lg p-3 text-left transition-colors',
					orphan ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted/60',
				)}
			>
				<span
					aria-hidden="true"
					className={cn(
						'w-[3px] shrink-0 rounded-full',
						orphan ? 'bg-muted-foreground/30' : 'bg-primary',
					)}
				/>

				<span className="min-w-0 flex-1">
					<span className="block truncate font-medium">{service.name}</span>
					<span className="block text-sm text-muted-foreground">
						{formatDuration(service.durationMinutes)}
						{orphan && ' · sin profesional que lo haga'}
						{picked && !orphan && ' · ya está en la reserva'}
					</span>
				</span>

				<span
					className={
						service.price === null
							? 'shrink-0 text-sm text-muted-foreground'
							: 'shrink-0 tabular-nums'
					}
				>
					{formatServiceMoney(service.price, service.currency)}
				</span>
			</button>
		</li>
	);
};

const GroupLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<p className="px-3 pb-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
		{children}
	</p>
);

/**
 * Qué se va a hacer: el primer paso de una reserva nueva.
 *
 * Va primero y no la fecha, aunque la fecha ya venga decidida por el click en la
 * grilla. No es una preferencia de orden: hasta que no hay un servicio no se
 * sabe cuánto dura la reserva, y sin la duración el motor de disponibilidad no
 * puede decir a qué hora entra. Preguntar la hora antes sería ofrecer una lista
 * que todavía no se puede calcular.
 *
 * Las filas son grandes a propósito. Es lo que más se toca del panel —toda
 * reserva pasa por acá— y muchas veces desde el mostrador, con una mano.
 *
 * Cuando la reserva salió de la columna de alguien, la lista va partida en dos:
 * lo que esa persona hace y lo que hace otro. Elegir de la segunda mitad sigue
 * siendo válido —reasigna la cita a quien sí puede, que es lo correcto— pero
 * deja de ser una sorpresa, que era el problema: se agendaba desde la columna de
 * Ana y la cita terminaba siendo de Juan sin que nada lo dijera.
 */
const BookingServicePicker: React.FC<Props> = ({
	services,
	staff,
	onPick,
	pickedIds = [],
	preferredStaffId,
}) => {
	const [term, setTerm] = useState('');

	const needle = term.trim().toLowerCase();

	/*
	 * Un servicio dado de baja no se ofrece: el catálogo vigente es el que define
	 * duración y precio de lo que se agrega.
	 */
	const matches = services
		.filter((service) => service.isActive !== false)
		.filter((service) => service.name.toLowerCase().includes(needle));

	const preferred =
		staff.find((member) => member.id === preferredStaffId) ?? null;

	const { own, rest } = splitServicesByStaff(matches, staff, preferred?.id);

	/*
	 * Los títulos aparecen sólo cuando hay una distinción que hacer. Con todo el
	 * catálogo del lado de quien atiende, "Los hace Ana" sobre la lista entera no
	 * agrega nada y le pone un encabezado a algo que no está dividido.
	 */
	const grouped = preferred !== null && rest.length > 0;

	const row = (service: EditableService) => (
		<ServiceRow
			key={service.id}
			service={service}
			staff={staff}
			picked={pickedIds.includes(service.id)}
			onPick={onPick}
		/>
	);

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={term}
					className="h-11 pl-9"
					placeholder="Buscar por nombre de servicio"
					aria-label="Buscar servicio"
					onChange={(event) => setTerm(event.target.value)}
				/>
			</div>

			{matches.length === 0 ? (
				<p className="py-8 text-center text-sm text-muted-foreground">
					{services.length === 0
						? 'Todavía no hay servicios cargados.'
						: 'Ningún servicio coincide con esa búsqueda.'}
				</p>
			) : grouped ? (
				<div className="space-y-4">
					{own.length > 0 && (
						<div>
							<GroupLabel>Los hace {preferred.name}</GroupLabel>
							<ul className="space-y-1">{own.map(row)}</ul>
						</div>
					)}

					<div>
						<GroupLabel>
							{own.length > 0
								? 'Los hace otro profesional'
								: `${preferred.name} no hace ninguno`}
						</GroupLabel>
						<ul className="space-y-1">{rest.map(row)}</ul>
					</div>
				</div>
			) : (
				<ul className="space-y-1">{[...own, ...rest].map(row)}</ul>
			)}
		</div>
	);
};

export default BookingServicePicker;
