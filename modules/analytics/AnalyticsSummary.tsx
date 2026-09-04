'use client';

import { formatMoney } from '@/lib/money';
import type { ReportSummary } from '@/types/reports.types';

interface Props {
	summary: ReportSummary;
	currency: string;
	/** El período que se está mirando, ya escrito. */
	rangeLabel: string | null;
}

/**
 * El titular del período.
 *
 * Antes eran cuatro tarjetas del mismo tamaño, y las cuatro competían por la
 * mirada. Lo que trae a alguien a esta pantalla es una sola pregunta —cuánto
 * facturé—, así que esa va grande y el resto la matiza: cuántas citas la
 * produjeron, cuánto dejó cada una, y qué se perdió por el camino.
 *
 * Las canceladas se destacan solo cuando las hay. Un cero en rojo permanente
 * enseña a ignorar el lugar donde después aparece un número que importa.
 */
const AnalyticsSummary: React.FC<Props> = ({
	summary,
	currency,
	rangeLabel,
}) => {
	const hasActivity = summary.completedCount > 0;

	return (
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
						<span className="font-medium text-foreground tabular-nums">
							{summary.completedCount}
						</span>{' '}
						{summary.completedCount === 1 ? 'cita atendida' : 'citas atendidas'}
					</span>
					<span aria-hidden="true">·</span>
					<span>
						<span className="font-medium text-foreground tabular-nums">
							{formatMoney(summary.averageTicket, currency)}
						</span>{' '}
						por cita
					</span>
					{summary.cancelledCount > 0 && (
						<>
							<span aria-hidden="true">·</span>
							<span className="text-warning">
								<span className="font-medium tabular-nums">
									{summary.cancelledCount}
								</span>{' '}
								{summary.cancelledCount === 1 ? 'cancelada' : 'canceladas'}
							</span>
						</>
					)}
				</p>
			) : (
				<p className="mt-2 text-sm text-muted-foreground">
					Todavía no hay citas atendidas en este período.
					{summary.pendingCount > 0 &&
						` Quedan ${summary.pendingCount} por atender.`}
				</p>
			)}

			{/*
			 * Por qué el total puede parecer bajo.
			 *
			 * Solo las citas atendidas facturan —ver `billedSegments` en el
			 * servidor—, así que una cita que quedó en pendiente vale cero acá y cero
			 * en la comisión de quien la hizo. Es el hueco que el dueño nota y no
			 * puede explicar, y decirlo al lado del número es lo que lo vuelve
			 * accionable.
			 *
			 * Dice "sin atender" y no "sin cerrar" porque el período puede incluir
			 * días que todavía no llegaron: esas citas no están sumadas y está bien
			 * que no lo estén.
			 */}
			{hasActivity && summary.pendingCount > 0 && (
				<p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
					{`${summary.pendingCount} ${summary.pendingCount === 1 ? 'cita' : 'citas'} del período ${summary.pendingCount === 1 ? 'sigue' : 'siguen'} sin atender, así que no ${summary.pendingCount === 1 ? 'está' : 'están'} sumada${summary.pendingCount === 1 ? '' : 's'} en este total ni en las comisiones.`}
				</p>
			)}
		</div>
	);
};

export default AnalyticsSummary;
