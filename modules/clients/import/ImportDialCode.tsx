'use client';

import { useId, useMemo } from 'react';
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
	disabled?: boolean;
	onChange: (dialCode: string) => void;
}

/**
 * Con qué país se leen los números que no traen uno.
 *
 * Es la única forma de interpretar un `70123456` suelto, que es como está
 * guardada media agenda de teléfono. Arranca en el país del negocio y se puede
 * cambiar porque una agenda vieja puede ser de otro país: los mismos ocho
 * dígitos son de una persona distinta según lo que se les ponga adelante.
 */
const ImportDialCode: React.FC<Props> = ({ dialCode, disabled, onChange }) => {
	const id = useId();

	/*
	 * Un país por prefijo. Varios comparten el suyo —`+1` son veinte— y Radix
	 * identifica cada opción por su valor: dos opciones con el mismo valor se
	 * seleccionan juntas. Se elige el país principal de cada prefijo, que es el
	 * mismo criterio que usa el campo de teléfono.
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
		<div className="w-full sm:w-64">
			<Label htmlFor={id} className="mb-1.5 block">
				Números sin código de país
			</Label>

			<Select value={dialCode} disabled={disabled} onValueChange={onChange}>
				<SelectTrigger id={id} className="w-full">
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
	);
};

export default ImportDialCode;
