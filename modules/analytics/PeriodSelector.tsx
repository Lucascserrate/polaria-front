'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ReportPreset } from '@/types/reports.types';

const PRESET_LABELS: Array<{ preset: ReportPreset; label: string }> = [
	{ preset: 'today', label: 'Hoy' },
	{ preset: 'week', label: 'Esta semana' },
	{ preset: 'month', label: 'Este mes' },
	{ preset: 'custom', label: 'Personalizado' },
];

interface Props {
	preset: ReportPreset;
	from: string;
	to: string;
	onPresetChange: (preset: ReportPreset) => void;
	onFromChange: (from: string) => void;
	onToChange: (to: string) => void;
	error?: string | null;
}

const PeriodSelector: React.FC<Props> = ({
	preset,
	from,
	to,
	onPresetChange,
	onFromChange,
	onToChange,
	error,
}) => {
	return (
		<div className="space-y-3">
			<div className="flex flex-wrap gap-2">
				{PRESET_LABELS.map((option) => (
					<Button
						key={option.preset}
						type="button"
						size="sm"
						variant={preset === option.preset ? 'default' : 'outline'}
						onClick={() => onPresetChange(option.preset)}
					>
						{option.label}
					</Button>
				))}
			</div>

			{preset === 'custom' && (
				<div className="flex flex-wrap items-end gap-3">
					<div>
						<Label htmlFor="from">Desde</Label>
						<Input
							id="from"
							type="date"
							className="w-44"
							value={from}
							max={to || undefined}
							onChange={(e) => onFromChange(e.target.value)}
						/>
					</div>
					<div>
						<Label htmlFor="to">Hasta</Label>
						<Input
							id="to"
							type="date"
							className="w-44"
							value={to}
							min={from || undefined}
							onChange={(e) => onToChange(e.target.value)}
						/>
					</div>
				</div>
			)}

			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
};

export default PeriodSelector;
