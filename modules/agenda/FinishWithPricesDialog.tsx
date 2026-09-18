'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import axios from 'axios';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatDuration } from '@/lib/duration';
import {
	unpricedServicesOf,
	type FinishingBooking,
} from './utils/unpricedServices';
import useSetSegmentPrices from '@/services/appointments/useSetSegmentPrices';
import useUpdateAppointmentStatus from '@/services/appointments/useUpdateAppointmentStatus';

interface Props {
	/** La cita a finalizar, o `null` con el diálogo cerrado. */
	booking: FinishingBooking | null;
	onOpenChange: (open: boolean) => void;
	/** Se llama con la cita ya finalizada. */
	onFinished?: () => void;
}

/**
 * Finalizar una cita, pidiendo antes el precio que falte.
 *
 * Vive acá y no en cada pantalla porque hay tres puertas para finalizar —el menú
 * de la tarjeta en la agenda, el panel de la cita y la cola de citas sin cerrar—
 * y la pregunta tiene que aparecer en las tres. Con la condición escrita tres
 * veces, alcanzaba con agregar una cuarta puerta para perder el precio otra vez.
 *
 * La cita que ya tiene todos sus precios se finaliza directo: el diálogo sólo
 * aparece cuando hay algo que preguntar.
 */
export const useFinishWithPrices = (options?: {
	onFinished?: () => void;
	onError?: (message: string) => void;
}) => {
	const [booking, setBooking] = useState<FinishingBooking | null>(null);
	const {
		mutate: setStatus,
		isPending,
		variables,
	} = useUpdateAppointmentStatus();

	/*
	 * Los avisos se leen de una ref y no de la clausura para que `requestFinish`
	 * no cambie de identidad en cada render: la agenda memoiza sus columnas con
	 * esta función entre las dependencias, y una nueva en cada vuelta rehacía la
	 * grilla entera del día sin que hubiera cambiado nada.
	 */
	const optionsRef = useRef(options);
	useEffect(() => {
		optionsRef.current = options;
	});

	const requestFinish = useCallback(
		(candidate: FinishingBooking) => {
			if (unpricedServicesOf(candidate).length > 0) {
				setBooking(candidate);
				return;
			}

			setStatus(
				{ id: candidate.id, status: 'completed' },
				{
					onSuccess: () => optionsRef.current?.onFinished?.(),
					onError: () =>
						optionsRef.current?.onError?.(
							'No se pudo marcar como atendida. Intentá de nuevo.',
						),
				},
			);
		},
		// `setStatus` de react-query es estable; la ref no entra en dependencias.
		[setStatus],
	);

	return {
		requestFinish,
		/**
		 * La cita que se está finalizando sin pasar por el diálogo, o `null`.
		 *
		 * La agenda apaga las acciones de esa tarjeta mientras la petición viaja, y
		 * sin esto quedaban encendidas: el cambio de estado dejó de salir de la
		 * mutación de la pantalla y pasó a la de acá.
		 */
		finishingId: isPending ? (variables?.id ?? null) : null,
		/** Se derraman sobre `FinishWithPricesDialog`. */
		dialogProps: {
			booking,
			onOpenChange: (open: boolean) => {
				if (!open) setBooking(null);
			},
			onFinished: options?.onFinished,
		},
	};
};

/**
 * El precio que falta, pedido justo antes de finalizar la cita.
 *
 * Es el momento en que el negocio por fin lo sabe: los servicios que se cotizan
 * —una coloración, un tratamiento— no tienen precio de catálogo y el importe
 * aparece recién cuando se vio a la persona. Preguntarlo al reservar sería pedir
 * un dato que todavía no existe, y no preguntarlo nunca deja la cita fuera de la
 * facturación y de las comisiones para siempre.
 *
 * Sin precio no se finaliza: el botón queda apagado hasta que estén todos. Es la
 * única forma de escribirlo, así que una salida de emergencia acá no sería una
 * comodidad —sería la puerta por la que esa plata desaparece de los reportes para
 * siempre—. Quien todavía no sabe cuánto salió cierra el diálogo y deja la cita
 * como estaba: sigue abierta, y la cola de citas sin cerrar se la vuelve a
 * recordar.
 */
const FinishWithPricesDialog: React.FC<Props> = ({
	booking,
	onOpenChange,
	onFinished,
}) => (
	<Dialog open={booking !== null} onOpenChange={onOpenChange}>
		<DialogContent className="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>¿Cuánto salió?</DialogTitle>
				<DialogDescription>
					{booking?.clientName
						? `La cita de ${booking.clientName} tiene servicios que se cotizan. Poné el precio para que cuente en tus ingresos.`
						: 'Esta cita tiene servicios que se cotizan. Poné el precio para que cuente en tus ingresos.'}
				</DialogDescription>
			</DialogHeader>

			{/*
			 * El formulario se monta con el diálogo para que cerrarlo lo desmonte: así
			 * el borrador se limpia solo al reabrirlo, sin un efecto que lo resetee.
			 */}
			{booking && (
				<FinishForm
					booking={booking}
					onDone={() => onOpenChange(false)}
					onFinished={onFinished}
				/>
			)}
		</DialogContent>
	</Dialog>
);

