export type TimezoneGroup = {
	label: string;
	options: readonly string[];
};

export const TIMEZONE_GROUPS = [
	{
		label: 'España',
		options: ['Europe/Madrid', 'Atlantic/Canary'],
	},
	{
		label: 'Estados Unidos',
		options: [
			'America/New_York',
			'America/Chicago',
			'America/Denver',
			'America/Los_Angeles',
			'America/Anchorage',
			'Pacific/Honolulu',
		],
	},
	{
		label: 'Latinoamérica',
		options: [
			'America/Bogota',
			'America/Lima',
			'America/Guayaquil',
			'America/Caracas',
			'America/La_Paz',
			'America/Santiago',
			'America/Argentina/Buenos_Aires',
			'America/Asuncion',
			'America/Montevideo',
			'America/Sao_Paulo',
			'America/Costa_Rica',
			'America/Panama',
			'America/Guatemala',
			'America/Santo_Domingo',
			'America/Puerto_Rico',
			'America/Mexico_City',
		],
	},
] as const satisfies readonly TimezoneGroup[];

export const DEFAULT_TIMEZONE = 'America/La_Paz' as const;

const ALL_ALLOWED_TIMEZONES: readonly string[] = TIMEZONE_GROUPS.flatMap(
	(group) => group.options,
);

const getBrowserTimezone = () =>
	(typeof Intl !== 'undefined' &&
		Intl.DateTimeFormat().resolvedOptions().timeZone) ||
	DEFAULT_TIMEZONE;

const isAllowedTimezone = (timezone?: string) =>
	!!timezone && ALL_ALLOWED_TIMEZONES.includes(timezone);

const getInitialTimezone = () => {
	const browserTimezone = getBrowserTimezone();
	return isAllowedTimezone(browserTimezone) ? browserTimezone : DEFAULT_TIMEZONE;
};

export { getInitialTimezone, getBrowserTimezone, isAllowedTimezone };
