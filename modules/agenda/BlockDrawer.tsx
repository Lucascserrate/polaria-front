'use client';

import { useState } from 'react';
import axios from 'axios';
import { Ban } from 'lucide-react';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import useCreateScheduleBlock from '@/services/schedule-blocks/useCreateScheduleBlock';
import useGetSettings from '@/services/settings/useGetSettings';
import useGetStaff from '@/services/staff/useGetStaff';
import { describeDay } from './utils/calendarLabels';
import { formatMinute, instantAtMinute } from './utils/calendarLayout';

/** Motivo corto: es una nota al margen, no el lugar donde contar la historia. */
const MAX_REASON_LENGTH = 140;

/** Lo que vale "todo el negocio" en el selector: `Select` no acepta `null`. */
const WHOLE_BUSINESS = 'all';

/**
 * Las duraciones que se ofrecen.
 *
 * Son las que alguien elige de verdad —un rato, media mañana, el día— y no una
 * escala parejita cada quince minutos: con una lista de cuarenta opciones,
 * elegir "dos horas" es buscar.
 */
const DURATIONS = [
	{ minutes: 15, label: '15 minutos' },
	{ minutes: 30, label: '30 minutos' },
	{ minutes: 60, label: '1 hora' },
	{ minutes: 90, label: '1 hora 30' },
	{ minutes: 120, label: '2 horas' },
	{ minutes: 240, label: '4 horas' },
	{ minutes: 480, label: '8 horas' },
] as const;

/**
 * De dónde salió el bloqueo: el hueco que se tocó en la agenda.
 *
 * Es la misma forma que `BookingSeed` y no se comparte el tipo a propósito:
 * significan cosas distintas —ahí es el punto de partida de una reserva, acá el
 * de una franja que se cierra— y el día que una necesite un campo más, no tiene
 * por qué aparecerle a la otra.
 */
export interface BlockSeed {
	/** `YYYY-MM-DD` en la zona del negocio. */
	date: string;
	minute: number;
	/** El profesional de la columna, o `null` si la columna era un día. */
	staffId: string | null;
}

interface Props {
	/** Ausente, el panel está cerrado. */
	seed: BlockSeed | null;
	onClose: () => void;
	/** Se llama cuando el bloqueo quedó guardado. */
	onSaved?: () => void;
}

const errorMessage = (cause: unknown, fallback: string): string =>
	axios.isAxiosError(cause) &&
	typeof (cause.response?.data as { message?: unknown } | undefined)
		?.message === 'string'
		? (cause.response?.data as { message: string }).message
		: fallback;

/**
 * Marcar un rato como no disponible.
 *
 * Es la otra cosa que puede significar tocar un hueco de la agenda, y por eso es
 * un panel aparte y no un modo del de reservas: no hay cliente, ni servicios, ni
 * precio. Lo único que hay que decir es hasta cuándo y, si se quiere, por qué.
 *
 * No impide nada de lo que ya está agendado: si a las 15:00 había tres turnos,
 * el bloqueo dice que no entren más, no que esos tres dejaron de existir.
 * Cancelarlos es una decisión aparte y se toma desde la agenda.
 */
const BlockDrawer: React.FC<Props> = ({ seed, onClose, onSaved }) => (
	<Drawer
		direction="right"
		open={Boolean(seed)}
		onOpenChange={(next) => {
			if (!next) onClose();
		}}
	>
		<DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
			{/*
			 * El formulario se monta con el hueco como clave, igual que el de
			 * reservas: lo que quedó a medio elegir pertenece a *ese* hueco y muere
			 * con él, sin limpiarlo a mano al cerrar ni al abrir otro.
			 */}
			{seed && (
				<BlockForm
					key={`${seed.date}:${seed.minute}:${seed.staffId ?? ''}`}
					seed={seed}
					onClose={onClose}
					onSaved={onSaved}
				/>
			)}
		</DrawerContent>
	</Drawer>
);

