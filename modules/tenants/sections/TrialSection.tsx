'use client';

import { useState } from 'react';
import { CalendarPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { TrialSummary } from '@/types/tenant.types';
import SectionHeader from '../SectionHeader';

interface Props {
	trial: TrialSummary | null;
	loading: boolean;
	pending: boolean;
	error: string | null;
	/** Devuelve si se aplicó: con `false` la selección se mantiene para reintentar. */
	onExtend: (days: number) => Promise<boolean>;
}

/**
 * Cómo se nombra cada estado y de qué color se lee.
 *
 * Se traduce acá y no en el backend: qué estado tiene el negocio lo decide una
 * regla del producto, cómo se dice en una pantalla interna es del panel. El
 * mapa es total sobre `SubscriptionState`, con una salida por si el backend
 * gana un estado antes que esta pantalla.
 */
const STATES: Record<string, { label: string; tone: string }> = {
	NOT_STARTED: { label: 'Sin iniciar', tone: 'text-muted-foreground' },
	TRIAL_ACTIVE: { label: 'Prueba en curso', tone: 'text-green-600' },
	TRIAL_EXPIRED: { label: 'Prueba vencida', tone: 'text-amber-600' },
	ACTIVE: { label: 'Suscripción paga', tone: 'text-green-600' },
	EXPIRED: { label: 'Suscripción vencida', tone: 'text-red-600' },
	CANCELED: { label: 'Cancelada', tone: 'text-red-600' },
};

const dateFormatter = new Intl.DateTimeFormat('es', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

/** `9 de septiembre de 2026`. La hora no importa: la prueba se cuenta en días. */
const formatDay = (iso: string): string => dateFormatter.format(new Date(iso));

/**
 * La prueba gratuita de un negocio, y el botón para estirarla.
 *
 * Extender se confirma en dos pasos —elegir el tamaño, después aplicar— y no en
 * uno. No es fricción por las dudas: la operación suma días cada vez que se
 * ejecuta, así que un clic de más regala una semana de producto y no hay forma
 * de deshacerlo desde esta pantalla.
 *
 * Nada de acá pasa por el borrador del editor. La prueba no es un campo que se
 * guarda con el resto de la ficha: es una acción que ocurre en el momento, como
 * conectar WhatsApp.
 */
const TrialSection: React.FC<Props> = ({
	trial,
	loading,
	pending,
	error,
	onExtend,
}) => {
	const [selected, setSelected] = useState<number | null>(null);
	const [extended, setExtended] = useState(false);

	/**
	 * Aplica y suelta la selección.
	 *
	 * Sólo si salió bien: con un error, lo elegido se queda donde estaba para que
	 * reintentar sea apretar de nuevo y no volver a armar la decisión.
	 */
	const apply = async (days: number) => {
		if (await onExtend(days)) {
			setSelected(null);
			setExtended(true);
		}
	};

	if (loading) {
		return <p className="text-sm text-muted-foreground">Cargando la prueba…</p>;
	}

	if (!trial) {
		return (
			<p className="text-sm text-muted-foreground">
				No pudimos leer el estado de la prueba de este negocio.
			</p>
		);
	}

	const state = STATES[trial.state] ?? {
		label: trial.state,
		tone: 'text-muted-foreground',
	};

	const option = trial.options.find((item) => item.days === selected) ?? null;

	return (
		<div className="space-y-8">
			<SectionHeader
				title="Prueba gratuita"
				description="Los días de Polaria que este negocio tiene sin pagar."
			/>

			<div className="space-y-1 rounded-lg border border-border px-4 py-3">
				<p className={cn('text-sm font-medium', state.tone)}>{state.label}</p>

				<p className="text-sm text-muted-foreground">
					{trial.trialEndsAt
						? `${trial.state === 'TRIAL_ACTIVE' ? 'Vence' : 'Venció'} el ${formatDay(trial.trialEndsAt)}`
						: 'Todavía no tiene prueba: arranca sola cuando conecta WhatsApp.'}
					{trial.daysRemaining !== null &&
						` · ${trial.daysRemaining === 1 ? 'queda 1 día' : `quedan ${trial.daysRemaining} días`}`}
				</p>

				{trial.trialStartedAt && (
					<p className="text-xs text-muted-foreground">
						Empezó el {formatDay(trial.trialStartedAt)}
					</p>
				)}
			</div>

			{!trial.canExtend ? (
				<p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
					Este negocio ya tiene una suscripción paga. Extenderle la prueba lo
					bajaría de categoría, así que no se ofrece desde acá.
				</p>
			) : (
				<div className="space-y-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">Extender</p>

						<div className="flex flex-wrap gap-2">
							{trial.options.map((item) => (
								<Button
									key={item.days}
									type="button"
									variant={selected === item.days ? 'default' : 'outline'}
									disabled={pending}
									onClick={() =>
										// Volver a apretar la opción elegida la suelta: es la forma
										// de arrepentirse sin recargar la pantalla.
										setSelected((current) => {
											setExtended(false);
											return current === item.days ? null : item.days;
										})
									}
								>
									+{item.days} días
								</Button>
							))}
						</div>
					</div>

					{option && (
						<>
							{/*
							 * La fecha resultante la calculó el backend con la misma regla
							 * que la va a aplicar. Es lo que hace que esto sea una vista
							 * previa y no una estimación parecida.
							 */}
							<p className="text-sm">
								{trial.state === 'TRIAL_ACTIVE'
									? 'La prueba pasaría a vencer el '
									: 'La prueba quedaría en curso hasta el '}
								<strong>{formatDay(option.trialEndsAt)}</strong>.
								{trial.state === 'NOT_STARTED' && (
									<span className="mt-1 block text-xs text-muted-foreground">
										El reloj arranca hoy, no cuando conecte WhatsApp.
									</span>
								)}
							</p>

							<Button
								disabled={pending}
								onClick={() => void apply(option.days)}
							>
								{pending ? (
									<Spinner className="size-3.5" />
								) : (
									<CalendarPlus className="size-4" />
								)}
								Extender {option.days} días
							</Button>
						</>
					)}
				</div>
			)}

			{extended && !error && (
				<p className="flex items-center gap-2 text-sm text-green-600">
					<Check className="size-4" />
					Prueba extendida. El negocio ya tiene el vencimiento nuevo.
				</p>
			)}

			{error && (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
					{error}
				</p>
			)}
		</div>
	);
};

export default TrialSection;
