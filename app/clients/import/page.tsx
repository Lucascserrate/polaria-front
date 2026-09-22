'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Breadcrumb from '@/components/Breadcrumb';
import { ROUTES } from '@/constants/routes';
import ImportColumnMapping from '@/modules/clients/import/ImportColumnMapping';
import ImportDone from '@/modules/clients/import/ImportDone';
import ImportDropzone from '@/modules/clients/import/ImportDropzone';
import ImportOptions from '@/modules/clients/import/ImportOptions';
import ImportPreview from '@/modules/clients/import/ImportPreview';
import ImportSummary from '@/modules/clients/import/ImportSummary';
import useImportClients from '@/services/clients/useImportClients';
import usePreviewClientsImport from '@/services/clients/usePreviewClientsImport';
import type {
	ImportAnalysisApi,
	ImportMappingApi,
	ImportResultApi,
} from '@/types/clients-import.types';

/** Lo que el negocio corrigió del mapeo detectado. Vacío significa "detectalo". */
type Overrides = Partial<ImportMappingApi>;

const errorMessage = (cause: unknown, fallback: string): string =>
	axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string'
		? cause.response.data.message
		: fallback;

/**
 * Importar la cartera de clientes desde un CSV.
 *
 * Tres momentos: elegir el archivo, revisar qué va a pasar, y confirmar. El del
 * medio es el que importa —una importación no se deshace: nadie va a borrar mil
 * fichas a mano— así que todo lo que pueda salir distinto se muestra **antes**:
 * de qué columna sale cada dato, cómo queda cada teléfono, y quién es nuevo,
 * quién ya estaba y quién no se puede traer.
 *
 * El análisis lo hace el servidor y se vuelve a pedir cada vez que cambia el
 * mapeo o el prefijo del país. Calcularlo acá sería reimplementar la
 * normalización de teléfonos y la búsqueda de duplicados en el navegador, y
 * tener dos respuestas a la misma pregunta es peor que esperar medio segundo.
 *
 * El archivo se vuelve a mandar al confirmar en lugar de mandar las filas ya
 * analizadas: lo que se importa es lo que dice el archivo, no lo que el
 * navegador dice que dice.
 */
const ImportClientsPage = () => {
	const router = useRouter();

	const [file, setFile] = useState<File | null>(null);
	const [analysis, setAnalysis] = useState<ImportAnalysisApi | null>(null);
	/** Lo que se detectó en la primera lectura, para poder volver a elegirlo. */
	const [detected, setDetected] = useState<ImportMappingApi | null>(null);
	const [overrides, setOverrides] = useState<Overrides>({});
	const [dialCode, setDialCode] = useState<string | undefined>();
	const [fillMissing, setFillMissing] = useState(true);
	const [result, setResult] = useState<ImportResultApi | null>(null);
	const [error, setError] = useState<string | null>(null);

	const preview = usePreviewClientsImport();
	const run = useImportClients();

	const analyze = async (
		nextFile: File,
		nextOverrides: Overrides,
		nextDialCode?: string,
	) => {
		setError(null);

		try {
			const next = await preview.mutateAsync({
				file: nextFile,
				mapping: nextOverrides,
				dialCode: nextDialCode,
			});

			setAnalysis(next);
			// El prefijo del negocio lo decide el servidor la primera vez.
			setDialCode(next.dialCode);
			return next;
		} catch (cause) {
			setError(errorMessage(cause, 'No se pudo leer el archivo.'));
			return null;
		}
	};

	const handleFile = async (nextFile: File) => {
		setResult(null);
		setOverrides({});
		setAnalysis(null);
		setDetected(null);

		const next = await analyze(nextFile, {});
		if (!next) return;

		setFile(nextFile);
		setDetected(next.mapping);
	};

	const handleMappingChange = (
		field: keyof ImportMappingApi,
		columns: string[],
	) => {
		if (!file) return;

		const next = { ...overrides, [field]: columns };
		setOverrides(next);
		void analyze(file, next, dialCode);
	};

	const handleDialCodeChange = (next: string) => {
		if (!file) return;

		setDialCode(next);
		void analyze(file, overrides, next);
	};

	const handleImport = async () => {
		if (!file) return;
		setError(null);

		try {
			setResult(
				await run.mutateAsync({
					file,
					mapping: overrides,
					dialCode,
					fillMissing,
				}),
			);
		} catch (cause) {
			setError(errorMessage(cause, 'No se pudo importar. Intentá de nuevo.'));
		}
	};

	const restart = () => {
		setFile(null);
		setAnalysis(null);
		setDetected(null);
		setOverrides({});
		setResult(null);
		setError(null);
	};

	const missingPhoneColumn = analysis?.mapping.phoneColumns.length === 0;

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-6">
			<div>
				<Breadcrumb
					trail={[{ label: 'Clientes', href: ROUTES.clients }]}
					current="Importar"
				/>
				<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
					Importar clientes
				</h1>
				<p className="mt-1 text-muted-foreground">
					Traé los contactos que ya tenés guardados, sin cargarlos de a uno.
				</p>
			</div>

			{error && (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			)}

			{/*
			 * El scroll vive acá adentro y no en la página: el marco de Clientes fija
			 * el alto de la ventana para que la lista scrollee dentro de su marco, y
			 * esta pantalla vive en el mismo marco.
			 */}
			<div className="min-h-0 flex-1 overflow-y-auto">
				{result ? (
					<ImportDone result={result} onRestart={restart} />
				) : !analysis || !detected || !file ? (
					<ImportDropzone pending={preview.isPending} onFile={handleFile} />
				) : (
					<div className="space-y-6 pb-2">
						<ImportSummary analysis={analysis} fileName={file.name} />

						<section className="space-y-4 rounded-xl border border-border p-4 sm:p-6">
							<div>
								<h2 className="font-medium">Columnas del archivo</h2>
								<p className="text-sm text-muted-foreground">
									Detectamos de dónde sale cada dato. Cambialo si no coincide.
								</p>
							</div>

							<ImportColumnMapping
								headers={analysis.headers}
								mapping={analysis.mapping}
								detected={detected}
								disabled={preview.isPending || run.isPending}
								onChange={handleMappingChange}
							/>

							{missingPhoneColumn && (
								<p className="text-sm text-warning">
									Sin la columna del teléfono no se puede importar: es lo que
									permite reconocer a cada cliente cuando escriba por WhatsApp.
								</p>
							)}

							<ImportOptions
								dialCode={dialCode ?? analysis.dialCode}
								fillMissing={fillMissing}
								disabled={preview.isPending || run.isPending}
								onDialCodeChange={handleDialCodeChange}
								onFillMissingChange={setFillMissing}
							/>
						</section>

						<ImportPreview
							analysis={analysis}
							fillMissing={fillMissing}
							stale={preview.isPending}
						/>
					</div>
				)}
			</div>

			{analysis && !result && (
				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
					<Button
						variant="outline"
						disabled={run.isPending}
						onClick={() => router.push(ROUTES.clients)}
					>
						Cancelar
					</Button>

					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							disabled={run.isPending}
							onClick={restart}
						>
							Cambiar archivo
						</Button>

						<Button
							disabled={
								run.isPending ||
								preview.isPending ||
								analysis.counts.toCreate + analysis.counts.existing === 0
							}
							onClick={() => void handleImport()}
						>
							{run.isPending && <Spinner className="size-4" />}
							{analysis.counts.toCreate > 0
								? `Importar ${analysis.counts.toCreate} clientes`
								: 'Importar'}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ImportClientsPage;
