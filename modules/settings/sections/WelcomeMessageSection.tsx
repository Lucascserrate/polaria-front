'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WelcomeMessageCard from '@/modules/settings/WelcomeMessageCard';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';

/**
 * El saludo con el que Polaria recibe a un cliente.
 *
 * Guardar el texto de fábrica sin tocar manda `null` y no una copia. No es un
 * detalle: la copia congelaría el saludo de ese negocio, y cualquier arreglo al
 * texto original —una palabra que se lee mal, un emoji que no rinde— no le
 * llegaría nunca a quien apretó "Guardar" sin cambiar nada.
 */
const WelcomeMessageSection: React.FC = () => {
	const { data: settings, isLoading } = useGetSettings();
	const {
		mutateAsync: save,
		isPending,
		isSuccess,
		isError,
	} = useUpdateSettings();

	// `null` hasta que se toque algo: hasta entonces manda lo guardado.
	const [draft, setDraft] = useState<string | null>(null);

	if (isLoading || !settings) {
		return <p className="text-sm text-muted-foreground">Cargando...</p>;
	}

	const { welcomeMessage } = settings;

	// Se edita el texto real que se envía, no un campo en blanco: sin el de
	// fábrica a la vista, personalizarlo empieza por adivinar qué decía.
	const value = draft ?? welcomeMessage.text ?? welcomeMessage.defaultText;

	const isDefault = value.trim() === welcomeMessage.defaultText.trim();
	const isEmpty = value.trim().length === 0;

	return (
		<div className="space-y-6">
			<WelcomeMessageCard
				value={value}
				onChange={setDraft}
				defaultText={welcomeMessage.defaultText}
				placeholder={welcomeMessage.placeholder}
				maxLength={welcomeMessage.maxLength}
				previewButtons={welcomeMessage.previewButtons}
				businessName={settings.polariaName}
				disabled={isPending}
			/>

			{isEmpty && (
				<p className="text-sm text-muted-foreground">
					Sin texto se envía el saludo original: el menú no puede salir vacío.
				</p>
			)}

			{isError && (
				<p className="text-sm text-destructive">
					No se pudo guardar. Intentá de nuevo.
				</p>
			)}

			<Button
				size="lg"
				disabled={isPending}
				onClick={() => {
					save({
						// El de fábrica se guarda como `null` para que siga siendo el de
						// fábrica y no una copia que se queda vieja.
						welcomeMessage: isDefault || isEmpty ? null : value.trim(),
					})
						// Soltado el borrador, el campo vuelve a mostrar lo que el backend
						// guardó de verdad y no lo que creemos que guardó.
						.then(() => setDraft(null))
						// El error ya lo cuenta `isError`; sin esto queda un rechazo suelto.
						.catch(() => undefined);
				}}
			>
				{isPending ? (
					'Guardando...'
				) : isSuccess ? (
					<>
						<Check className="mr-2 h-4 w-4" />
						Guardado
					</>
				) : (
					'Guardar saludo'
				)}
			</Button>
		</div>
	);
};

export default WelcomeMessageSection;
