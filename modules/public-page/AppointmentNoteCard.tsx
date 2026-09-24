'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';

/**
 * Lo que el cliente lee junto a su turno: una seña, un timbre, cómo venir.
 *
 * Vive en Mi página y no en Configuración por el criterio de esta sección:
 * **acá va lo que existe sólo para que lo vea un cliente**. El nombre, la zona
 * horaria y la dirección se quedan en Configuración aunque la página los
 * muestre, porque además sostienen la agenda y lo que se manda por WhatsApp.
 * Esta nota no sostiene nada más: si no la lee un cliente, no hace nada.
 *
 * **No sale en la vista previa de abajo**, y conviene saberlo al leer esto: la
 * vista previa muestra la página del negocio, y la nota aparece después —al
 * terminar la reserva y cada vez que se abre el turno—. Por eso el texto de
 * ayuda dice cuándo se ve, en lugar de confiar en que se la encuentre mirando.
 *
 * Se guarda sola, como el resto de las tarjetas de esta pantalla: son cosas
 * distintas que se cambian en momentos distintos, y un único "Guardar" abajo
 * obligaría a revisar todo para tocar una.
 */
const AppointmentNoteCard: React.FC = () => {
	const { data: settings, isLoading } = useGetSettings();
	const {
		mutateAsync: save,
		isPending,
		isSuccess,
		isError,
	} = useUpdateSettings();

	/* `null` mientras no se tocó: lo que manda es lo que vino del servidor. */
	const [draft, setDraft] = useState<string | null>(null);

	const saved = settings?.appointmentNote.text ?? '';
	const value = draft ?? saved;
	const maxLength = settings?.appointmentNote.maxLength ?? 1000;
	const changed = value.trim() !== saved.trim();

	if (isLoading) {
		return (
			<div className="h-56 animate-pulse rounded-xl border border-border bg-muted/50" />
		);
	}

	return (
		<div className="space-y-3 rounded-xl border border-border p-4 sm:p-6">
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">Información importante</h2>
				<p className="text-sm text-muted-foreground">
					Lo que quieras que tus clientes lean junto a su turno: una seña que hay
					que transferir, cómo tocar el timbre, con qué venir preparado. Se
					muestra al terminar la reserva y cada vez que abren su turno.
				</p>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-end">
					{/*
					 * El contador se marca al llegar al tope y no al pasarlo: el
					 * `maxLength` del campo corta antes, así que sin esto el texto
					 * dejaría de entrar sin que nada lo explique.
					 */}
					<span
						className={cn(
							'text-xs tabular-nums',
							value.length === maxLength
								? 'text-warning'
								: 'text-muted-foreground',
						)}
					>
						{value.length} / {maxLength}
					</span>
				</div>

				<textarea
					id="appointment-note"
					aria-label="Información importante"
					value={value}
					disabled={isPending}
					maxLength={maxLength}
					rows={5}
					placeholder={
						'Para confirmar tu turno necesitamos el 50% de anticipo.\n' +
						'Mandanos el comprobante por WhatsApp.'
					}
					onChange={(event) => setDraft(event.target.value)}
					className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full resize-y rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
				/>

				<p className="text-sm text-muted-foreground">
					Dejalo vacío si no hace falta: entonces no se muestra nada.
				</p>
			</div>

			{isError && (
				<p className="text-sm text-destructive">
					No se pudo guardar. Intentá de nuevo.
				</p>
			)}

			{/*
			 * El botón sólo se prende con algo distinto de lo guardado. Es un campo
			 * al que se entra a mirar más de lo que se edita, y un "Guardar" siempre
			 * encendido invita a tocarlo sin haber cambiado nada.
			 */}
			<Button
				disabled={!changed || isPending}
				onClick={() => {
					void save({ appointmentNote: value.trim() || null });
				}}
			>
				{isPending ? (
					'Guardando...'
				) : isSuccess && !changed ? (
					<>
						<Check className="mr-2 size-4" />
						Guardado
					</>
				) : (
					'Guardar'
				)}
			</Button>
		</div>
	);
};

export default AppointmentNoteCard;
