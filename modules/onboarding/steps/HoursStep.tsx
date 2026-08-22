'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { ScheduleDraft } from '@/modules/schedule/utils/weeklySchedule';
import {
	addRange,
	DAY_PILLS,
	dayRanges,
	isDayOpen,
	removeRange,
	setDayOpen,
	updateRange,
} from '../utils/daySchedule';

interface Props {
	value: ScheduleDraft;
	onChange: (draft: ScheduleDraft) => void;
	error: string | null;
}

/**
 * Horario de atención: un día a la vez.
 *
 * La fila de pastillas cumple dos funciones y conviene no confundirlas. El
 * **relleno** dice si el día está abierto; el **borde** dice cuál se está
 * editando. Tocar una pastilla solo cambia lo segundo, así que se puede mirar el
 * horario del jueves sin abrirlo por accidente.
 *
 * Abrir y cerrar vive en el interruptor de abajo, junto al día que nombra. Es lo
 * que evita el gesto ambiguo de "toqué el día, ¿lo seleccioné o lo apagué?".
 *
 * Frente al editor que muestra los siete días a la vez, acá hay a lo sumo un día
 * de campos en pantalla. La jornada completa se sigue viendo de un vistazo en las
 * pastillas, que es la información que uno busca al mirar.
 */
const HoursStep: React.FC<Props> = ({ value, onChange, error }) => {
	const [selectedDay, setSelectedDay] = useState<number>(DAY_PILLS[0].dayOfWeek);

	const selected = useMemo(
		() => DAY_PILLS.find((day) => day.dayOfWeek === selectedDay) ?? DAY_PILLS[0],
		[selectedDay],
	);

	const ranges = dayRanges(value, selected.dayOfWeek);
	const open = isDayOpen(value, selected.dayOfWeek);

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Tus días
				</p>
				<div className="flex flex-wrap gap-2">
					{DAY_PILLS.map((day) => {
						const dayOpen = isDayOpen(value, day.dayOfWeek);
						const isSelected = day.dayOfWeek === selected.dayOfWeek;

						return (
							<button
								key={day.dayOfWeek}
								type="button"
								aria-pressed={isSelected}
								aria-label={`${day.label}${dayOpen ? '' : ' (cerrado)'}`}
								onClick={() => setSelectedDay(day.dayOfWeek)}
								// Una decisión por propiedad: el relleno dice abierto o
								// cerrado, el borde dice cuál se está editando. Dos clases de
								// borde en la misma lista dependerían del orden del CSS
								// generado, que no es algo que se pueda razonar.
								className={[
									'h-12 w-12 rounded-xl border-2 text-sm font-semibold transition-colors',
									dayOpen
										? 'bg-foreground text-background'
										: 'bg-card text-muted-foreground hover:border-foreground/40',
									isSelected
										? 'border-primary'
										: dayOpen
											? 'border-foreground'
											: 'border-border',
								].join(' ')}
							>
								{day.short}
							</button>
						);
					})}
				</div>
			</div>

			<div className="space-y-4 rounded-xl border border-border p-4">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-sm font-semibold">{selected.label}</p>
						<p className="text-xs text-muted-foreground">
							{open ? 'Abierto' : 'Cerrado'}
						</p>
					</div>
					<Switch
						checked={open}
						aria-label={`Abrir ${selected.label.toLowerCase()}`}
						onCheckedChange={(next) =>
							onChange(setDayOpen(value, selected.dayOfWeek, next === true))
						}
					/>
				</div>

				{open ? (
					<div className="space-y-3">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Abrís a las · Cerrás a las
						</p>

						{ranges.map((range, index) => (
							<div key={index} className="flex items-center gap-2">
								<Input
									type="time"
									aria-label={`Inicio de la franja ${index + 1}`}
									className="h-12 flex-1 text-center tabular-nums"
									value={range.startTime}
									onChange={(event) =>
										onChange(
											updateRange(value, selected.dayOfWeek, index, {
												startTime: event.target.value,
											}),
										)
									}
								/>
								<span className="text-sm text-muted-foreground">a</span>
								<Input
									type="time"
									aria-label={`Fin de la franja ${index + 1}`}
									className="h-12 flex-1 text-center tabular-nums"
									value={range.endTime}
									onChange={(event) =>
										onChange(
											updateRange(value, selected.dayOfWeek, index, {
												endTime: event.target.value,
											}),
										)
									}
								/>
								{/* La primera franja no se quita: sin ninguna, el día está
								    cerrado, y para eso está el interruptor. */}
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className={`h-12 w-10 p-0 ${index === 0 ? 'invisible' : ''}`}
									aria-label={`Quitar la franja ${index + 1}`}
									disabled={index === 0}
									onClick={() =>
										onChange(removeRange(value, selected.dayOfWeek, index))
									}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						))}

						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-9 px-2 text-xs"
							onClick={() => onChange(addRange(value, selected.dayOfWeek))}
						>
							<Plus className="mr-1 h-3.5 w-3.5" />
							Agregar franja
						</Button>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						No se toman reservas este día.
					</p>
				)}
			</div>

			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
};

export default HoursStep;
