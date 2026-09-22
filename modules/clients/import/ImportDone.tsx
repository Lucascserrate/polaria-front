'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type {
	ImportResultApi,
	ImportSkipReason,
} from '@/types/clients-import.types';
import { SKIP_REASONS } from './importLabels';

interface Props {
	result: ImportResultApi;
	onRestart: () => void;
}

/**
 * Qué pasó, con el mismo detalle con el que se había anunciado.
 *
 * Los omitidos se agrupan por motivo en lugar de quedar en un número suelto:
 * "20 con errores" no se puede accionar, y "18 sin teléfono, 2 repetidos" sí —el
 * primero se arregla en la agenda del teléfono y el segundo no se arregla porque
 * no está roto—.
 */
const ImportDone: React.FC<Props> = ({ result, onRestart }) => {
	const reasons = groupReasons(result);

	return (
		<div className="mx-auto max-w-lg py-8 text-center">
			<span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
				<Check aria-hidden className="size-6 text-success" />
			</span>

			<h2 className="text-xl font-bold">
				{result.created > 0
					? `Se importaron ${result.created} clientes`
					: 'No hizo falta importar nada'}
			</h2>

			<p className="mt-2 text-muted-foreground">
				{result.created > 0
					? 'Ya están en tu lista y los vas a reconocer cuando escriban por WhatsApp.'
					: 'Todos los contactos del archivo ya estaban en tu lista o no se pudieron traer.'}
			</p>

			<dl className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border text-left">
				<Row label="Contactos en el archivo" value={result.total} />
				<Row label="Fichas creadas" value={result.created} />
				{result.completed > 0 && (
					<Row
						label="Clientes a los que se les completaron datos"
						value={result.completed}
					/>
				)}
				<Row label="Ya estaban en tu lista" value={result.counts.existing} />

				{reasons.map(([reason, count]) => (
					<Row key={reason} label={SKIP_REASONS[reason]} value={count} muted />
				))}
			</dl>

			<div className="mt-6 flex flex-wrap justify-center gap-2">
				<Button asChild>
					<Link href={ROUTES.clients}>Ver mis clientes</Link>
				</Button>
				<Button variant="outline" onClick={onRestart}>
					Importar otro archivo
				</Button>
			</div>
		</div>
	);
};

/** Cuántos se omitieron por cada motivo, de mayor a menor. */
const groupReasons = (
	result: ImportResultApi,
): [ImportSkipReason, number][] => {
	const counts = new Map<ImportSkipReason, number>();

	result.rows.forEach((row) => {
		if (row.status !== 'skipped' || !row.reason) return;
		counts.set(row.reason, (counts.get(row.reason) ?? 0) + 1);
	});

	return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};

const Row: React.FC<{ label: string; value: number; muted?: boolean }> = ({
	label,
	value,
	muted,
}) => (
	<div className="flex items-baseline justify-between gap-4 px-4 py-3">
		<dt className={`text-sm ${muted ? 'text-muted-foreground' : ''}`}>
			{label}
		</dt>
		<dd className="text-sm font-medium tabular-nums">{value}</dd>
	</div>
);

export default ImportDone;
