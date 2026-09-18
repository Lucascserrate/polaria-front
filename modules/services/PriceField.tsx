'use client';

import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { CURRENCY_OPTIONS } from '@/lib/currencies';
import { QUOTED_PRICE_LABEL } from '@/lib/money';

interface Props {
	/** El precio como lo escribe el usuario, sin convertir. */
	value: string;
	onChange: (value: string) => void;
	/** La de **este** servicio, no la del negocio. */
	currency: string;
	onCurrencyChange: (currency: string) => void;
	/** Si este servicio se cotiza en lugar de tener precio. */
	quoted: boolean;
	onQuotedChange: (quoted: boolean) => void;
	/** Lo inyecta `Field`. */
	id?: string;
}

/**
 * El precio y la moneda en la que se cobra.
 *
 * La moneda es de **este** servicio y no una configuración del negocio: una
 * psicóloga cobra las sesiones presenciales en bolivianos y las online para el
 * exterior en dólares, en el mismo catálogo. Un precio sin su moneda al lado no
 * es un precio.
 *
 * Va pegado al campo y no en otra pantalla porque es la única parte del producto
 * donde una moneda equivocada se ve. Mientras la moneda salía de la zona horaria
 * y nadie la miraba nunca, un negocio colombiano publicaba sus precios en
 * bolivianos sin enterarse.
 *
 * Se guarda con el servicio, con el botón de la cabecera: es parte del mismo
 * borrador que el precio, y abandonar la pantalla no deja nada escrito.
 *
 * La opción de cotizar está acá abajo y no en otra sección porque es una
 * respuesta a la misma pregunta: cuánto sale. Un salón que no puede poner precio
 * hasta ver el pelo llega a este campo, se traba y escribe cualquier número;
 * tenerla al lado es lo que evita ese número inventado.
 */
const PriceField: React.FC<Props> = ({
	value,
	onChange,
	currency,
	onCurrencyChange,
	quoted,
	onQuotedChange,
	id,
}) => {
	const quotedId = useId();

	return (
		<div className="space-y-2">
			<div className="flex gap-2">
				{/*
				 * Cotizado se dibuja la frase, no el input vacío ni el input
				 * deshabilitado: el primero invita a escribir algo que se va a
				 * descartar y el segundo deja a la vista el precio viejo en gris, que
				 * se sigue leyendo como el precio del servicio.
				 */}
				{quoted ? (
					<p
						id={id}
						className="border-input bg-muted/40 text-muted-foreground flex h-9 flex-1 items-center rounded-md border px-3 text-sm"
					>
						{QUOTED_PRICE_LABEL}
					</p>
				) : (
					<Input
						id={id}
						type="number"
						min="0"
						step="1"
						inputMode="decimal"
						className="flex-1"
						value={value}
						placeholder="0"
						onChange={(event) => onChange(event.target.value)}
					/>
				)}

				{/*
				 * La moneda queda incluso sin precio: es en la que se va a cotizar, y
				 * es la que va a proponer la cita cuando el negocio escriba el importe.
				 */}
				<Select value={currency} onValueChange={onCurrencyChange}>
					<SelectTrigger className="w-28 shrink-0" aria-label="Moneda">
						<SelectValue />
					</SelectTrigger>
					{/*
					 * Alto acotado y no la lista entera: son diecisiete monedas y el
					 * desplegable taparía la pantalla en un teléfono. Radix pone sus propios
					 * botones de desplazamiento, así que no hace falta rueda de mouse.
					 */}
					<SelectContent className="max-h-72">
						{CURRENCY_OPTIONS.map((option) => (
							<SelectItem key={option.code} value={option.code}>
								{option.code} · {option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<label
				htmlFor={quotedId}
				className="flex cursor-pointer items-start gap-2 text-sm"
			>
				<Checkbox
					id={quotedId}
					checked={quoted}
					onCheckedChange={(checked) => onQuotedChange(checked === true)}
					className="mt-0.5"
				/>
				<span className="text-muted-foreground">
					Este servicio necesita un diagnóstico previo: el precio se define
					cuando ves al cliente.
				</span>
			</label>
		</div>
	);
};

export default PriceField;
