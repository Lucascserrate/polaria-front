'use client';

import { formatMoney } from '@/lib/money';
import type { StaffSummary } from '@/types/reports.types';
import InfoHint from './InfoHint';

interface Props {
	summary: StaffSummary;
	currency: string;
}

/**
 * De qué estuvo hecho el período, en una sola tira.
 *
 * Eran cuatro tarjetas, que en una pantalla ancha se leían bien y en un teléfono
 * se convertían en cuatro bloques apilados: había que scrollear cuatro veces para
 * enterarse de cuatro números de dos dígitos. Son cifras cortas y comparables
 * entre sí, así que van juntas y en horizontal; ninguna necesita una caja propia.
 *
 * Quedaron tres, y la selección no es por tamaño sino por uso. **Citas** y
 * **personas** son dos números distintos a propósito: cuatro citas pueden ser
 * cuatro personas o dos que volvieron, y esa diferencia es la jornada. **Por
 * cita** es lo único que se sostiene solo cuando cambia el período, porque no
 * crece con los días que uno mire.
 *
 * Se fueron dos. "Servicios realizados" decía lo mismo que el ranking de abajo,
 * que además lo desglosa. "Por atender" cambiaba de significado con el selector
 * —con el mes elegido contaba el futuro del mes— y donde sí servía, que es hoy,
 * no era una estadística sino la agenda.
 *
 * Las canceladas son una línea que aparece solo cuando las hay. Un cero fijo en
 * rojo enseña a ignorar el lugar donde después aparece un número que importa.
 */
const MyWorkSummary: React.FC<Props> = ({ summary, currency }) => {
	if (summary.completedCount === 0) {
		return (
			<p className="rounded-xl border border-border px-4 py-6 text-center text-sm text-muted-foreground">
				Todavía no hay citas atendidas en este período.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
				<Metric label="Citas" value={String(summary.completedCount)} />

				<Metric
					label="Personas"
					value={String(summary.clientsServed)}
					hint="Personas distintas. Quien volvió dos veces en el período cuenta una sola, así que este número puede ser menor que el de citas."
				/>

				<Metric
					label="Por cita"
					value={formatMoney(summary.averageTicket, currency)}
				/>
			</div>

			{summary.cancelledCount > 0 && (
				<p className="px-1 text-xs text-muted-foreground">
					<span className="font-medium text-foreground tabular-nums">
						{summary.cancelledCount}
					</span>{' '}
					{summary.cancelledCount === 1
						? 'cita cancelada'
						: 'citas canceladas'}{' '}
					en este período.
				</p>
			)}
		</div>
	);
};

interface MetricProps {
	label: string;
	/** Ya escrito: puede ser un conteo o un monto con su moneda. */
	value: string;
	hint?: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, hint }) => (
	<div className="px-2 py-4 text-center">
		<p className="flex items-center justify-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
			{label}
			{hint && (
				<InfoHint label={`Qué cuenta ${label}`} className="-my-1 ml-0.5">
					{hint}
				</InfoHint>
			)}
		</p>
		<p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
			{value}
		</p>
	</div>
);

export default MyWorkSummary;
