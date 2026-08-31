'use client';

import { Spinner } from '@/components/ui/spinner';
import type { ClientApi } from '@/types/appointments.types';
import useGetClientSummary from '@/services/clients/useGetClientSummary';
import { SOURCE_LABELS } from '../utils/phone';

interface Props {
	client: ClientApi;
}

/** Día y hora en la zona del navegador, que es donde está quien mira el panel. */
const formatMoment = (iso: string | null) =>
	iso
		? new Intl.DateTimeFormat('es-BO', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			}).format(new Date(iso))
		: null;

/**
 * Lo que el negocio quiere saber de un cliente antes de atenderlo.
 *
 * No hay ningún importe, a diferencia de las referencias. Lo que la base guarda
 * es `priceAtBooking` —lo pactado al reservar— y sin un módulo de pagos que diga
 * qué se cobró, un "total gastado" sería un número que el negocio nunca vio
 * entrar. Cuando exista la caja, el número puede ser verdad; antes, no.
 */
const ClientSummaryPanel: React.FC<Props> = ({ client }) => {
	const { data: summary, isLoading } = useGetClientSummary(client.id);

	if (isLoading || !summary) {
		return (
			<div className="flex justify-center py-12">
				<Spinner className="size-5" />
			</div>
		);
	}

	const next = formatMoment(summary.nextAppointmentAt);
	const last = formatMoment(summary.lastAppointmentAt);

	/*
	 * Lo que queda sin resolver: reservado o confirmado, ni atendido ni cancelado.
	 * Se deriva en vez de pedirlo porque es exactamente el resto de la cuenta, y
	 * un cuarto campo en la respuesta podría contradecir a los otros tres.
	 */
	const pending =
		summary.totalAppointments -
		summary.completedAppointments -
		summary.cancelledAppointments;

	return (
		<div className="space-y-6">
			<section>
				<h3 className="mb-3 text-sm font-semibold">Citas</h3>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<Stat label="Total" value={summary.totalAppointments} />
					<Stat label="Atendidas" value={summary.completedAppointments} />
					{/*
					 * Las pendientes se muestran aunque no vengan del backend: sin
					 * ellas, un cliente con una cita vieja que el negocio nunca marcó
					 * como atendida leía "Total 1 · Atendidas 0 · Canceladas 0" y esa
					 * cita quedaba sin explicación en pantalla.
					 */}
					<Stat
						label="Pendientes"
						value={pending}
						muted={pending === 0}
					/>
					<Stat
						label="Canceladas"
						value={summary.cancelledAppointments}
						muted={summary.cancelledAppointments === 0}
					/>
				</div>
			</section>

			<section>
				<h3 className="mb-3 text-sm font-semibold">Cuándo</h3>
				<dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
					<Row
						label="Próxima cita"
						value={next ?? 'No tiene ninguna reservada'}
						strong={!!next}
					/>
					<Row
						label="Última visita"
						// "Todavía no vino" y "no tiene turno" son cosas distintas, y la
						// diferencia es la que decide si el negocio lo trata como cliente
						// nuevo.
						value={last ?? 'Todavía no vino'}
					/>
				</dl>
			</section>

			<section>
				<h3 className="mb-3 text-sm font-semibold">Origen</h3>
				<dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
					<Row
						label="Llegó por"
						value={
							client.createdVia
								? SOURCE_LABELS[client.createdVia]
								: 'Sin registrar'
						}
					/>
					<Row
						label="Cliente desde"
						value={
							new Intl.DateTimeFormat('es-BO', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							}).format(new Date(client.createdAt))
						}
					/>
				</dl>
			</section>
		</div>
	);
};

const Stat: React.FC<{ label: string; value: number; muted?: boolean }> = ({
	label,
	value,
	muted,
}) => (
	<div className="rounded-xl border border-border p-4">
		<p className="text-xs text-muted-foreground">{label}</p>
		<p
			className={`mt-1 text-2xl font-bold tabular-nums ${muted ? 'text-muted-foreground' : ''}`}
		>
			{value}
		</p>
	</div>
);

const Row: React.FC<{ label: string; value: string; strong?: boolean }> = ({
	label,
	value,
	strong,
}) => (
	<div className="flex items-baseline justify-between gap-4 px-4 py-3">
		<dt className="text-sm text-muted-foreground">{label}</dt>
		<dd className={`text-right text-sm ${strong ? 'font-medium' : ''}`}>
			{value}
		</dd>
	</div>
);

export default ClientSummaryPanel;
