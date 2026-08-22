'use client';

import {
	Flower2,
	Scissors,
	Smile,
	Sparkles,
	Store,
	Syringe,
	type LucideIcon,
} from 'lucide-react';
import { BUSINESS_TYPE_OPTIONS } from '../constants';

/**
 * Un icono por rubro.
 *
 * Vive acá y no en las constantes compartidas porque es presentación: el código
 * del rubro viaja al backend, el dibujo no sale de esta pantalla.
 */
const ICONS: Record<string, LucideIcon> = {
	BARBERSHOP: Scissors,
	SALON: Sparkles,
	SPA: Flower2,
	AESTHETIC_MEDICINE: Syringe,
	DENTAL_CLINIC: Smile,
	OTHER: Store,
};

interface Props {
	value: string;
	onChange: (value: string) => void;
}

/**
 * Rubro del negocio, como tarjetas.
 *
 * Tarjetas y no un desplegable: son seis opciones conocidas y la elección es de
 * reconocimiento, no de búsqueda. Un `select` esconde las opciones detrás de un
 * toque y obliga a leerlas en fila; acá se ven todas juntas y se elige de una.
 */
const BusinessTypeStep: React.FC<Props> = ({ value, onChange }) => {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
			{BUSINESS_TYPE_OPTIONS.map((option) => {
				const Icon = ICONS[option.value] ?? Store;
				const selected = option.value === value;

				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={selected}
						onClick={() => onChange(option.value)}
						className={`flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border p-3 text-center transition-colors ${
							selected
								? 'border-foreground bg-accent'
								: 'border-border bg-card hover:border-foreground/40'
						}`}
					>
						<Icon
							className={`h-7 w-7 ${
								selected ? 'text-foreground' : 'text-muted-foreground'
							}`}
						/>
						<span className="text-sm font-medium leading-tight">
							{option.label}
						</span>
					</button>
				);
			})}
		</div>
	);
};

export default BusinessTypeStep;
