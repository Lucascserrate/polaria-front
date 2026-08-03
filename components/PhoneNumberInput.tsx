import PhoneInput from 'react-phone-number-input/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronDown, Search } from 'lucide-react';
import { getCountryCallingCode } from 'libphonenumber-js';
import { forwardRef, useMemo, useState } from 'react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import {
	countryOptions,
	getInitialPhoneCountry,
} from '@/modules/tenants/utils/phoneCountryUtils';

const PhoneInputField = forwardRef<
	HTMLInputElement,
	React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
	<Input
		ref={ref}
		type="tel"
		className={cn(
			'border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
			className,
		)}
		{...props}
	/>
));

PhoneInputField.displayName = 'PhoneInputField';

interface Props {
	whatsappPhoneNumber: string;
	phoneValue: string;
	setPhoneValue: (value: string) => void;
}

const PhoneNumberInput: React.FC<Props> = ({
	whatsappPhoneNumber,
	phoneValue,
	setPhoneValue,
}) => {
	const [phoneCountry, setPhoneCountry] = useState(() =>
		getInitialPhoneCountry(whatsappPhoneNumber),
	);
	const [countryPickerOpen, setCountryPickerOpen] = useState(false);
	const [countrySearch, setCountrySearch] = useState('');

	const filteredCountries = useMemo(() => {
		const normalizedQuery = countrySearch.trim().toLowerCase();
		const options = countryOptions();
		if (!normalizedQuery) return options;

		return options.filter((option) => {
			const query = normalizedQuery.replace(/\+/g, '');
			return (
				option.label.toLowerCase().includes(query) ||
				option.callingCode.toLowerCase().includes(query)
			);
		});
	}, [countrySearch]);

	return (
		<div className="flex gap-2 overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
			<Popover open={countryPickerOpen} onOpenChange={setCountryPickerOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="flex shrink-0 items-center gap-2 border-r border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
					>
						<span className="text-base leading-none">
							{String.fromCodePoint(
								...Array.from(phoneCountry).map(
									(char) => 127397 + char.charCodeAt(0),
								),
							)}
						</span>
						<span className="whitespace-nowrap">
							+{getCountryCallingCode(phoneCountry)}
						</span>
						<ChevronDown className="h-4 w-4 opacity-70" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-[320px] p-0">
					<div className="border-b p-2">
						<div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar país o código"
								value={countrySearch}
								onChange={(event) => setCountrySearch(event.target.value)}
								className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
							/>
						</div>
					</div>
					<div className="max-h-56 overflow-y-auto p-1">
						{filteredCountries.map((option) => {
							const isSelected = option.value === phoneCountry;
							return (
								<button
									type="button"
									key={option.value}
									className={cn(
										'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
										isSelected && 'bg-accent text-accent-foreground',
									)}
									onClick={() => {
										setPhoneCountry(option.value);
										setCountrySearch('');
										setCountryPickerOpen(false);
									}}
								>
									<span className="flex items-center gap-2">
										<span className="text-base leading-none">
											{String.fromCodePoint(
												...Array.from(option.value).map(
													(char) => 127397 + char.charCodeAt(0),
												),
											)}
										</span>
										<span className="font-medium">{option.label}</span>
									</span>
									<span className="text-muted-foreground">
										+{option.callingCode}
									</span>
								</button>
							);
						})}
						{filteredCountries.length === 0 && (
							<div className="px-3 py-4 text-sm text-muted-foreground">
								No se encontraron resultados.
							</div>
						)}
					</div>
				</PopoverContent>
			</Popover>
			<div className="flex-1">
				<PhoneInput
					international
					country={phoneCountry}
					value={phoneValue}
					onChange={(value) => setPhoneValue(value ?? '')}
					inputComponent={PhoneInputField}
					className="w-full"
					inputClassName="w-full border-0 bg-transparent px-3 py-2 text-sm shadow-none outline-none focus-visible:ring-0"
					placeholder="Ej. 71234567"
				/>
			</div>
		</div>
	);
};

export default PhoneNumberInput;
