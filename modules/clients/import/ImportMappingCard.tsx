'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { countryForDial } from '@/lib/countries';
import type {
	ImportAnalysisApi,
	ImportMappingApi,
} from '@/types/clients-import.types';
import ImportColumnMapping from './ImportColumnMapping';
import ImportDialCode from './ImportDialCode';

interface Props {
	analysis: ImportAnalysisApi;
	/** Lo que se detectó en la primera lectura, antes de cualquier corrección. */
	detected: ImportMappingApi;
	dialCode: string;
	fillMissing: boolean;
	disabled?: boolean;
	onMappingChange: (field: keyof ImportMappingApi, columns: string[]) => void;
	onDialCodeChange: (dialCode: string) => void;
	onFillMissingChange: (fillMissing: boolean) => void;
}

/** Cómo se lee cada campo, en una línea. */
const FIELDS: { field: keyof ImportMappingApi; label: string }[] = [
	{ field: 'nameColumns', label: 'Nombre' },
	{ field: 'phoneColumns', label: 'Teléfono' },
	{ field: 'emailColumns', label: 'Email' },
];

/**
 * De dónde sale cada dato, y cómo cambiarlo.
 *
 * Los tres desplegables arrancan plegados. Cuando la detección acierta —que es
 * el caso para el que existe esta pantalla— son tres controles con los nombres
 * de las columnas de un CSV, que no significan nada para quien está importando
 * su agenda y le compiten la atención a lo único que hay que revisar de verdad:
 * la tabla de abajo. Ahí se ven nombres y teléfonos, que es la verificación que
 * sirve; acá arriba alcanza con decir de dónde salieron.
 *
 * Se abren solos cuando falta la columna del teléfono, porque ahí dejan de ser
 * una curiosidad y pasan a ser el único camino para seguir.
 */
/** Qué se lee y qué no, en una línea, para cuando no entran los nombres. */
const shortSummary = (mapping: ImportMappingApi): string => {
	// `Intl.ListFormat` pone la "y" donde va: "nombre, teléfono y email".
	const list = new Intl.ListFormat('es', { type: 'conjunction' });

	const names = (mapped: boolean) =>
		list.format(
			FIELDS.filter(({ field }) => mapping[field].length > 0 === mapped).map(
				({ label }) => label.toLowerCase(),
			),
		);

	const leidos = names(true);
	const faltan = names(false);

	return [
		leidos
			? `Leemos ${leidos} del archivo.`
			: 'No reconocimos ninguna columna.',
		faltan && `No se importa: ${faltan}.`,
	]
		.filter(Boolean)
		.join(' ');
};

const ImportMappingCard: React.FC<Props> = ({
	analysis,
	detected,
	dialCode,
	fillMissing,
	disabled,
	onMappingChange,
	onDialCodeChange,
	onFillMissingChange,
}) => {
	const checkboxId = useId();
	const missingPhone = analysis.mapping.phoneColumns.length === 0;

	/*
	 * Abierto o cerrado se deriva, no se sincroniza: `null` es "todavía no dije
	 * nada", y entonces manda si falta el teléfono. Así se abre solo cuando hace
	 * falta sin un efecto que persiga al estado, y en cuanto alguien toca el
	 * botón gana lo que esa persona quiso.
	 */
	const [override, setOverride] = useState<boolean | null>(null);
	const open = override ?? missingPhone;

	const country = countryForDial(dialCode);

	return (
		<section className="space-y-4 rounded-xl border border-border p-4 sm:p-6">
			<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
				{/*
				 * Abierto, el resumen sobraría: lo que dice está en los desplegables de
				 * abajo, con sus etiquetas. Queda el título, que es lo que explica qué
				 * son esos tres controles.
				 */}
				{open ? (
					<h2 className="font-medium">Columnas del archivo</h2>
				) : (
					<div className="min-w-0">
						{/*
						 * En un teléfono los nombres de las columnas ocupan cuatro
						 * renglones y empujan la tabla abajo del pliegue, que es lo único
						 * que hay que mirar. Ahí va la versión corta; el detalle está a un
						 * toque de "Cambiar".
						 */}
						<p className="text-sm text-muted-foreground sm:hidden">
							{shortSummary(analysis.mapping)}
						</p>

						<p className="hidden flex-wrap items-baseline gap-x-2 gap-y-1 text-sm sm:flex">
							{FIELDS.map(({ field, label }) => (
								<span key={field} className="text-muted-foreground">
									{label}:{' '}
									<span className="text-foreground">
										{analysis.mapping[field].join(' + ') || 'no se importa'}
									</span>
								</span>
							))}
						</p>

						<p className="mt-1 text-xs text-muted-foreground">
							Los números sin código de país se leen como{' '}
							{country ? `${country.name} (+${dialCode})` : `+${dialCode}`}.
						</p>
					</div>
				)}

				<Button
					variant="ghost"
					size="sm"
					disabled={disabled}
					onClick={() => setOverride(!open)}
				>
					{open ? 'Listo' : 'Cambiar'}
				</Button>
			</div>

			{missingPhone && (
				<p className="text-sm text-warning">
					Elegí cuál es la columna del teléfono: es lo que permite reconocer a
					cada cliente cuando escriba por WhatsApp, y sin eso no se puede
					importar.
				</p>
			)}

			{open && (
				<div className="space-y-4">
					<ImportColumnMapping
						headers={analysis.headers}
						mapping={analysis.mapping}
						detected={detected}
						disabled={disabled}
						onChange={onMappingChange}
					/>

					<ImportDialCode
						dialCode={dialCode}
						disabled={disabled}
						onChange={onDialCodeChange}
					/>
				</div>
			)}

			{/*
			 * La casilla queda siempre a la vista: es lo único de esta tarjeta que
			 * escribe sobre clientes que ya existen, y su efecto se lee fila por fila
			 * en la vista previa. Escondida, esas filas dirían "se completa el email"
			 * sin que se vea de dónde sale ni cómo apagarlo.
			 */}
			<div className="flex items-center gap-2">
				<Checkbox
					id={checkboxId}
					checked={fillMissing}
					disabled={disabled}
					onCheckedChange={(checked) => onFillMissingChange(checked === true)}
				/>
				<Label htmlFor={checkboxId} className="font-normal">
					Completar los datos que falten en clientes que ya tengo
				</Label>
			</div>
		</section>
	);
};

export default ImportMappingCard;
