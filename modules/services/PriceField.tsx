'use client';

import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { CURRENCY_OPTIONS } from '@/lib/currencies';

interface Props {
	/** El precio como lo escribe el usuario, sin convertir. */
	value: string;
	onChange: (value: string) => void;
	/** La de **este** servicio, no la del negocio. */
	currency: string;
	onCurrencyChange: (currency: string) => void;
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
 */
const PriceField: React.FC<Props> = ({
	value,
	onChange,
	currency,
	onCurrencyChange,
	id,
}) => (
	<div className="flex gap-2">
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
);

export default PriceField;
