'use client';

import { useId } from 'react';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { ImportMappingApi } from '@/types/clients-import.types';

type Field = keyof ImportMappingApi;

interface Props {
	headers: string[];
	/** El mapeo que está en uso: lo detectado más lo que se haya corregido. */
	mapping: ImportMappingApi;
	/** Lo que se detectó solo, para poder volver a elegirlo después de cambiarlo. */
	detected: ImportMappingApi;
	disabled?: boolean;
	onChange: (field: Field, columns: string[]) => void;
}

/** Lo que significa "ninguna columna". Un valor vacío rompe a Radix Select. */
const NONE = '__none__';

/** El identificador de la opción combinada, que vale por varias columnas. */
const COMBINED = '__combined__';

const FIELDS: { field: Field; label: string; hint: string }[] = [
	{
		field: 'nameColumns',
		label: 'Nombre',
		hint: 'Se unen en un solo nombre, en ese orden.',
	},
	{
		field: 'phoneColumns',
		label: 'Teléfono',
		hint: 'Si un contacto no tiene la primera, se usa la siguiente.',
	},
	{
		field: 'emailColumns',
		label: 'Email',
		hint: 'Si un contacto no tiene la primera, se usa la siguiente.',
	},
];

/**
 * Qué columna del archivo es cada dato.
 *
 * Se muestra siempre, incluso cuando la detección acertó de una. No es para
 * corregir errores: es para que el negocio vea de dónde salió cada dato antes de
 * confirmar mil fichas. "Detectamos todo bien, confiá" no es algo que se pueda
 * verificar; "el teléfono sale de `Phone 1 - Value`", sí.
 *
 * Cambiar cualquiera de los tres vuelve a pedir el análisis al servidor. La
 * cuenta de nuevos, repetidos y omitidos depende de qué columna se lea, y
 * recalcularla en el navegador sería tener dos respuestas distintas a la misma
 * pregunta.
 */
const ImportColumnMapping: React.FC<Props> = ({
	headers,
	mapping,
	detected,
	disabled,
	onChange,
}) => (
	<div className="grid gap-4 sm:grid-cols-3">
		{FIELDS.map(({ field, label, hint }) => (
			<ColumnSelect
				key={field}
				label={label}
				hint={mapping[field].length > 1 ? hint : undefined}
				headers={headers}
				selected={mapping[field]}
				detected={detected[field]}
				disabled={disabled}
				required={field === 'phoneColumns'}
				onChange={(columns) => onChange(field, columns)}
			/>
		))}
	</div>
);

const ColumnSelect: React.FC<{
	label: string;
	hint?: string;
	headers: string[];
	selected: string[];
	detected: string[];
	disabled?: boolean;
	required?: boolean;
	onChange: (columns: string[]) => void;
}> = ({
	label,
	hint,
	headers,
	selected,
	detected,
	disabled,
	required,
	onChange,
}) => {
	const id = useId();

	/*
	 * La opción combinada se ofrece mientras la detección haya encontrado más de
	 * una columna, esté elegida o no: quien la cambia por una sola tiene que
	 * poder volver, y si dependiera de lo que está elegido desaparecería justo
	 * después de dejar de usarla.
	 */
	const combined = detected.length > 1 ? detected : null;

	const value =
		selected.length === 0
			? NONE
			: selected.length === 1
				? selected[0]
				: COMBINED;

	const handleChange = (next: string) => {
		if (next === NONE) return onChange([]);
		if (next === COMBINED) return onChange(combined ?? []);
		onChange([next]);
	};

	return (
		<div>
			<Label htmlFor={id} className="mb-1.5 block">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</Label>

			<Select value={value} disabled={disabled} onValueChange={handleChange}>
				<SelectTrigger id={id} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{combined && (
						<SelectItem value={COMBINED}>{combined.join(' + ')}</SelectItem>
					)}
					{/*
					 * Sin columnas vacías ni repetidas: Radix usa el valor como
					 * identidad de la opción, y una cadena vacía o dos iguales lo
					 * rompen. Un CSV real trae las dos cosas.
					 */}
					{[...new Set(headers.filter((header) => header.trim() !== ''))].map(
						(header) => (
							<SelectItem key={header} value={header}>
								{header}
							</SelectItem>
						),
					)}
					<SelectItem value={NONE}>Sin asignar</SelectItem>
				</SelectContent>
			</Select>

			{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
		</div>
	);
};

export default ImportColumnMapping;
