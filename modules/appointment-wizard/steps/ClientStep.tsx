'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
	value: string;
	onChange: (value: string) => void;
	/** Enter confirma el paso, para no obligar a ir al botón. */
	onConfirm: () => void;
}

const ClientStep: React.FC<Props> = ({ value, onChange, onConfirm }) => {
	return (
		<div className="space-y-2">
			<Label htmlFor="client-name">Nombre del cliente</Label>
			<Input
				id="client-name"
				autoFocus
				placeholder="Ingresa el nombre"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && value.trim()) onConfirm();
				}}
			/>
		</div>
	);
};

export default ClientStep;
