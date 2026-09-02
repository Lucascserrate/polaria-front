'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatMoney } from '@/lib/money';
import { formatDuration } from '@/lib/duration';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/types/staff.types';
import type { EditableService } from './BookingServicesEditor';
import { eligibleStaffFor } from './utils/eligibleStaff';

interface Props {
	services: EditableService[];
	staff: StaffMember[];
	currency: string;
	onPick: (serviceId: string) => void;
	/** Servicios ya puestos en la reserva, para señalarlos sin bloquearlos. */
	pickedIds?: string[];
}

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
 */
const BookingServicePicker: React.FC<Props> = ({
	services,
	staff,
	currency,
	onPick,
	pickedIds = [],
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

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					autoFocus
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
			) : (
				<ul className="space-y-1">
					{matches.map((service) => {
						const eligible = eligibleStaffFor(staff, service.id);
						// Sin nadie que lo haga, agregarlo dejaría la reserva sin ningún
						// horario posible: se muestra, para que se vea por qué falta.
						const orphan = eligible.length === 0;
						const picked = pickedIds.includes(service.id);

						return (
							<li key={service.id}>
								<button
									type="button"
									disabled={orphan}
									onClick={() => onPick(service.id)}
									className={cn(
										'flex w-full items-stretch gap-3 rounded-lg p-3 text-left transition-colors',
										orphan
											? 'cursor-not-allowed opacity-60'
											: 'hover:bg-muted/60',
									)}
								>
									{/*
									 * La misma barra redondeada al costado que la fila de un
									 * servicio ya elegido. Elegir uno del catálogo y verlo puesto
									 * en la reserva son dos momentos de la misma cosa: si se
									 * dibujaran distinto, el segundo se leería como otro objeto.
									 */}
									<span
										aria-hidden="true"
										className={cn(
											'w-[3px] shrink-0 rounded-full',
											orphan ? 'bg-muted-foreground/30' : 'bg-primary',
										)}
									/>

									<span className="min-w-0 flex-1">
										<span className="block truncate font-medium">
											{service.name}
										</span>
										<span className="block text-sm text-muted-foreground">
											{formatDuration(service.durationMinutes)}
											{orphan && ' · sin profesional que lo haga'}
											{picked && !orphan && ' · ya está en la reserva'}
										</span>
									</span>

									<span className="shrink-0 tabular-nums">
										{formatMoney(service.price, currency)}
									</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default BookingServicePicker;