const BlockForm: React.FC<{
	seed: BlockSeed;
	onClose: () => void;
	onSaved?: () => void;
}> = ({ seed, onClose, onSaved }) => {
	const { data: settings } = useGetSettings();
	const { data: staff = [] } = useGetStaff();
	const { mutateAsync: create, isPending } = useCreateScheduleBlock();

	const [durationMinutes, setDurationMinutes] = useState(60);
	const [staffId, setStaffId] = useState<string | null>(seed.staffId);
	const [reason, setReason] = useState('');
	const [error, setError] = useState<string | null>(null);

	const timezone = settings?.timezone;

	/*
	 * Quiénes se pueden elegir: sólo los que atienden.
	 *
	 * Un administrativo no tiene agenda que cerrar, así que ofrecerlo sería una
	 * opción que no cambia nada. El backend valida igual que el profesional exista
	 * en este negocio.
	 */
	const eligible = staff.filter(
		(member) => member.isActive && member.providesServices,
	);

	const endMinute = seed.minute + durationMinutes;

	const handleSave = async () => {
		setError(null);

		try {
			await create({
				startTime: instantAtMinute(seed.date, seed.minute, timezone),
				durationMinutes,
				staffId,
				reason: reason.trim() || null,
			});

			onSaved?.();
			onClose();
		} catch (cause) {
			setError(
				errorMessage(cause, 'No se pudo guardar el horario no disponible.'),
			);
		}
	};

	return (
		<div className="flex h-full flex-col">
			<DrawerHeader className="border-b border-border text-left">
				<DrawerTitle className="flex items-center gap-2">
					<Ban className="size-4 text-muted-foreground" />
					Horario no disponible
				</DrawerTitle>
				<DrawerDescription>
					Ese rato deja de ofrecerse para reservas nuevas. Las citas que ya
					estaban siguen en la agenda.
				</DrawerDescription>
			</DrawerHeader>

			<div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
				{/*
				 * Cuándo se lee, no se edita: salió del hueco que se tocó. Para
				 * cambiarlo se cierra y se toca otro, que es un gesto más corto que
				 * corregir dos campos.
				 */}
				<div className="space-y-1">
					<Label>Cuándo</Label>
					<p className="text-sm font-medium">{describeDay(seed.date)}</p>
					<p className="font-mono text-sm tabular-nums text-muted-foreground">
						{`${formatMinute(seed.minute)} – ${formatMinute(endMinute)}`}
						{/* Pasada la medianoche conviene decirlo: la hora sola miente. */}
						{endMinute >= 24 * 60 && (
							<span className="ml-2 font-sans text-xs">del día siguiente</span>
						)}
					</p>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="block-duration">Cuánto dura</Label>
					<Select
						value={String(durationMinutes)}
						onValueChange={(value) => setDurationMinutes(Number(value))}
					>
						<SelectTrigger id="block-duration">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{DURATIONS.map((option) => (
								<SelectItem key={option.minutes} value={String(option.minutes)}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="block-staff">A quién</Label>
					<Select
						value={staffId ?? WHOLE_BUSINESS}
						onValueChange={(value) =>
							setStaffId(value === WHOLE_BUSINESS ? null : value)
						}
					>
						<SelectTrigger id="block-staff">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{/*
							 * "Todo el negocio" primero y como opción real, no como el vacío
							 * de la lista: cerrar el local un rato es tan común como que
							 * falte una persona, y desde la vista semanal es lo único que se
							 * puede querer decir —ahí la columna es un día, no alguien—.
							 */}
							<SelectItem value={WHOLE_BUSINESS}>Todo el negocio</SelectItem>
							{eligible.map((member) => (
								<SelectItem key={member.id} value={member.id}>
									{member.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-xs text-muted-foreground">
						{staffId
							? 'Los demás siguen recibiendo reservas en ese horario.'
							: 'Nadie recibe reservas en ese horario.'}
					</p>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="block-reason">Motivo</Label>
					<Input
						id="block-reason"
						value={reason}
						placeholder="Turno médico"
						maxLength={MAX_REASON_LENGTH}
						onChange={(event) => setReason(event.target.value)}
					/>
					<div className="flex items-start justify-between gap-3">
						<p className="text-xs text-muted-foreground">
							Opcional. Se ve solo acá: tus clientes ven menos horarios, nunca
							el motivo.
						</p>
						<span
							className={cn(
								'shrink-0 font-mono text-xs tabular-nums',
								reason.length >= MAX_REASON_LENGTH
									? 'text-warning'
									: 'text-muted-foreground',
							)}
						>
							{`${reason.length} / ${MAX_REASON_LENGTH}`}
						</span>
					</div>
				</div>

				{error && (
					<p
						role="alert"
						className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive"
					>
						{error}
					</p>
				)}
			</div>

			<footer className="flex justify-end gap-2 border-t border-border p-4">
				<Button variant="ghost" disabled={isPending} onClick={onClose}>
					Cancelar
				</Button>
				<Button
					size="lg"
					disabled={isPending || !timezone}
					onClick={() => void handleSave()}
				>
					{isPending && <Spinner className="size-3.5" />}
					Guardar
				</Button>
			</footer>
		</div>
	);
};

export default BlockDrawer;
