'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SectionHeader from '../SectionHeader';

interface Props {
	commission: string;
	onChange: (value: string) => void;
	error?: string;
}

/**
 * La comisión, en su propia sección.
 *
 * Es un solo campo y por eso la sección se ve vacía, pero el lugar está tomado a
 * propósito: la comisión es lo que se va a complicar primero —tasas por servicio,
 * fijos, liquidaciones— y cuando eso pase va a crecer acá adentro en lugar de
 * empujar al resto del formulario.
 */
const CommissionSection: React.FC<Props> = ({
	commission,
	onChange,
	error,
}) => (
	<div className="space-y-6">
		<SectionHeader
			title="Comisiones"
			description="Qué parte de lo que factura le corresponde."
		/>

		<div className="max-w-xs space-y-2">
			<Label htmlFor="commission">Comisión</Label>
			<div className="relative">
				<Input
					id="commission"
					type="number"
					min="0"
					max="100"
					step="0.5"
					inputMode="decimal"
					placeholder="0"
					className="pr-8"
					value={commission}
					onChange={(event) => onChange(event.target.value)}
					aria-invalid={Boolean(error)}
				/>
				<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
					%
				</span>
			</div>

			{error ? (
				<p className="text-sm text-destructive">{error}</p>
			) : (
				<p className="text-xs text-muted-foreground">
					Porcentaje de lo que factura. Dejalo vacío si no trabaja a comisión.
				</p>
			)}
		</div>

		<p className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
			La comisión se aplica siempre con su valor vigente, así que los reportes
			la informan como estimada.
		</p>
	</div>
);

export default CommissionSection;
