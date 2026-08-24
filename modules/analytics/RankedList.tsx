'use client';

import { cn } from '@/lib/utils';
import { shareOfMax } from './utils/ranking';

export interface RankedRow {
	id: string;
	label: string;
	/** Lo que ordena y dibuja la barra: la facturación. */
	value: number;
	/** El valor ya escrito, con su moneda. */
	valueLabel: string;
	/** Segunda línea: qué produjo ese número. */
	meta: string;
	/** Marca al costado del nombre, como un profesional dado de baja. */
	badge?: React.ReactNode;
}

interface Props {
	rows: RankedRow[];
	/** Qué decir cuando no hay nada que rankear. */
	emptyMessage: string;
}

/**
 * Un ranking con barras.
 *
 * Reemplaza a las tablas que había antes. Una tabla comunica bien los números
 * exactos pero obliga a compararlos de memoria: para saber si Diego factura el
 * doble que Carlos hay que leer dos cifras y dividir. La barra responde eso de un
 * vistazo y el número sigue estando al lado, así que no se pierde precisión.
 *
 * No es un gráfico aparte a propósito: un gráfico de barras al lado de la tabla
 * mostraría lo mismo dos veces y obligaría a mirar en dos lugares.
 */
const RankedList: React.FC<Props> = ({ rows, emptyMessage }) => {
	if (rows.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				{emptyMessage}
			</p>
		);
	}

	const max = rows.reduce((top, row) => Math.max(top, row.value), 0);

	return (
		<ul className="space-y-4">
			{rows.map((row, index) => (
				<li key={row.id} className="space-y-1.5">
					<div className="flex items-baseline justify-between gap-3">
						<span className="flex min-w-0 items-center gap-2">
							<span className="truncate text-sm font-medium">{row.label}</span>
							{row.badge}
						</span>
						<span className="shrink-0 text-sm font-semibold tabular-nums">
							{row.valueLabel}
						</span>
					</div>

					<div
						className="h-1.5 overflow-hidden rounded-full bg-muted"
						aria-hidden="true"
					>
						<div
							className={cn(
								'h-full rounded-full transition-all',
								// El primero se destaca: es la respuesta a "quién puntea".
								index === 0 ? 'bg-foreground' : 'bg-foreground/40',
							)}
							style={{ width: `${shareOfMax(row.value, max) * 100}%` }}
						/>
					</div>

					<p className="text-xs text-muted-foreground">{row.meta}</p>
				</li>
			))}
		</ul>
	);
};

export default RankedList;
