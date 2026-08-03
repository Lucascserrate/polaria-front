import { parsePhoneNumber } from 'libphonenumber-js';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';

const getInitialPhoneCountry = (value: string) => {
	if (!value) return 'BO';

	try {
		const parsedPhone = parsePhoneNumber(value);
		return parsedPhone?.country ?? 'BO';
	} catch {
		return 'BO';
	}
};

const getCountryLabel = (countryCode: string) => {
	try {
		const displayNames = new Intl.DisplayNames(['es'], { type: 'region' });
		return displayNames.of(countryCode) ?? countryCode;
	} catch {
		return countryCode;
	}
};

const countryOptions = () =>
	getCountries().map((countryCode) => ({
		value: countryCode,
		label: getCountryLabel(countryCode),
		callingCode: getCountryCallingCode(countryCode),
	}));

export { getInitialPhoneCountry, countryOptions };
