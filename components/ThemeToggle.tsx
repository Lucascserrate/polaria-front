'use client';

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';

import {
	setThemePreference,
	type ThemePreference,
} from '@/components/theme-preference';
import { useThemePreference } from '@/components/use-theme-preference';
import { cn } from '@/lib/utils';

interface Option {
	value: ThemePreference;
	label: string;
	icon: LucideIcon;
}

/**
 * "Sistema" va primero porque es el valor por defecto, y el orden de las otras
 * dos va de claro a oscuro: leído de izquierda a derecha, el control cuenta la
 * misma historia que hace.
 */
const OPTIONS: Option[] = [
	{ value: 'system', label: 'Sistema', icon: Monitor },
	{ value: 'light', label: 'Claro', icon: Sun },
	{ value: 'dark', label: 'Oscuro', icon: Moon },
];

interface Props {
	className?: string;
}

/**
 * El selector de tema.
 *
 * Son tres botones a la vista y no un interruptor que alterna, porque con dos
 * estados visibles —prendido y apagado— no hay dónde poner el tercero: "seguir
 * al sistema" no es un punto medio entre claro y oscuro, es otra cosa. Un
 * interruptor obligaría a esconderlo detrás de un menú, y es justo el que viene
 * elegido de fábrica.
 *
 * Cada opción dice su nombre debajo del ícono. Un sol y una luna se entienden,
 * pero el monitor de "sistema" no se adivina, y la alternativa —descubrirlo
 * pasando el mouse por encima— no sirve en los negocios que atienden con una
 * computadora sin rueda de mouse, donde nadie va a pasear el cursor para leer un
 * globito.
 */
const ThemeToggle: React.FC<Props> = ({ className }) => {
	const preference = useThemePreference();

	return (
		<div
			role="radiogroup"
			aria-label="Tema"
			className={cn(
				'flex gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5',
				className,
			)}
		>
			{OPTIONS.map((option) => {
				const Icon = option.icon;
				const selected = preference === option.value;

				return (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={selected}
						title={option.label}
						onClick={() => setThemePreference(option.value)}
						className={cn(
							'flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[11px] font-medium transition-colors',
							selected
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
						)}
					>
						<Icon className="size-4 shrink-0" aria-hidden="true" />
						<span>{option.label}</span>
					</button>
				);
			})}
		</div>
	);
};

export default ThemeToggle;
