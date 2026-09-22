'use client';

import { useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface Props {
	pending: boolean;
	onFile: (file: File) => void;
}

/**
 * El primer paso: elegir el archivo.
 *
 * Se puede arrastrar **y** se puede elegir con el botón. No es redundancia: en
 * un teléfono no se arrastra nada, y en un escritorio arrastrar desde la carpeta
 * de descargas —que es donde acaba de caer el export de Google— es el gesto más
 * corto que existe.
 *
 * Abajo va la receta para conseguir el archivo. Quien llega acá casi nunca
 * exportó un CSV en su vida, y mandarlo a buscar cómo hacerlo en otra pestaña es
 * donde se abandona el flujo.
 */
const ImportDropzone: React.FC<Props> = ({ pending, onFile }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);

	const pick = (files: FileList | null) => {
		const file = files?.[0];
		if (file) onFile(file);
	};

	return (
		<div className="space-y-6">
			<div
				className={cn(
					'rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors sm:p-12',
					dragging && 'border-primary bg-primary/5',
				)}
				onDragOver={(event) => {
					event.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(event) => {
					event.preventDefault();
					setDragging(false);
					pick(event.dataTransfer.files);
				}}
			>
				<FileSpreadsheet
					aria-hidden
					className="mx-auto mb-4 size-10 text-muted-foreground"
				/>

				<p className="font-medium">Arrastrá el archivo CSV acá</p>
				<p className="mt-1 text-sm text-muted-foreground">
					O elegilo desde tu computadora. Máximo 5.000 contactos.
				</p>

				<input
					ref={inputRef}
					type="file"
					accept=".csv,text/csv"
					hidden
					onChange={(event) => {
						pick(event.target.files);
						// Se limpia para que elegir el mismo archivo otra vez vuelva a
						// disparar el `change`: sin esto, reintentar no hace nada.
						event.target.value = '';
					}}
				/>

				<Button
					className="mt-6"
					disabled={pending}
					onClick={() => inputRef.current?.click()}
				>
					{pending ? <Spinner className="size-4" /> : <Upload />}
					{pending ? 'Leyendo el archivo…' : 'Elegir archivo'}
				</Button>
			</div>

			<GoogleContactsHelp />
		</div>
	);
};

/** Cómo se saca el archivo de Google Contactos, que es de donde sale. */
const GoogleContactsHelp: React.FC = () => (
	<div className="rounded-xl border border-border p-4 sm:p-6">
		<h2 className="font-medium">¿De dónde saco el archivo?</h2>
		<p className="mt-1 text-sm text-muted-foreground">
			Si tus clientes están en los contactos del teléfono que usás para el
			negocio:
		</p>

		<ol className="mt-4 space-y-2 text-sm text-muted-foreground">
			{[
				<>
					Entrá a{' '}
					<a
						href="https://contacts.google.com"
						target="_blank"
						rel="noreferrer noopener"
						className="text-foreground underline underline-offset-4"
					>
						contacts.google.com
					</a>{' '}
					desde una computadora.
				</>,
				<>Seleccioná los contactos que querés traer.</>,
				<>
					Abrí el menú y elegí <strong>Exportar</strong>.
				</>,
				<>
					Elegí el formato <strong>Google CSV</strong> y descargá el archivo.
				</>,
			].map((step, index) => (
				<li key={index} className="flex gap-3">
					<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-foreground">
						{index + 1}
					</span>
					<span>{step}</span>
				</li>
			))}
		</ol>

		<p className="mt-4 text-sm text-muted-foreground">
			No hace falta que edites nada: acá detectamos las columnas y te mostramos
			qué va a pasar antes de importar.
		</p>
	</div>
);

export default ImportDropzone;
