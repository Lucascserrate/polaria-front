'use client';

import { cn } from '@/lib/utils';
import type { ImportAnalysisApi } from '@/types/clients-import.types';

interface Props {
	analysis: ImportAnalysisApi;
	fileName: string;
}

/**
 * La cuenta que decide si se aprieta importar.
 *
 * Tres números y no uno: "1.250 contactos" no dice nada, "1.180 nuevos, 50 que
 * ya tenés y 20 que no se pueden traer" dice exactamente qué se gana y qué se
 * pierde. Es el resumen que el negocio mira antes de confirmar y el que después
 * explica por qué la lista quedó con menos de los que tenía el archivo.
 */
const ImportSummary: React.FC<Props> = ({ analysis, fileName }) => (
	<div>
		<p className="mb-3 text-sm text-muted-foreground">
			<span className="font-medium text-foreground">{fileName}</span> ·{' '}
			<span className="tabular-nums">{analysis.total}</span> contactos
		</p>

		<div className="grid grid-cols-3 gap-3">
			<Stat label="Nuevos" value={analysis.counts.toCreate} tone="success" />
			<Stat label="Ya existen" value={analysis.counts.existing} />
			<Stat
				label="Se omiten"
				value={analysis.counts.skipped}
				tone={analysis.counts.skipped > 0 ? 'warning' : undefined}
			/>
		</div>
	</div>
);

const Stat: React.FC<{
	label: string;
	value: number;
	tone?: 'success' | 'warning';
}> = ({ label, value, tone }) => (
	<div className="rounded-xl border border-border p-4">
		<p className="text-xs text-muted-foreground">{label}</p>
		<p
			className={cn(
				'mt-1 text-2xl font-bold tabular-nums',
				value === 0 && 'text-muted-foreground',
				value > 0 && tone === 'success' && 'text-success',
				value > 0 && tone === 'warning' && 'text-warning',
			)}
		>
			{value}
		</p>
	</div>
);

export default ImportSummary;
