const getInitialTimezone = () =>
	Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/La_Paz';

const getTimezoneOptions = () => {
	if (
		typeof Intl !== 'undefined' &&
		typeof Intl.supportedValuesOf === 'function'
	) {
		const supported = Intl.supportedValuesOf('timeZone');
		if (supported && supported.length > 0) {
			return supported
				.filter((value): value is string => !!value)
				.sort((a, b) => a.localeCompare(b));
		}
	}

	return [getInitialTimezone()];
};
const timezoneOptions = () => getTimezoneOptions();

export { getInitialTimezone, timezoneOptions };
