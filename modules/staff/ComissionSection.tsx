import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
	commission: string;
	setCommission: (value: string) => void;
	commissionError: string | null;
}

const ComissionSection: React.FC<Props> = ({
	commission,
	setCommission,
	commissionError,
}) => {
	return (
		<div className="space-y-2">
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
					onChange={(e) => setCommission(e.target.value)}
					aria-invalid={Boolean(commissionError)}
				/>
				<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
					%
				</span>
			</div>
			{commissionError ? (
				<p className="text-sm text-red-600 mt-1">{commissionError}</p>
			) : (
				<p className="text-xs text-muted-foreground mt-1">
					Porcentaje de lo que factura. Déjalo vacío si no trabaja a comisión.
				</p>
			)}
		</div>
	);
};

export default ComissionSection;
