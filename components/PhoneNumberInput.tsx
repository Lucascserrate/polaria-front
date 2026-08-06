'use client';

import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import {
	DEFAULT_PHONE_COUNTRY,
	getPhoneCountryByValue,
	getPhoneCountryFlag,
	getPhoneOptions,
	normalizePhoneDigits,
} from '@/modules/tenants/utils/phoneUtils';

interface Props {
	phoneCountry: string;
	phoneValue: string;
	onPhoneCountryChange: (value: string) => void;
	onPhoneValueChange: (value: string) => void;
}

const PhoneNumberInput = ({
	phoneCountry,
	phoneValue,
	onPhoneCountryChange,
	onPhoneValueChange,
}: Props) => {
	const selectedCountry = getPhoneCountryByValue(
		phoneCountry || DEFAULT_PHONE_COUNTRY,
	);

	return (
		<div className="flex overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
			<Select
				value={selectedCountry.value}
				onValueChange={(value) => {
					const nextCountry = getPhoneCountryByValue(value);
					onPhoneCountryChange(nextCountry.value);
				}}
			>
				<SelectTrigger className="w-42.5 shrink-0 rounded-none border-0 border-r border-input bg-muted/40 px-3">
					<span className="flex items-center gap-2">
						<span className="text-base leading-none">
							{getPhoneCountryFlag(selectedCountry.value)}
						</span>
						<span className="whitespace-nowrap">
							+{selectedCountry.callingCode} {selectedCountry.label}
						</span>
					</span>
				</SelectTrigger>
				<SelectContent>
					{getPhoneOptions().map((option) => (
						<SelectItem key={option.value} value={option.value}>
							<span className="flex items-center gap-2">
								<span className="text-base leading-none">
									{getPhoneCountryFlag(option.value)}
								</span>
								<span className="whitespace-nowrap">
									+{option.callingCode} {option.label}
								</span>
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="flex-1">
				<Input
					type="tel"
					inputMode="numeric"
					pattern="[0-9]*"
					value={phoneValue}
					onChange={(event) =>
						onPhoneValueChange(normalizePhoneDigits(event.target.value))
					}
					className="rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
					placeholder="Escribe el número"
				/>
			</div>
		</div>
	);
};

export default PhoneNumberInput;
