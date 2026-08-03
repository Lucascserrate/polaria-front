import { ChevronDown, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
	getInitialTimezone,
	timezoneOptions,
} from '@/modules/tenants/utils/timezoneUtils';

interface Props {
	timezone: string;
	setTimezone: (timezone: string) => void;
}

const TimezoneInput: React.FC<Props> = ({ timezone, setTimezone }) => {
	const [timezonePickerOpen, setTimezonePickerOpen] = useState(false);
	const [timezoneSearch, setTimezoneSearch] = useState('');

	const filteredTimezones = useMemo(() => {
		const normalizedQuery = timezoneSearch.trim().toLowerCase();
		if (!normalizedQuery) return timezoneOptions();

		return timezoneOptions().filter((option) =>
			option.toLowerCase().includes(normalizedQuery),
		);
	}, [timezoneSearch]);

	useEffect(() => {
		if (timezone) {
			setTimezone(timezone);
		} else {
			setTimezone(getInitialTimezone());
		}
	}, [timezone, setTimezone]);

	return (
		<div className="overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
			<Popover open={timezonePickerOpen} onOpenChange={setTimezonePickerOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
					>
						<span className="truncate">
							{timezone || 'Selecciona una zona horaria'}
						</span>
						<ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-90 max-w-[calc(100vw-2rem)] p-0"
				>
					<div className="border-b p-2">
						<div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar zona horaria"
								value={timezoneSearch}
								onChange={(event) => setTimezoneSearch(event.target.value)}
								className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
							/>
						</div>
					</div>
					<div className="max-h-56 overflow-y-auto p-1">
						{filteredTimezones.map((option) => {
							const isSelected = option === timezone;
							return (
								<button
									type="button"
									key={option}
									className={cn(
										'flex w-full items-start rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
										isSelected && 'bg-accent text-accent-foreground',
									)}
									onClick={() => {
										setTimezone(option);
										setTimezoneSearch('');
										setTimezonePickerOpen(false);
									}}
								>
									<span className="font-medium">{option}</span>
								</button>
							);
						})}
						{filteredTimezones.length === 0 && (
							<div className="px-3 py-4 text-sm text-muted-foreground">
								No se encontraron resultados.
							</div>
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default TimezoneInput;
