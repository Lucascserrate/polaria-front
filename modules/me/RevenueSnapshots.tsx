'use client';

import { formatMoney } from '@/lib/money';
import type { StaffReport } from '@/types/reports.types';

interface Props {
	snapshots: StaffReport['revenueSnapshots'];
	currency: string;
}

/**
 * Lo facturado hoy, esta semana y este mes.
 *
 * No dependen del selector de período, y eso es lo que las hace útiles: responden
 * la pregunta con la que alguien abre esta pantalla —"cómo vengo"— sin obligarlo a
 * cambiar el período tres veces para verlo. Lo que sigue abajo, en cambio, sí mira
 * el período elegido.
 *
 * El día va primero y más grande porque es el que se consulta a media jornada; los
 * otros dos dan el contexto.
 */
const RevenueSnapshots: React.FC<Props> = ({ snapshots, currency }) => (
	<div className="grid gap-3 sm:grid-cols-3">
		<Snapshot
			label="Hoy"
			value={snapshots.today}
			currency={currency}
			emphasis
		/>
		<Snapshot label="Esta semana" value={snapshots.week} currency={currency} />
		<Snapshot label="Este mes" value={snapshots.month} currency={currency} />
	</div>
);

interface SnapshotProps {
	label: string;
	value: number;
	currency: string;
	emphasis?: boolean;
}

const Snapshot: React.FC<SnapshotProps> = ({
	label,
	value,
	currency,
	emphasis = false,
}) => (
	<div
		className={
			emphasis
				? 'rounded-xl border border-border bg-card p-5'
				: 'rounded-xl border border-border p-5'
		}
	>
		<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
			{label}
		</p>
		<p
			className={
				emphasis
					? 'mt-1 text-3xl font-bold tracking-tight tabular-nums'
					: 'mt-1 text-2xl font-semibold tracking-tight tabular-nums'
			}
		>
			{formatMoney(value, currency)}
		</p>
	</div>
);

export default RevenueSnapshots;
