export type PhoneCountry = {
	value: string;
	label: string;
	callingCode: string;
};

export const PHONE_COUNTRIES = [
	{ value: 'CO', label: 'Colombia', callingCode: '57' },
	{ value: 'MX', label: 'México', callingCode: '52' },
	{ value: 'AR', label: 'Argentina', callingCode: '54' },
	{ value: 'CL', label: 'Chile', callingCode: '56' },
	{ value: 'PE', label: 'Perú', callingCode: '51' },
	{ value: 'EC', label: 'Ecuador', callingCode: '593' },
	{ value: 'VE', label: 'Venezuela', callingCode: '58' },
	{ value: 'BR', label: 'Brasil', callingCode: '55' },
	{ value: 'BO', label: 'Bolivia', callingCode: '591' },
	{ value: 'PY', label: 'Paraguay', callingCode: '595' },
	{ value: 'UY', label: 'Uruguay', callingCode: '598' },
	{ value: 'CR', label: 'Costa Rica', callingCode: '506' },
	{ value: 'PA', label: 'Panamá', callingCode: '507' },
	{ value: 'GT', label: 'Guatemala', callingCode: '502' },
	{ value: 'DO', label: 'República Dominicana', callingCode: '1' },
	{ value: 'PR', label: 'Puerto Rico', callingCode: '1' },
	{ value: 'ES', label: 'España', callingCode: '34' },
	{ value: 'US', label: 'Estados Unidos', callingCode: '1' },
] as const satisfies readonly PhoneCountry[];

export const DEFAULT_PHONE_COUNTRY = 'CO' as const;

const PHONE_COUNTRY_BY_VALUE = new Map<string, PhoneCountry>(
	PHONE_COUNTRIES.map((country) => [country.value, country]),
);

const normalizePhoneDigits = (value: string) => value.replace(/\D/g, '');

const getPhoneCountryLabel = (countryCode: string) =>
	PHONE_COUNTRY_BY_VALUE.get(countryCode)?.label ?? countryCode;

const getPhoneCountryFlag = (countryCode: string) =>
	String.fromCodePoint(
		...Array.from(countryCode).map((char) => 127397 + char.charCodeAt(0)),
	);

const getPhoneCountryByValue = (value: string) =>
	PHONE_COUNTRY_BY_VALUE.get(value) ??
	PHONE_COUNTRY_BY_VALUE.get(DEFAULT_PHONE_COUNTRY)!;

const getPhoneOptions = () => PHONE_COUNTRIES;

const composeInternationalPhoneNumber = (
	countryCode: string,
	localDigits: string,
) => {
	const country = getPhoneCountryByValue(countryCode);
	const digits = normalizePhoneDigits(localDigits);
	return digits ? `+${country.callingCode}${digits}` : '';
};

const stripCurrentPhoneCallingCode = (value: string, countryCode: string) => {
	const country = getPhoneCountryByValue(countryCode);
	const digits = normalizePhoneDigits(value);

	if (!digits) return '';
	if (!digits.startsWith(country.callingCode)) return digits;

	return digits.slice(country.callingCode.length);
};

const splitInternationalPhoneNumber = (value?: string) => {
	if (!value) {
		return {
			phoneCountry: DEFAULT_PHONE_COUNTRY,
			phoneValue: '',
		};
	}

	const normalized = value.trim().replace(/[^\d+]/g, '');
	if (!normalized.startsWith('+')) {
		return {
			phoneCountry: DEFAULT_PHONE_COUNTRY,
			phoneValue: normalizePhoneDigits(normalized),
		};
	}

	const matchedCountry = PHONE_COUNTRIES
		.filter((country) => country.callingCode !== '1')
		.sort((a, b) => b.callingCode.length - a.callingCode.length)
		.find((country) => normalized.startsWith(`+${country.callingCode}`));

	if (!matchedCountry) {
		if (normalized.startsWith('+1')) {
			return {
				phoneCountry: 'US',
				phoneValue: normalizePhoneDigits(normalized.slice(2)),
			};
		}

		return {
			phoneCountry: DEFAULT_PHONE_COUNTRY,
			phoneValue: normalizePhoneDigits(normalized.slice(1)),
		};
	}

	return {
		phoneCountry: matchedCountry.value,
		phoneValue: normalizePhoneDigits(
			normalized.slice(matchedCountry.callingCode.length + 1),
		),
	};
};

const getInitialPhoneState = (value?: string) => splitInternationalPhoneNumber(value);

const getInitialPhoneCountry = (value?: string) =>
	getInitialPhoneState(value).phoneCountry;

const isSimpleInternationalPhoneNumber = (
	localDigits: string,
	countryCode: string,
) => {
	const country = getPhoneCountryByValue(countryCode);
	const digits = normalizePhoneDigits(localDigits);
	return !!country.value && digits.length >= 4 && digits.length <= 14;
};

export {
	composeInternationalPhoneNumber,
	getInitialPhoneCountry,
	getInitialPhoneState,
	getPhoneCountryByValue,
	getPhoneCountryFlag,
	getPhoneCountryLabel,
	getPhoneOptions,
	isSimpleInternationalPhoneNumber,
	normalizePhoneDigits,
	stripCurrentPhoneCallingCode,
	splitInternationalPhoneNumber,
};
