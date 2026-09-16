'use client';

import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { CURRENCY_OPTIONS } from '@/lib/currencies';
import { formatMoney } from '@/lib/money';

interface Props {
	value: string;
	onChange: (currency: string) => void;
	disabled?: boolean;
}

/**
 * Moneda del negocio.
 *
 * El lugar donde se corrige de verdad es el precio del servicio —ver
 * `PriceField`—, porque es ahí donde una moneda equivocada se ve. Acá está por
 * la misma razón que la zona horaria: quien viene a revisar los datos de su
 * negocio espera encontrarla, y no todos los negocios llegan al catálogo de
 * servicios el mismo día que se registran.
 *
 * Se muestra un precio de ejemplo formateado porque el código no alcanza para
 * confirmar la elección: `BOB` y `COP` son tres letras cualquiera hasta que uno
 * ve "Bs 45.000" y "$ 45.000".
 */
const CurrencySelect: React.FC<Props> = ({ value, onChange, disabled }) => (
	<div className="space-y-2">
		<Label htmlFor="currency">Moneda</Label>
		<Select value={value} disabled={disabled} onValueChange={onChange}>
			<SelectTrigger id="currency">
				<SelectValue />
			</SelectTrigger>
			{/* Diecisiete monedas no entran en pantalla: Radix pone sus botones de
			    desplazamiento, así que no hace falta rueda de mouse. */}
			<SelectContent className="max-h-72">
				{CURRENCY_OPTIONS.map((option) => (
					<SelectItem key={option.code} value={option.code}>
						{option.code} · {option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
		<p className="text-sm text-muted-foreground">
			{`Tus precios se muestran así: ${formatMoney(45_000, value)}.`}
		</p>
	</div>
);

export default CurrencySelect;
