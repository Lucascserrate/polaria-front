'use client';

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import {
	DEFAULT_TIMEZONE,
	TIMEZONE_GROUPS,
	isAllowedTimezone,
} from '@/modules/tenants/utils/timezoneUtils';

interface Props {
	timezone: string;
	setTimezone: (timezone: string) => void;
}

const TimezoneInput: React.FC<Props> = ({ timezone, setTimezone }) => {
	const value = isAllowedTimezone(timezone) ? timezone : DEFAULT_TIMEZONE;

	return (
		<Select value={value} onValueChange={setTimezone}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder="Selecciona una zona horaria" />
			</SelectTrigger>
			<SelectContent>
				{TIMEZONE_GROUPS.map((group, index) => (
					<div key={group.label}>
						<SelectGroup>
							<SelectLabel>{group.label}</SelectLabel>
							{group.options.map((option) => (
								<SelectItem key={option} value={option}>
									{option}
								</SelectItem>
							))}
						</SelectGroup>
						{index < TIMEZONE_GROUPS.length - 1 && <SelectSeparator />}
					</div>
				))}
			</SelectContent>
		</Select>
	);
};

export default TimezoneInput;
