'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
	useRemoveStaffPhoto,
	useUploadStaffPhoto,
} from '@/services/staff/useStaffPhoto';
import TeamAvatar from './TeamAvatar';

/**
 * Formatos que se ofrecen en el selector de archivos.
 *
 * Es la misma lista que acepta el backend (`ALLOWED_IMAGE_MIME_TYPES`) y sirve
 * para otra cosa: filtrar lo que el explorador muestra, para que nadie elija un
 * PDF y se entere después de esperar la subida. La validación de verdad sigue
 * estando del otro lado.
 */
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/avif';

interface Props {
	/** Ausente al crear: todavía no hay ficha a la cual subirle una foto. */
	memberId?: string;
	photoUrl?: string | null;
	/**
	 * Nombre y color tal como están en el borrador, no como están guardados: es
	 * lo que hace que las iniciales y el color del avatar cambien mientras se
	 * escribe, sin esperar el guardado.
	 */
	preview: {
		firstName?: string | null;
		lastName?: string | null;
		calendarColor?: string | null;
	};
}

/**
 * La foto de un miembro del equipo, dentro de la ficha.
 *
 * Se aplica en el momento —subir es subir, quitar es quitar— y no viaja con
 * "Guardar cambios", igual que el acceso. Es un archivo, no un campo de texto:
 * dejarlo en el borrador significaría o subirlo recién al guardar, con la
 * persona esperando sin saber si entró, o sostener el archivo en memoria del
 * navegador mientras se recorren las otras secciones.
 *
 * Al crear no hay ficha, así que no hay dónde poner la foto. En lugar de un
 * botón que solo puede responder "primero guardá", se dice cuándo va a estar
 * disponible.
 */
const TeamPhotoField: React.FC<Props> = ({ memberId, photoUrl, preview }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);

	const upload = useUploadStaffPhoto();
	const remove = useRemoveStaffPhoto();

	const busy = upload.isPending || remove.isPending;

	const run = async (action: () => Promise<unknown>, fallback: string) => {
		setError(null);
		try {
			await action();
		} catch (cause) {
			setError(
				axios.isAxiosError(cause) &&
					typeof cause.response?.data?.message === 'string'
					? cause.response.data.message
					: fallback,
			);
		}
	};

	const member = { ...preview, photoUrl };

	return (
		<div className="flex items-start gap-4">
			<TeamAvatar member={member} size="lg" />

			<div className="space-y-2">
				{memberId ? (
					<>
						<div className="flex flex-wrap gap-2">
							<input
								ref={inputRef}
								type="file"
								accept={ACCEPTED}
								hidden
								onChange={(event) => {
									const file = event.target.files?.[0];
									// Se limpia para que elegir el mismo archivo otra vez vuelva
									// a disparar el `change`: sin esto, reintentar tras un error
									// no hace nada.
									event.target.value = '';
									if (!file) return;

									void run(
										() => upload.mutateAsync({ id: memberId, file }),
										'No se pudo subir la foto. Probá de nuevo.',
									);
								}}
							/>

							<Button
								variant="outline"
								size="sm"
								disabled={busy}
								onClick={() => inputRef.current?.click()}
							>
								{upload.isPending ? (
									<>
										<Spinner className="size-3.5" />
										Subiendo...
									</>
								) : (
									<>
										<ImagePlus className="size-4" />
										{photoUrl ? 'Cambiar foto' : 'Subir foto'}
									</>
								)}
							</Button>

							{photoUrl && (
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									onClick={() =>
										void run(
											() => remove.mutateAsync(memberId),
											'No se pudo quitar la foto. Probá de nuevo.',
										)
									}
								>
									{remove.isPending ? (
										<Spinner className="size-3.5" />
									) : (
										<Trash2 className="size-4 text-destructive" />
									)}
									Quitar
								</Button>
							)}
						</div>

						<p className="text-sm text-muted-foreground">
							{photoUrl
								? 'Así aparece en la lista del equipo y en la agenda.'
								: 'Sin foto se ven sus iniciales sobre el color que elijas abajo. JPG, PNG, WEBP o AVIF, hasta 5 MB.'}
						</p>
					</>
				) : (
					<p className="text-sm text-muted-foreground">
						Las iniciales sobre el color que elijas abajo. Así aparece en la
						lista del equipo y en la agenda; su foto se puede subir en cuanto
						guardes la ficha.
					</p>
				)}

				{error && <p className="text-sm text-destructive">{error}</p>}
			</div>
		</div>
	);
};

export default TeamPhotoField;
