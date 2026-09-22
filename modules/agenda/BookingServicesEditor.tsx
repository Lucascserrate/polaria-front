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
import type { DraftItem, DraftPrice } from './utils/bookingDraft';
import { formatServiceMoney } from '@/lib/money';
import { formatDuration } from '@/lib/duration';
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
	/** `null` si se cotiza: el precio se escribe en la cita. */
	price: number | null;
	currency: string;
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
	/** Lo que se cobra por cada tramo, en el mismo orden que `items`. */
	prices: DraftPrice[];
	/** Minuto del día en que arranca la reserva, o `null` si no se sabe. */
	startMinute: number | null;
	/**
	 * Profesional a proponer para el primer servicio.
	 *
	 * Al crear desde la columna de alguien en la agenda diaria, el click ya dijo
	 * quién atiende: preguntarlo otra vez sería pedir un dato que ya se dio.
	 */
	preferredStaffId?: string | null;
	/**
	 * Quién resuelve "Añadir servicio".
	 *
	 * Presente, el editor sólo avisa y el padre muestra su propio selector: la
	 * reserva nueva agrega con el mismo buscador grande con el que eligió el
	 * primer servicio, y tener dos formas distintas de elegir lo mismo en la
	 * misma pantalla se lee como dos funciones distintas. Ausente, el editor abre
	 * su lista corta, que es lo que le sirve al panel de edición.
	 */
	onAddRequest?: () => void;
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
	prices,
	startMinute,
	preferredStaffId,
	onAddRequest,
	disabled = false,
}) => {
	const [adding, setAdding] = useState(false);

	const activeServices = services.filter(
		(service) => service.isActive !== false,
	);

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
			<ul className="space-y-4">
				{items.map((item, index) => {
					const service = services.find((entry) => entry.id === item.serviceId);
					const eligible = eligibleStaffFor(staff, item.serviceId);

					return (
						/*
						 * Una barra al costado, no una caja.
						 *
						 * La fila encajonada dibujaba un borde alrededor de cada servicio y
						 * otro alrededor de la lista, y con dos o tres servicios eso son
						 * cuatro rectángulos anidados donde hay un solo dato. La barra marca
						 * dónde empieza cada uno sin cerrar nada.
						 */
						<li
							key={`${item.serviceId}-${index}`}
							className="flex items-stretch gap-3"
						>
							<span
								aria-hidden="true"
								className="w-[3px] shrink-0 rounded-full bg-primary"
							/>

							<div className="min-w-0 flex-1">
								<div className="flex items-baseline justify-between gap-3">
									<p className="truncate font-medium">
										{service?.name ?? 'Servicio que ya no existe'}
									</p>
									<div className="flex shrink-0 items-center gap-1">
										{/*
										 * Lo pactado en **esta** reserva, no el precio de hoy del
										 * catálogo: un servicio que subió de precio no le cambia el
										 * total a una cita que ya estaba tomada. El que se cotiza
										 * dice que no tiene precio; se escribe al finalizar la cita.
										 */}
										<p
											className={
												prices[index]?.price === null
													? 'text-muted-foreground'
													: 'tabular-nums'
											}
										>
											{formatServiceMoney(
												prices[index]?.price ?? null,
												prices[index]?.currency ||
													service?.currency ||
													currency,
											)}
										</p>
										{/*
										 * Se puede quitar el último.
										 *
										 * Una reserva sin servicios no existe —el backend la
										 * rechaza— pero eso es una regla sobre *guardar*, no sobre
										 * quitar: entre sacar el servicio equivocado y poner el que
										 * iba hay un momento con la lista vacía, y es el camino
										 * normal de quien se equivocó al elegir. Apagando la X ese
										 * camino no existía: había que agregar el correcto primero
										 * y recién después sacar el otro, o cerrar el panel y
										 * empezar de nuevo.
										 *
										 * Quién impide guardar vacío son los dos paneles, cada uno
										 * en su `canSave`.
										 */}
										<Button
											variant="ghost"
											size="icon-xs"
											aria-label={`Quitar ${service?.name ?? 'el servicio'}`}
											disabled={disabled}
											onClick={() => remove(index)}
										>
											<X />
										</Button>
									</div>
								</div>

								{/*
								 * Hora, duración y profesional en un solo renglón, separados
								 * por puntos. La hora dejó de tener columna propia: con la
								 * barra al costado ya se ve dónde empieza cada servicio, y una
								 * columna de ancho fijo para cuatro caracteres se comía el
								 * espacio del nombre.
								 */}
								<div className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
									<span className="tabular-nums">{timeOf(index)}</span>
									<span aria-hidden="true">·</span>
									<span>{formatDuration(service?.durationMinutes ?? 0)}</span>
									<span aria-hidden="true">·</span>

									{/*
									 * El profesional se lee como parte de la línea y se cambia
									 * ahí mismo. Con el aspecto de un campo de formulario —borde,
									 * fondo, su propio renglón— pesaba más que el nombre del
									 * servicio, que es lo que la fila viene a decir.
									 */}
									<Select
										value={item.staffId}
										disabled={disabled || eligible.length === 0}
										onValueChange={(value) => replaceStaff(index, value)}
									>
										{/*
										 * `min-w-0` para que el nombre se recorte en vez de
										 * empujar la fila: en un teléfono, "11:00 · 1 h 30 min ·"
										 * más un nombre largo no entra, y sin esto el renglón
										 * crecía hacia afuera y aparecía scroll horizontal en
										 * todo el panel.
										 */}
										<SelectTrigger
											size="sm"
											aria-label="Profesional"
											className="h-auto min-w-0 gap-1 border-0 bg-transparent px-0 py-0 text-sm shadow-none data-[size=sm]:h-auto dark:bg-transparent dark:hover:bg-transparent"
										>
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
								</div>
							</div>
						</li>
					);
				})}
			</ul>

			{adding && !onAddRequest ? (
				<div className="space-y-2 rounded-lg border border-dashed border-border p-3">
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
					className="w-full border-dashed"
					disabled={disabled}
					onClick={() => (onAddRequest ? onAddRequest() : setAdding(true))}
				>
					<Plus className="h-4 w-4" />
					Añadir servicio
				</Button>
			)}
		</div>
	);
};

export default BookingServicesEditor;
