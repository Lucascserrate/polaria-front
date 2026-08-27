'use client';

import { formatMoney } from '@/lib/money';
import type { StaffReport } from '@/types/reports.types';

interface Props {
	summary: StaffReport['summary'];
	currency: string;
	/** El período que se está mirando, ya escrito. */
	rangeLabel: string | null;
}

/**
 * El trabajo del período: cuánto se facturó y de qué salió.
 *
 * La facturación va grande porque es el titular, igual que en las analíticas del
 * negocio. Lo que cambia es lo que la matiza: acá no interesa el ticket promedio
 * del local sino **cuánta gente atendió** y **cuántos servicios prestó**, que es
 * cómo alguien mide su propia jornada.
 *
 * Clientes y servicios son dos números distintos a propósito. Cuatro servicios
 * pueden ser cuatro personas o dos que pidieron corte y barba, y esa diferencia es
 * la jornada.
 *
 * Las canceladas se destacan solo cuando las hay: un cero en rojo permanente enseña
 * a ignorar el lugar donde después aparece un número que importa.
 */
const MyWorkSummary: React.FC<Props> = ({ summary, currency, rangeLabel }) => {
	const hasActivity = summary.completedCount > 0;

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-border bg-card p-6">
				<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
					Facturado{rangeLabel ? ` · ${rangeLabel}` : ''}
				</p>

				<p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
					{formatMoney(summary.revenueTotal, currency)}
				</p>

				{hasActivity ? (
					<p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
						<span>
							<Strong>{summary.completedCount}</Strong>{' '}
							{summary.completedCount === 1
								? 'cita atendida'
								: 'citas atendidas'}
						</span>
						<Dot />
						<span>
							<Strong>{formatMoney(summary.averageTicket, currency)}</Strong>{' '}
							por cita
						</span>
					</p>
				) : (
					<p className="mt-2 text-sm text-muted-foreground">
						Todavía no hay citas atendidas en este período.
					</p>
				)}
			</div>

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
		</div>
	);
};

const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<span className="font-medium text-foreground tabular-nums">{children}</span>
);

const Dot = () => <span aria-hidden="true">·</span>;

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
