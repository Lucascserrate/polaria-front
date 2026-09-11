'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import useGetBusinessPhotos from '@/services/settings/useGetBusinessPhotos';
import useUploadBusinessPhotos from '@/services/settings/useUploadBusinessPhotos';
import useDeleteBusinessPhoto from '@/services/settings/useDeleteBusinessPhoto';
import useSetBusinessPhotoCover from '@/services/settings/useSetBusinessPhotoCover';
import type { BusinessPhoto } from '@/services/settings/photos.service';

/**
 * Formatos que se ofrecen en el selector de archivos.
 *
 * Es la misma lista que acepta el backend (`ALLOWED_IMAGE_MIME_TYPES`) y sirve
 * para otra cosa: filtrar lo que el explorador de archivos muestra, para que
 * nadie elija un PDF y se entere después de esperar la subida. La validación de
 * verdad sigue estando del otro lado.
 */
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/avif';

/**
 * La tarjeta con el título, alrededor de cualquiera de los tres estados.
 *
 * Envuelve también el "cargando" y el error para que la sección ocupe el mismo
 * lugar en la página desde el primer cuadro: sin esto, el bloque aparecía
 * después y empujaba la vista previa hacia abajo justo cuando se la estaba
 * mirando.
 */
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<section className="space-y-3 rounded-xl border border-border p-4 sm:p-6">
		<div className="space-y-1">
			<h2 className="text-lg font-semibold">Fotos</h2>
			<p className="text-sm text-muted-foreground">
				Se ven arriba de todo en tu página. Son opcionales: sin ellas la página
				igual se ve bien.
			</p>
		</div>
		{children}
	</section>
);

const errorMessage = (cause: unknown, fallback: string): string =>
	axios.isAxiosError(cause) &&
	typeof (cause.response?.data as { message?: unknown } | undefined)
		?.message === 'string'
		? (cause.response?.data as { message: string }).message
		: fallback;

/**
 * Las fotos del local, para la página pública de reservas.
 *
 * Opcional a propósito y sin insistencia: un negocio sin fotos tiene una página
 * que se ve bien —no queda un hueco donde irían—, así que esto no es un paso
 * pendiente que haya que completar. Por eso no hay barra de progreso de perfil
 * ni avisos en el índice de configuración.
 */
