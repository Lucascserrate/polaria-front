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
	/** La del negocio, no la del servicio: ver el comentario de abajo. */
	currency: string;
	onCurrencyChange: (currency: string) => void;
	/** Lo inyecta `Field`. */
	id?: string;
}

/**
 * El precio y la moneda en la que se escribe.
 *
 * La moneda es del negocio, no de este servicio: se guarda en el tenant y la
 * comparten todos los precios. Aun así el selector vive **acá** y no en una
 * pantalla de configuración, porque una moneda equivocada no se ve en ningún
 * lado salvo al lado de un precio. Mientras no estuvo acá, un negocio colombiano
 * publicaba sus precios en bolivianos sin enterarse: el sistema deducía la
 * moneda de la zona horaria y nadie la veía nunca para desmentirla.
 *
 * Por eso se guarda apenas se elige, y no junto al servicio: el servicio se
 * guarda con el botón de la cabecera y se puede abandonar a medio escribir; la
 * moneda del negocio no es parte de ese borrador.
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