const FinishForm: React.FC<{
	booking: FinishingBooking;
	onDone: () => void;
	onFinished?: () => void;
}> = ({ booking, onDone, onFinished }) => {
	const pending = unpricedServicesOf(booking);
	const [drafts, setDrafts] = useState<Record<string, string>>({});
	const [error, setError] = useState<string | null>(null);

	const setPrices = useSetSegmentPrices();
	const setStatus = useUpdateAppointmentStatus();
	const busy = setPrices.isPending || setStatus.isPending;

	/*
	 * Un importe escrito es un número que no es negativo. El campo vacío no se
	 * marca en rojo —no es un error, es lo que falta— y lo único que hace es dejar
	 * apagado el botón de finalizar.
	 */
	const priceOf = (serviceId: string): number | null => {
		const written = (drafts[serviceId] ?? '').trim();
		if (!written) return null;

		const parsed = Number(written);
		return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
	};

	const complete = pending.every(
		(segment) => priceOf(segment.serviceId) !== null,
	);

	const finish = async () => {
		setError(null);

		try {
			await setPrices.mutateAsync({
				id: booking.id,
				prices: pending.map((segment) => ({
					serviceId: segment.serviceId,
					price: priceOf(segment.serviceId),
				})),
			});

			/*
			 * El estado se cambia después del precio, y sólo si el precio se guardó.
			 * Al revés, un fallo al escribir el importe dejaba la cita finalizada y
			 * sin precio: el diálogo ya no vuelve a aparecer y el número se pierde.
			 */
			await setStatus.mutateAsync({ id: booking.id, status: 'completed' });

			onFinished?.();
			onDone();
		} catch (caught) {
			const message =
				axios.isAxiosError(caught) && typeof caught.response?.data === 'object'
					? ((caught.response?.data as { message?: string }).message ?? null)
					: null;

			setError(message ?? 'No se pudo finalizar. Intentá de nuevo.');
		}
	};

	return (
		<>
			<div className="space-y-3">
				{pending.map((segment) => (
					<PriceRow
						key={segment.serviceId}
						name={segment.serviceName ?? 'Servicio'}
						hint={[
							formatDuration(segment.durationMinutes),
							segment.staffName ?? null,
						]
							.filter(Boolean)
							.join(' · ')}
						currency={segment.currency}
						value={drafts[segment.serviceId] ?? ''}
						disabled={busy}
						onChange={(next) =>
							setDrafts((current) => ({
								...current,
								[segment.serviceId]: next,
							}))
						}
					/>
				))}
			</div>

			{error && (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			)}

			<DialogFooter className="gap-2">
				{/*
				 * Volver deja la cita como estaba —abierta, sin finalizar— y no es lo
				 * mismo que finalizarla sin precio: así sigue apareciendo en la cola de
				 * citas sin cerrar, que es lo que hace que alguien vuelva con el número.
				 */}
				<Button variant="outline" disabled={busy} onClick={onDone}>
					Volver
				</Button>

				<Button disabled={!complete || busy} onClick={() => void finish()}>
					{busy && <Spinner className="size-3.5" />}
					Guardar y finalizar
				</Button>
			</DialogFooter>
		</>
	);
};

const PriceRow: React.FC<{
	name: string;
	hint: string;
	currency: string;
	value: string;
	disabled: boolean;
	onChange: (value: string) => void;
}> = ({ name, hint, currency, value, disabled, onChange }) => {
	const id = useId();

	return (
		<div className="flex items-center justify-between gap-3">
			<Label htmlFor={id} className="min-w-0 flex-1 font-normal">
				<span className="min-w-0">
					<span className="block truncate font-medium">{name}</span>
					<span className="block text-xs text-muted-foreground">{hint}</span>
				</span>
			</Label>

			<div className="flex shrink-0 items-center gap-2">
				<Input
					id={id}
					type="number"
					min="0"
					step="1"
					inputMode="decimal"
					className="w-28 text-right"
					placeholder="0"
					autoComplete="off"
					value={value}
					disabled={disabled}
					onChange={(event) => onChange(event.target.value)}
				/>
				{/* El código y no el símbolo: es el dato que no se puede cambiar acá. */}
				<span className="w-9 shrink-0 text-xs text-muted-foreground">
					{currency}
				</span>
			</div>
		</div>
	);
};

export default FinishWithPricesDialog;