const PhotosSection: React.FC = () => {
	const { data, isLoading, isError, refetch } = useGetBusinessPhotos();
	const upload = useUploadBusinessPhotos();
	const remove = useDeleteBusinessPhoto();
	const setCover = useSetBusinessPhotoCover();

	const inputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<BusinessPhoto | null>(
		null,
	);

	const busy = upload.isPending || remove.isPending || setCover.isPending;

	const pick = (files: FileList | null) => {
		setError(null);
		if (!files?.length) return;

		upload.mutate(Array.from(files), {
			onError: (cause) =>
				setError(
					errorMessage(
						cause,
						'No se pudieron subir las fotos. Probá de nuevo.',
					),
				),
		});
	};

	if (isLoading) {
		return (
			<Card>
				<p className="text-sm text-muted-foreground">Cargando...</p>
			</Card>
		);
	}

	/*
	 * Sin galería cargada no se dibuja el formulario.
	 *
	 * No es prolijidad: el máximo lo manda el backend, así que sin respuesta no
	 * se sabe cuántas fotos se pueden subir. Cayendo a cero, la pantalla decía
	 * "llegaste al máximo de 0 fotos" y deshabilitaba el botón —una barrera
	 * inventada por un fallo de red, con el negocio buscando qué borrar para
	 * poder subir—. Que la petición falló es lo único cierto que se puede decir.
	 */
	if (isError || !data) {
		return (
			<Card>
				<p className="text-sm text-destructive">No pudimos cargar tus fotos.</p>
				<Button variant="outline" onClick={() => void refetch()}>
					Volver a intentar
				</Button>
			</Card>
		);
	}

	const { photos, maxPhotos } = data;
	const remaining = Math.max(maxPhotos - photos.length, 0);

	return (
		<Card>
			<p className="text-sm text-muted-foreground">
				La primera es la portada: la que aparece más grande. Mostrá el local, la
				recepción y algún trabajo terminado.
			</p>

			{error && (
				<p
					role="alert"
					className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive"
				>
					{error}
				</p>
			)}

			{photos.length > 0 && (
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{photos.map((photo, index) => (
						<li
							key={photo.id}
							className="overflow-hidden rounded-lg border border-border bg-card"
						>
							<div className="relative aspect-square">
								<Image
									src={photo.url}
									alt=""
									fill
									sizes="(min-width: 640px) 16rem, 45vw"
									className="object-cover"
								/>

								{index === 0 && (
									<span className="absolute left-2 top-2 rounded-full bg-foreground/85 px-2 py-0.5 text-xs font-medium text-background">
										Portada
									</span>
								)}
							</div>

							{/*
							 * Los dos botones están siempre a la vista y no aparecen al pasar
							 * el mouse por encima: hay negocios que usan el panel desde un
							 * teléfono, donde no hay hover, y otros con un mouse sin rueda.
							 * Una acción que solo existe al pasar por encima es una acción
							 * que para esa gente no existe.
							 */}
							<div className="flex items-center justify-between gap-1 px-2 py-2">
								<Button
									variant="ghost"
									size="sm"
									disabled={busy || index === 0}
									onClick={() => {
										setError(null);
										setCover.mutate(photo.id, {
											onError: (cause) =>
												setError(
													errorMessage(cause, 'No se pudo cambiar la portada.'),
												),
										});
									}}
								>
									<Star className="mr-1 h-4 w-4" />
									{index === 0 ? 'Portada' : 'Hacer portada'}
								</Button>

								<Button
									variant="ghost"
									size="sm"
									aria-label="Eliminar foto"
									disabled={busy}
									onClick={() => setPendingDelete(photo)}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						</li>
					))}
				</ul>
			)}

			<div className="space-y-2">
				<input
					ref={inputRef}
					type="file"
					accept={ACCEPTED}
					multiple
					hidden
					onChange={(event) => {
						pick(event.target.files);
						// Se limpia para que elegir el mismo archivo otra vez vuelva a
						// disparar el `change`: sin esto, reintentar tras un error no hace
						// nada.
						event.target.value = '';
					}}
				/>

				<Button
					variant="outline"
					disabled={busy || remaining === 0}
					onClick={() => inputRef.current?.click()}
				>
					{upload.isPending ? (
						<>
							<Spinner className="mr-2 h-4 w-4" />
							Subiendo...
						</>
					) : (
						<>
							<ImagePlus className="mr-2 h-4 w-4" />
							{photos.length === 0 ? 'Agregar fotos' : 'Agregar más fotos'}
						</>
					)}
				</Button>

				<p className="text-sm text-muted-foreground">
					{remaining === 0
						? `Llegaste al máximo de ${maxPhotos} fotos. Borrá alguna para subir otra.`
						: `Podés subir ${remaining} ${remaining === 1 ? 'foto' : 'fotos'} más. JPG, PNG, WEBP o AVIF, hasta 5 MB cada una.`}
				</p>
			</div>

			<AlertDialog
				open={Boolean(pendingDelete)}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar esta foto?</AlertDialogTitle>
						<AlertDialogDescription>
							Se borra de tu página de reservas y del archivo.{' '}
							<strong className="text-foreground">
								Esta acción no se puede deshacer
							</strong>
							: para volver a tenerla habría que subirla otra vez.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							disabled={remove.isPending}
							className="bg-destructive hover:bg-destructive/90"
							onClick={() => {
								const photo = pendingDelete;
								if (!photo) return;

								setError(null);
								setPendingDelete(null);
								remove.mutate(photo.id, {
									onError: (cause) =>
										setError(
											errorMessage(cause, 'No se pudo eliminar la foto.'),
										),
								});
							}}
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
};

export default PhotosSection;
