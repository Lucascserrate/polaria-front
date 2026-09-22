'use client';

import { useState } from 'react';
import { CalendarPlus, Check, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatDay } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { SubscriptionSummary } from '@/types/tenant.types';
import { subscriptionState } from '../subscription-state';
import SectionHeader from '../SectionHeader';

interface Props {
	subscription: SubscriptionSummary | null;
	loading: boolean;
	pending: boolean;
	error: string | null;
	/** Devuelve si se aplicó: con `false` la selección se mantiene para reintentar. */
	onExtendTrial: (days: number) => Promise<boolean>;
	/** Devuelve si se aplicó, por lo mismo. */
	onPay: (months: number) => Promise<boolean>;
}

/** Una de las dos decisiones que se pueden tomar acá. */
type Action = 'pay' | 'trial';

/**
 * Lo comercial de un negocio: qué está probando, qué pagó y hasta cuándo.
 *
 * Las dos acciones se confirman en dos pasos —elegir el plazo, después
 * aplicar— y no en uno. No es fricción por las dudas: las dos suman tiempo cada
 * vez que se ejecutan, así que un clic de más regala meses de producto y no hay
 * forma de deshacerlo desde esta pantalla.
 *
 * El pago va arriba y la prueba abajo porque ése es el orden en que se usan: un
 * negocio que llama para pagar es lo habitual, extenderle la prueba es la
 * excepción. Y la prueba desaparece cuando el negocio ya paga: ofrecerle una
 * prueba a un cliente sería bajarlo de categoría, y el backend lo rechaza.
 *
 * Nada de acá pasa por el borrador del editor. La suscripción no es un campo
 * que se guarda con el resto de la ficha: son acciones que ocurren en el
 * momento, como conectar WhatsApp.
 */
