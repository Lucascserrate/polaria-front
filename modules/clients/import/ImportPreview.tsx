'use client';

import { useMemo, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
	ImportAnalysisApi,
	ImportRowApi,
	ImportRowStatus,
} from '@/types/clients-import.types';
import { formatClientPhone } from '../utils/phone';
import { rowLabel } from './importLabels';

interface Props {
	analysis: ImportAnalysisApi;
	fillMissing: boolean;
	/** Mientras se recalcula el análisis, lo que se ve es la respuesta anterior. */
	stale?: boolean;
}

/**
 * Cuántas filas se dibujan por filtro.
 *
 * Mil doscientas filas en el DOM hacen que la pantalla tarde en aparecer, y
 * nadie las lee: lo que se revisa son los contadores y un puñado de ejemplos de
 * cada grupo. El resto se anuncia con su cuenta en lugar de dibujarse.
 */
const VISIBLE_ROWS = 100;

type Filter = 'all' | ImportRowStatus;

const FILTERS: { value: Filter; label: string }[] = [
	{ value: 'all', label: 'Todos' },
	{ value: 'new', label: 'Nuevos' },
	{ value: 'existing', label: 'Ya existen' },
	{ value: 'skipped', label: 'Omitidos' },
];

/**
 * Qué va a pasar con cada contacto, antes de que pase.
 *
 * Es la pantalla entera de este flujo: importar mil fichas es irreversible en la
 * práctica —nadie las va a borrar a mano— así que la decisión se toma mirando
 * esto y no después. Por eso el teléfono se muestra **ya normalizado**: es la
 * única oportunidad de ver que un número quedó mal antes de que quede mal en
 * mil fichas.
 */
const ImportPreview: React.FC<Props> = ({ analysis, fillMissing, stale }) => {
	const [filter, setFilter] = useState<Filter>('all');

	const counts = useMemo(
		() => ({
			all: analysis.total,
			new: analysis.counts.toCreate,
			existing: analysis.counts.existing,
			skipped: analysis.counts.skipped,
		}),
		[analysis],
	);

	const rows = useMemo(
		() =>
			filter === 'all'
				? analysis.rows
				: analysis.rows.filter((row) => row.status === filter),
		[analysis, filter],
	);

	const shown = rows.slice(0, VISIBLE_ROWS);

	return (
		<div className={cn('space-y-3', stale && 'opacity-60')}>
			<div className="flex flex-wrap gap-2">
				{FILTERS.map(({ value, label }) => (
					<button
						key={value}
						type="button"
						onClick={() => setFilter(value)}
						className={cn(
							'rounded-full border px-3 py-1 text-sm transition-colors',
							filter === value
								? 'border-transparent bg-foreground text-background'
								: 'border-border text-muted-foreground hover:text-foreground',
						)}
					>
						{label}
						<span className="ml-1.5 tabular-nums">{counts[value]}</span>
					</button>
				))}
			</div>

			{rows.length === 0 ? (
				<p className="rounded-xl border border-border py-10 text-center text-sm text-muted-foreground">
					No hay contactos en este grupo.
				</p>
			) : (
				<>
					{/* Escritorio */}
					<div className="hidden overflow-hidden rounded-xl border border-border md:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12 text-right">#</TableHead>
									<TableHead>Nombre</TableHead>
									<TableHead>Teléfono</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Estado</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{shown.map((row) => (
									<TableRow key={row.row}>
										<TableCell className="text-right text-xs tabular-nums text-muted-foreground">
											{row.row}
										</TableCell>
										<TableCell className="font-medium">
											{row.name ?? (
												<span className="font-normal text-muted-foreground">
													Sin nombre
												</span>
											)}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											<Phone row={row} dialCode={analysis.dialCode} />
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{row.email ?? '—'}
										</TableCell>
										<TableCell>
											<Status row={row} fillMissing={fillMissing} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Móvil */}
					<ul className="space-y-2 md:hidden">
						{shown.map((row) => (
							<li
								key={row.row}
								className="rounded-xl border border-border p-3 text-sm"
							>
								<p className="font-medium">
									{row.name ?? (
										<span className="font-normal text-muted-foreground">
											Sin nombre
										</span>
									)}
								</p>
								<p className="mt-0.5 text-muted-foreground">
									<Phone row={row} dialCode={analysis.dialCode} />
								</p>
								<p className="mt-2">
									<Status row={row} fillMissing={fillMissing} />
								</p>
							</li>
						))}
					</ul>

					{rows.length > shown.length && (
						<p className="text-center text-sm text-muted-foreground">
							Se muestran los primeros {shown.length}. Hay{' '}
							<span className="font-medium tabular-nums">
								{rows.length - shown.length}
							</span>{' '}
							contactos más en este grupo.
						</p>
					)}
				</>
			)}
		</div>
	);
};

/**
 * El teléfono como va a quedar guardado.
 *
 * Salvo cuando no se pudo leer: ahí se muestra tal cual vino del archivo, sin
 * formato, porque lo que hace falta es reconocerlo para ir a arreglarlo.
 */
const Phone: React.FC<{ row: ImportRowApi; dialCode: string }> = ({
	row,
	dialCode,
}) => {
	if (!row.phone) return <span>Sin teléfono</span>;

	if (row.reason === 'invalid_phone') {
		return <span className="text-warning">{row.phone}</span>;
	}

	return (
		<span className="tabular-nums">
			{formatClientPhone(row.phone, dialCode)}
		</span>
	);
};

/** El estado, con el color que le corresponde a lo que va a pasar. */
const Status: React.FC<{ row: ImportRowApi; fillMissing: boolean }> = ({
	row,
	fillMissing,
}) => (
	<span
		className={cn(
			'inline-block rounded-full px-2 py-0.5 text-xs',
			row.status === 'new' && 'bg-success/10 text-success',
			row.status === 'existing' && 'bg-muted text-muted-foreground',
			row.status === 'skipped' && 'bg-warning/10 text-warning',
		)}
	>
		{rowLabel(row, fillMissing)}
	</span>
);

export default ImportPreview;
