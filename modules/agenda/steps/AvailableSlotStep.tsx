'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { BookingSlot } from '@/services/availability/bookingSlots.service';

interface Props {
	slots: BookingSlot[];
	selectedStart: string | null;
	onSelect: (startTime: string) => void;
	isLoading: boolean;
	isError: boolean;
	/** Aviso sobre la selección, cuando hay algo que aclarar antes de elegir. */
	notice?: string;
}

const formatSlot = (iso: string) =>
	new Intl.DateTimeFormat('es', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(new Date(iso));

/**
 * Horarios que se pueden reservar, tal como los devuelve el motor que también
 * usa WhatsApp.
 *
 * Vive en `agenda` y no en el wizard compartido a propósito: la pregunta que
 * responde —"¿qué queda libre de acá en adelante?"— es la de una reserva. Un
 * registro histórico no consulta disponibilidad, así que va a necesitar su
 * propio paso en lugar de un modo dentro de este.
 */
const AvailableSlotStep: React.FC<Props> = ({
	slots,
	selectedStart,
	onSelect,
	isLoading,
	isError,
	notice,
}) => {
	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Spinner />
			</div>
		);
	}

	if (isError) {
		return (
			<p className="text-sm text-red-600">
				No se pudieron cargar los horarios. Intenta de nuevo.
			</p>
		);
	}

	if (slots.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No quedan horarios disponibles para ese servicio con ese profesional en
				esta fecha. Probá con otro profesional o con otro día.
			</p>
		);
	}

	return (
		<div className="space-y-3">
			{notice && (
				<p className="rounded-md border border-amber-500/50 bg-amber-500/10 p-2 text-xs">
					{notice}
				</p>
			)}

			<div className="grid grid-cols-4 gap-2">
				{slots.map((slot) => (
					<Button
						key={slot.startTime}
						type="button"
						size="sm"
						variant={slot.startTime === selectedStart ? 'default' : 'outline'}
						className="tabular-nums"
						onClick={() => onSelect(slot.startTime)}
					>
						{formatSlot(slot.startTime)}
					</Button>
				))}
			</div>
		</div>
	);
};

export default AvailableSlotStep;
