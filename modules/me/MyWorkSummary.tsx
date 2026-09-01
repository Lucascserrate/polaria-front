'use client';

import type { StaffSummary } from '@/types/reports.types';

interface Props {
	summary: StaffSummary;
}

/**
 * De qué estuvo hecho el período, debajo del titular.
 *
 * Lo facturado, el promedio por cita y la cantidad de citas se mudaron a
 * `EarningsHeadline`: son el número con el que se abre la pantalla y su contexto
 * inmediato. Acá queda lo que matiza esa jornada y no compite con ella.
 *
 * Clientes y servicios son dos números distintos a propósito. Cuatro servicios
 * pueden ser cuatro personas o dos que pidieron corte y barba, y esa diferencia
 * es la jornada.
 *
 * Las canceladas se destacan solo cuando las hay: un cero en rojo permanente
 * enseña a ignorar el lugar donde después aparece un número que importa.
 */
const MyWorkSummary: React.FC<Props> = ({ summary }) => (
	<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		<Metric
			label="Clientes atendidos"
			value={summary.clientsServed}
			hint="Personas distintas. Quien volvió dos veces cuenta una."
		/>
		<Metric
			label="Servicios realizados"
			value={summary.servicesPerformed}
			hint="Cada servicio cuenta, aunque dos sean de la misma cita."
		/>
		<Metric
			label="Por atender"
			value={summary.pendingCount}
			hint="Citas tuyas que siguen abiertas."
		/>
		<Metric
			label="Canceladas"
			value={summary.cancelledCount}
			tone={summary.cancelledCount > 0 ? 'warn' : 'neutral'}
		/>
	</div>
);

interface MetricProps {
	label: string;
	value: number;
	hint?: string;
	tone?: 'neutral' | 'warn';
}

const Metric: React.FC<MetricProps> = ({
	label,
	value,
	hint,
	tone = 'neutral',
}) => (
	<div className="rounded-xl border border-border p-4">
		<p className="text-xs text-muted-foreground">{label}</p>
		<p
			className={
				tone === 'warn'
					? 'mt-1 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-500'
					: 'mt-1 text-2xl font-bold tabular-nums'
			}
		>
			{value}
		</p>
		{hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
	</div>
);

export default MyWorkSummary;
