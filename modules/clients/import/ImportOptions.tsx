'use client';

import { useId, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { COUNTRIES, countryForDial, type Country } from '@/lib/countries';

interface Props {
	dialCode: string;
	fillMissing: boolean;
	disabled?: boolean;
	onDialCodeChange: (dialCode: string) => void;
	onFillMissingChange: (fillMissing: boolean) => void;
}

/**
 * Las dos decisiones que cambian el resultado y no salen del archivo.
 *
 * **El prefijo** es la única forma de leer un `70123456` suelto, que es como
 * está guardada media agenda de teléfono. Arranca en el país del negocio y se
 * puede cambiar porque una agenda vieja puede ser de otro país: los mismos ocho
 * dígitos son de una persona distinta según lo que se les ponga adelante.
 *
 * **Completar datos** sólo llena lo que está vacío y nunca pisa lo que ya hay.
 * Va encendida porque completar un email que falta no destruye nada, y se puede
 * apagar porque la ficha de Polaria suele estar más al día que el contacto del
 * teléfono.
 */
const ImportOptions: React.FC<Props> = ({
	dialCode,
	fillMissing,
	disabled,
	onDialCodeChange,
	onFillMissingChange,
}) => {
	const selectId = useId();
	const checkboxId = useId();

	/*
	 * Un país por prefijo. Varios países comparten el suyo —`+1` son veinte— y
	 * Radix identifica cada opción por su valor: dos opciones con el mismo valor
	 * se seleccionan juntas. Se elige el país principal de cada prefijo, que es
	 * el mismo criterio que usa el campo de teléfono.
	 */
	const options = useMemo(() => {
		const byDial = new Map<string, Country>();

		COUNTRIES.forEach((country) => {
			if (!byDial.has(country.dial)) {
				byDial.set(country.dial, countryForDial(country.dial) ?? country);
			}
		});

		return [...byDial.values()].sort((a, b) =>
			a.name.localeCompare(b.name, 'es'),
		);
	}, []);

	return (
		<div className="flex flex-wrap items-end gap-4 sm:gap-6">
			{/* Ancho completo en un teléfono: con ancho fijo se salía de la pantalla. */}
			<div className="w-full sm:w-auto">
				<Label htmlFor={selectId} className="mb-1.5 block">
					Números sin código de país
				</Label>

				<Select
					value={dialCode}
					disabled={disabled}
					onValueChange={onDialCodeChange}
				>
					<SelectTrigger id={selectId} className="w-full sm:w-64">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{options.map((country) => (
							<SelectItem key={country.dial} value={country.dial}>
								{country.flag} {country.name} +{country.dial}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2 sm:pb-2">
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
		</div>
	);
};

export default ImportOptions;
