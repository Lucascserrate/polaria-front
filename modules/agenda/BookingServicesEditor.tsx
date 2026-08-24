'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { eligibleStaffFor } from './utils/eligibleStaff';
import type { StaffMember } from '@/types/staff.types';
import type { DraftItem } from './utils/bookingDraft';
import { formatMoney } from '@/lib/money';
import { formatMinute } from './utils/calendarLayout';

/**
 * Lo mínimo que el editor necesita de un servicio.
 *
 * Estructural a propósito: lo satisface tanto lo que devuelve el catálogo como
 * cualquier otra forma que lo traiga, sin atar esta pantalla a un endpoint.
 */
export interface EditableService {
	id: string;
	name: string;
	price: number;
	durationMinutes: number;
	/** Un servicio dado de baja no se ofrece para agregar. */
	isActive?: boolean;
}

interface Props {
	items: DraftItem[];
	onChange: (items: DraftItem[]) => void;
	services: EditableService[];
	staff: StaffMember[];
	currency: string;
	/** Minutos en que arranca cada tramo, para mostrar su hora. */
	offsets: number[];
	/** Minuto del día en que arranca la reserva, o `null` si no se sabe. */
	startMinute: number | null;
	/**
	 * Profesional a proponer para el primer servicio.
	 *
	 * Al crear desde la columna de alguien en la agenda diaria, el click ya dijo
	 * quién atiende: preguntarlo otra vez sería pedir un dato que ya se dio.
	 */
	preferredStaffId?: string | null;
	disabled?: boolean;
}

/**
 * Los servicios de la reserva, cada uno con su profesional.
 *
 * Un servicio y un profesional por fila porque así está guardado: el corte lo
 * puede hacer Diego y la barba Carlos. La lista de profesionales de cada fila es
 * la de quienes hacen **ese** servicio, con el mismo criterio que usa el motor de
 * disponibilidad, así que no se puede elegir a alguien que después devuelva cero
 * horarios.
 *
 * Las horas que muestra son las que van a quedar: se recalculan encadenando las
 * duraciones vigentes, igual que hace el backend al guardar.
 */
const BookingServicesEditor: React.FC<Props> = ({
	items,
	onChange,
	services,
	staff,
	currency,
	offsets,
	startMinute,
	preferredStaffId,
	disabled = false,
}) => {
	const [adding, setAdding] = useState(false);

	const activeServices = services.filter((service) => service.isActive !== false);

	const timeOf = (index: number): string => {
		if (startMinute === null) return '--:--';
		return formatMinute(startMinute + (offsets[index] ?? 0));
	};

	const replaceStaff = (index: number, staffId: string) =>
		onChange(
			items.map((item, position) =>
				position === index ? { ...item, staffId } : item,
			),
		);

	const remove = (index: number) =>
		onChange(items.filter((_, position) => position !== index));

	const add = (serviceId: string) => {
		const eligible = eligibleStaffFor(staff, serviceId);
		if (eligible.length === 0) return;

		/*
		 * Se propone al profesional que ya está en la reserva si puede hacerlo. Es
		 * lo más probable —el cliente vino a atenderse con alguien— y evita una
		 * segunda elección para el caso normal.
		 */
		const preferred =
			eligible.find((member) =>
				items.some((item) => item.staffId === member.id),
			) ??
			eligible.find((member) => member.id === preferredStaffId) ??
			eligible[0];

		onChange([...items, { serviceId, staffId: preferred.id }]);
		setAdding(false);
	};

	return (
		<div className="space-y-2">
			<ul className="space-y-2">
				{items.map((item, index) => {
					const service = services.find((entry) => entry.id === item.serviceId);
					const eligible = eligibleStaffFor(staff, item.serviceId);

					return (
						<li
							key={`${item.serviceId}-${index}`}
							className="flex items-start gap-3"
						>
							<span className="mt-3 w-11 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
								{timeOf(index)}
							</span>

							<div className="min-w-0 flex-1 space-y-2 rounded-lg border border-border bg-card p-3">
								<div className="flex items-baseline justify-between gap-2">
									<p className="truncate text-sm font-medium">
										{service?.name ?? 'Servicio que ya no existe'}
									</p>
									<div className="flex shrink-0 items-center gap-2">
										<p className="text-sm tabular-nums">
											{formatMoney(service?.price ?? 0, currency)}
										</p>
										<Button
											variant="ghost"
											size="icon-xs"
											aria-label={`Quitar ${service?.name ?? 'el servicio'}`}
											disabled={disabled || items.length === 1}
											title={
												items.length === 1
													? 'Una reserva necesita al menos un servicio'
													: undefined
											}
											onClick={() => remove(index)}
										>
											<X />
										</Button>
									</div>
								</div>

								<Select
									value={item.staffId}
									disabled={disabled || eligible.length === 0}
									onValueChange={(value) => replaceStaff(index, value)}
								>
									<SelectTrigger size="sm" className="w-full">
										<SelectValue placeholder="Elegir profesional" />
									</SelectTrigger>
									<SelectContent>
										{eligible.map((member) => (
											<SelectItem key={member.id} value={member.id}>
												{member.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<p className="text-xs text-muted-foreground">
									{service?.durationMinutes ?? 0} min
								</p>
							</div>
						</li>
					);
				})}
			</ul>

			{adding ? (
				<div className="ml-14 space-y-2 rounded-lg border border-dashed border-border p-3">
					<p className="text-xs text-muted-foreground">
						¿Qué servicio se agrega?
					</p>
					<div className="space-y-1">
						{activeServices.map((service) => {
							const eligible = eligibleStaffFor(staff, service.id);

							return (
								<Button
									key={service.id}
									variant="outline"
									size="sm"
									className="w-full justify-between"
									// Sin nadie que lo haga, agregarlo dejaría la reserva sin
									// horarios posibles.
									disabled={eligible.length === 0}
									onClick={() => add(service.id)}
								>
									<span className="truncate">{service.name}</span>
									<span className="shrink-0 text-xs text-muted-foreground">
										{eligible.length === 0
											? 'sin profesional'
											: `${service.durationMinutes} min`}
									</span>
								</Button>
							);
						})}
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="w-full"
						onClick={() => setAdding(false)}
					>
						Cancelar
					</Button>
				</div>
			) : (
				<Button
					variant="outline"
					size="sm"
					className="ml-14 w-[calc(100%-3.5rem)] border-dashed"
					disabled={disabled}
					onClick={() => setAdding(true)}
				>
					<Plus className="h-4 w-4" />
					Añadir servicio
				</Button>
			)}
		</div>
	);
};

export default BookingServicesEditor;
