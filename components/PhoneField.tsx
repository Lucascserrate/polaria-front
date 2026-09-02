'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	countryForDial,
	searchCountries,
	splitPhone,
	type Country,
} from '@/lib/countries';
import { cn } from '@/lib/utils';

interface Props {
	/**
	 * El teléfono completo: `+59170123456`, o los dígitos solos cuando no se
	 * pudo reconocer el país de un número ya guardado.
	 */
	value: string;
	onChange: (value: string) => void;
	/** Prefijo con el que arranca un teléfono nuevo. El del negocio, sin `+`. */
	defaultDial?: string;
	id?: string;
	autoFocus?: boolean;
	disabled?: boolean;
}

/**
 * Un teléfono: el país aparte, el número aparte.
 *
 * Reemplaza al campo suelto con el cartelito de "si no ponés país, se asume
 * +591". Ese cartel escondía una adivinanza del backend —anteponer el prefijo
 * del negocio salvo que los dígitos "parecieran" traer país— y la adivinanza
 * fallaba justo donde más caro sale: en un negocio argentino, un número local
 * que empieza con 54 se leía como internacional y se guardaba mal. Un teléfono
 * equivocado no se nota nunca; se nota el día que el cliente no aparece porque
 * el recordatorio se fue a ninguna parte.
 *
 * Ahora el país se elige y el valor sale siempre con `+`, que es el camino del
 * backend que no tiene heurística: se respeta tal cual.
 */
const PhoneField: React.FC<Props> = ({
	value,
	onChange,
	defaultDial,
	id,
	autoFocus,
	disabled = false,
}) => {
	/*
	 * El país y el número viven acá y no se derivan de `value` en cada render.
	 *
	 * Derivarlos parece más limpio y rompe al escribir: con Estados Unidos
	 * elegido, tipear "868" arma `+1868`, que releído es Trinidad y Tobago —el
	 * selector saltaría de país solo, en medio de una palabra. El valor compuesto
	 * es ambiguo; la elección de quien lo escribe no.
	 */
	const initial = useMemo(() => {
		const parsed = splitPhone(value);

		// Sin número todavía no hay nada que reconocer: arranca en el país del
		// negocio, que es de donde va a ser casi siempre.
		if (!value.trim()) return { dial: defaultDial ?? '', national: '' };

		return parsed;
		// Se calcula una sola vez, al montar: ver el comentario de arriba.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [dial, setDial] = useState(initial.dial);
	const [national, setNational] = useState(initial.national);

	const emit = (nextDial: string, nextNational: string) => {
		const digits = nextNational.replace(/\D/g, '');

		if (!digits) return onChange('');

		// Sin país reconocido se emiten los dígitos crudos: es un número que ya
		// estaba guardado así, y anteponerle un prefijo lo cambiaría solo por
		// haber abierto la ficha.
		onChange(nextDial ? `+${nextDial}${digits}` : digits);
	};

	return (
		<div className="flex gap-2">
			<CountryPicker
				dial={dial}
				disabled={disabled}
				onSelect={(country) => {
					setDial(country.dial);
					emit(country.dial, national);
				}}
			/>

			<Input
				id={id}
				autoFocus={autoFocus}
				disabled={disabled}
				value={national}
				inputMode="tel"
				placeholder="70123456"
				className="flex-1 tabular-nums"
				onChange={(event) => {
					// Sólo dígitos: el separador que alguien escriba se pierde igual al
					// guardar, y verlo desaparecer al salir del campo se lee como un error.
					const digits = event.target.value.replace(/\D/g, '');
					setNational(digits);
					emit(dial, digits);
				}}
			/>
		</div>
	);
};

/**
 * El desplegable de países.
 *
 * Se busca por nombre y también por prefijo: quien sabe que es "+54" no tiene
 * por qué acordarse de cómo se escribe el país, y al revés.
 *
 * Se recorre sin la rueda del mouse —flechas, Inicio y Fin mueven el foco, y la
 * barra de scroll de Polaria es visible y agarrable— porque hay negocios con
 * mouses sin rueda, y una lista de doscientos países que sólo se recorra rodando
 * es una lista a la que no llegan.
 */
const CountryPicker: React.FC<{
	dial: string;
	disabled: boolean;
	onSelect: (country: Country) => void;
}> = ({ dial, disabled, onSelect }) => {
	const [open, setOpen] = useState(false);
	const [term, setTerm] = useState('');
	const listRef = useRef<HTMLDivElement>(null);

	const selected = countryForDial(dial);

	const matches = useMemo(() => searchCountries(term), [term]);

	/* El país actual queda a la vista al abrir, sin tener que buscarlo. */
	useEffect(() => {
		if (!open) return;

		listRef.current
			?.querySelector('[data-selected="true"]')
			?.scrollIntoView({ block: 'center' });
	}, [open]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

		const buttons = Array.from(
			listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [],
		);
		if (buttons.length === 0) return;

		event.preventDefault();

		const current = buttons.indexOf(
			document.activeElement as HTMLButtonElement,
		);
		const next =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? buttons.length - 1
					: event.key === 'ArrowDown'
						? Math.min(current + 1, buttons.length - 1)
						: Math.max(current - 1, 0);

		buttons[current === -1 ? 0 : next]?.focus();
	};

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setTerm('');
			}}
		>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					aria-label={
						selected
							? `País del teléfono: ${selected.name}`
							: 'Elegir el país del teléfono'
					}
					className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 shrink-0 items-center gap-1.5 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{selected ? (
						<>
							<span aria-hidden="true">{selected.flag}</span>
							<span className="tabular-nums">+{selected.dial}</span>
						</>
					) : (
						<span className="text-muted-foreground">País</span>
					)}
					<ChevronDown className="size-3.5 text-muted-foreground" />
				</button>
			</PopoverTrigger>

			{/*
			 * Sin portal: este campo vive dentro del diálogo de alta de cliente, y un
			 * popover portaleado queda fuera de la excepción de scroll que Radix le
			 * da al diálogo. La rueda del mouse dejaba de funcionar sobre la lista.
			 */}
			<PopoverContent portal={false} align="start" className="w-72 p-0">
				<div className="relative border-b border-border p-2">
					<Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						autoFocus
						value={term}
						className="h-9 pl-8"
						placeholder="Buscar país o prefijo"
						aria-label="Buscar país"
						onChange={(event) => setTerm(event.target.value)}
					/>
				</div>

				{matches.length === 0 ? (
					<p className="p-3 text-center text-sm text-muted-foreground">
						Ningún país coincide.
					</p>
				) : (
					<div
						ref={listRef}
						role="listbox"
						aria-label="Países"
						tabIndex={-1}
						onKeyDown={handleKeyDown}
						className="max-h-72 overflow-y-auto p-1"
					>
						{matches.map((country) => {
							const isSelected = country.iso === selected?.iso;

							return (
								<button
									key={country.iso}
									type="button"
									role="option"
									aria-selected={isSelected}
									data-selected={isSelected}
									onClick={() => {
										onSelect(country);
										setOpen(false);
										setTerm('');
									}}
									className={cn(
										'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
										isSelected
											? 'bg-primary font-medium text-primary-foreground'
											: 'hover:bg-muted',
									)}
								>
									<span aria-hidden="true">{country.flag}</span>
									<span className="min-w-0 flex-1 truncate">
										{country.name}
									</span>
									<span
										className={cn(
											'shrink-0 tabular-nums',
											isSelected ? 'opacity-80' : 'text-muted-foreground',
										)}
									>
										+{country.dial}
									</span>
								</button>
							);
						})}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default PhoneField;
