'use client';

import {
	Activity,
	Armchair,
	Brush,
	Dog,
	Dumbbell,
	Eye,
	Flower2,
	HandHelping,
	LayoutGrid,
	PenTool,
	Scissors,
	Smile,
	Sparkles,
	Stethoscope,
	Sun,
	Syringe,
	Zap,
	type LucideIcon,
} from 'lucide-react';
import { BUSINESS_TYPE_OPTIONS } from '../constants';

const ICONS: Record<string, LucideIcon> = {
	HAIR_SALON: Scissors,
	NAIL_SALON: Brush,
	BROWS_LASHES: Eye,
	SALON: Sparkles,
	AESTHETIC_MEDICINE: Syringe,
	BARBERSHOP: Armchair,
	MASSAGE: HandHelping,
	SPA: Flower2,
	WAXING: Zap,
	TATTOO_PIERCING: PenTool,
	TANNING: Sun,
	FITNESS: Dumbbell,
	PHYSIOTHERAPY: Activity,
	HEALTH_CLINIC: Stethoscope,
	DENTAL_CLINIC: Smile,
	PET_GROOMING: Dog,
	OTHER: LayoutGrid,
};

interface Props {
	value: string;
	onChange: (value: string) => void;
}

const BusinessTypeStep: React.FC<Props> = ({ value, onChange }) => {
	return (
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{BUSINESS_TYPE_OPTIONS.map((option) => {
				const Icon = ICONS[option.value] ?? LayoutGrid;
				const selected = option.value === value;

				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={selected}
						onClick={() => onChange(option.value)}
						className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
							selected
								? 'border-foreground bg-accent'
								: 'border-border bg-card hover:border-foreground/40'
						}`}
					>
						<Icon
							className={`h-5 w-5 shrink-0 ${
								selected ? 'text-foreground' : 'text-muted-foreground'
							}`}
						/>
						<span className="text-xs font-medium leading-tight">
							{option.label}
						</span>
					</button>
				);
			})}
		</div>
	);
};

export default BusinessTypeStep;