const SubscriptionSection: React.FC<Props> = ({
	subscription,
	loading,
	pending,
	error,
	onExtendTrial,
	onPay,
}) => {
	/*
	 * Una sola selección para las dos acciones, y no una por cada una: son
	 * decisiones alternativas sobre el mismo negocio, y elegir un plazo de pago
	 * tiene que soltar la extensión que estaba elegida en vez de dejar dos
	 * confirmaciones armadas a la vez.
	 */
	const [selected, setSelected] = useState<{
		action: Action;
		size: number;
	} | null>(null);
	const [done, setDone] = useState<Action | null>(null);

	/**
	 * Aplica y suelta la selección.
	 *
	 * Sólo si salió bien: con un error, lo elegido se queda donde estaba para que
	 * reintentar sea apretar de nuevo y no volver a armar la decisión.
	 */
	const apply = async (action: Action, size: number) => {
		const applied =
			action === 'pay' ? await onPay(size) : await onExtendTrial(size);

		if (applied) {
			setSelected(null);
			setDone(action);
		}
	};

	/** Volver a apretar lo elegido lo suelta: es cómo arrepentirse sin recargar. */
	const choose = (action: Action, size: number) => {
		setDone(null);
		setSelected((current) =>
			current?.action === action && current.size === size
				? null
				: { action, size },
		);
	};

	const sizeOf = (action: Action): number | null =>
		selected?.action === action ? selected.size : null;

	if (loading) {
		return (
			<p className="text-sm text-muted-foreground">Cargando la suscripción…</p>
		);
	}

	if (!subscription) {
		return (
			<p className="text-sm text-muted-foreground">
				No pudimos leer el estado comercial de este negocio.
			</p>
		);
	}

	const state = subscriptionState(subscription.state);
	const paySize = sizeOf('pay');
	const trialSize = sizeOf('trial');
	const payOption =
		subscription.paymentOptions.find((item) => item.months === paySize) ?? null;
	const trialOption =
		subscription.trialOptions.find((item) => item.days === trialSize) ?? null;

	return (
		<div className="space-y-8">
			<SectionHeader
				title="Suscripción"
				description="Hasta cuándo tiene Polaria este negocio, lo haya pagado o no."
			/>

			<div className="space-y-1 rounded-lg border border-border px-4 py-3">
				<p className={cn('text-sm font-medium', state.tone)}>{state.label}</p>

				<p className="text-sm text-muted-foreground">
					{until(subscription)}
					{subscription.daysRemaining !== null &&
						` · ${
							subscription.daysRemaining === 1
								? 'queda 1 día'
								: `quedan ${subscription.daysRemaining} días`
						}`}
				</p>

				{/*
				 * La prueba se sigue contando aunque el negocio ya pague: es el
				 * registro de cuándo probó Polaria, y es lo que responde "¿este
				 * cliente de cuándo es?" sin salir de la solapa.
				 */}
				{subscription.trialStartedAt && (
					<p className="text-xs text-muted-foreground">
						Probó Polaria desde el {formatDay(subscription.trialStartedAt)}
					</p>
				)}
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<p className="text-sm font-medium">Registrar un pago</p>
					<p className="text-xs text-muted-foreground">
						Suma al vencimiento que ya tiene, así que cobrarle antes de tiempo
						no le quita los días que le quedaban.
					</p>

					<div className="flex flex-wrap gap-2 pt-1">
						{subscription.paymentOptions.map((item) => (
							<Button
								key={item.months}
								type="button"
								variant={paySize === item.months ? 'default' : 'outline'}
								disabled={pending}
								onClick={() => choose('pay', item.months)}
							>
								{item.months === 12 ? '1 año' : `${item.months} meses`}
							</Button>
						))}
					</div>
				</div>

				{payOption && (
					<>
						{/*
						 * La fecha resultante la calculó el backend con la misma regla que
						 * la va a aplicar. Es lo que hace que esto sea una vista previa y
						 * no una estimación parecida.
						 */}
						<p className="text-sm">
							El negocio quedaría pago hasta el{' '}
							<strong>{formatDay(payOption.subscriptionEndsAt)}</strong>.
						</p>

						<Button
							type="button"
							disabled={pending}
							onClick={() => void apply('pay', payOption.months)}
						>
							{pending ? (
								<Spinner className="size-3.5" />
							) : (
								<Wallet className="size-4" />
							)}
							Registrar el pago
						</Button>
					</>
				)}
			</div>

			{subscription.canExtendTrial ? (
				<div className="space-y-4 border-t border-border pt-6">
					<div className="space-y-2">
						<p className="text-sm font-medium">Extender la prueba</p>
						<p className="text-xs text-muted-foreground">
							Le regala días sin cobrarle. Revive una prueba vencida y le
							arranca la prueba al negocio que nunca la inició.
						</p>

						<div className="flex flex-wrap gap-2 pt-1">
							{subscription.trialOptions.map((item) => (
								<Button
									key={item.days}
									type="button"
									variant={trialSize === item.days ? 'default' : 'outline'}
									disabled={pending}
									onClick={() => choose('trial', item.days)}
								>
									+{item.days} días
								</Button>
							))}
						</div>
					</div>

					{trialOption && (
						<>
							<p className="text-sm">
								{subscription.state === 'TRIAL_ACTIVE'
									? 'La prueba pasaría a vencer el '
									: 'La prueba quedaría en curso hasta el '}
								<strong>{formatDay(trialOption.trialEndsAt)}</strong>.
								{subscription.state === 'NOT_STARTED' && (
									<span className="mt-1 block text-xs text-muted-foreground">
										El reloj arranca hoy, no cuando conecte WhatsApp.
									</span>
								)}
							</p>

							<Button
								type="button"
								variant="outline"
								disabled={pending}
								onClick={() => void apply('trial', trialOption.days)}
							>
								{pending ? (
									<Spinner className="size-3.5" />
								) : (
									<CalendarPlus className="size-4" />
								)}
								Extender {trialOption.days} días
							</Button>
						</>
					)}
				</div>
			) : (
				<p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
					Este negocio ya tiene una suscripción paga. Extenderle la prueba lo
					bajaría de categoría, así que no se ofrece desde acá.
				</p>
			)}

			{done && !error && (
				<p className="flex items-center gap-2 text-sm text-success">
					<Check className="size-4" />
					{done === 'pay'
						? 'Pago registrado. El negocio ya tiene el vencimiento nuevo.'
						: 'Prueba extendida. El negocio ya tiene el vencimiento nuevo.'}
				</p>
			)}

			{error && (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			)}
		</div>
	);
};

/**
 * La línea que dice hasta cuándo llega lo que el negocio tiene.
 *
 * Cada estado mira su propio reloj: el que paga tiene `subscriptionEndsAt`, el
 * que prueba tiene `trialEndsAt`, y el que nunca hizo ninguna de las dos no
 * tiene fecha. Elegir "la fecha más grande" habría sido más corto y habría
 * mentido en el caso que importa: un negocio que pagó después de que se le
 * venciera la prueba.
 */
const until = (subscription: SubscriptionSummary): string => {
	if (subscription.state === 'ACTIVE' && subscription.subscriptionEndsAt) {
		return `Pago hasta el ${formatDay(subscription.subscriptionEndsAt)}`;
	}

	if (subscription.state === 'EXPIRED' && subscription.subscriptionEndsAt) {
		return `Venció el ${formatDay(subscription.subscriptionEndsAt)}`;
	}

	if (subscription.trialEndsAt) {
		return `${
			subscription.state === 'TRIAL_ACTIVE' ? 'Vence' : 'Venció'
		} el ${formatDay(subscription.trialEndsAt)}`;
	}

	return 'Todavía no tiene prueba: arranca sola cuando conecta WhatsApp.';
};

export default SubscriptionSection;
