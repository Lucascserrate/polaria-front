import type { Tenant, TenantStatus } from '@/types/tenant.types';

import { getInitialPhoneState, getPhoneCountryByValue } from './phoneUtils';
import {
	DEFAULT_TENANT_AI_ENABLED,
	DEFAULT_TENANT_STATUS,
} from './tenantDefaults';
import { DEFAULT_TIMEZONE, getInitialTimezone, isAllowedTimezone } from './timezoneUtils';

type TenantFormState = {
	name: string;
	email: string;
	phoneCountry: string;
	phoneValue: string;
	businessType: string;
	whatsappPhoneId: string;
	whatsappAccessToken: string;
	timezone: string;
	status: TenantStatus;
	aiEnabled: boolean;
};

const getInitialFormState = (initialTenant?: Tenant | null): TenantFormState => {
	const phoneState = getInitialPhoneState(initialTenant?.whatsappPhoneNumber);

	return {
		name: initialTenant?.name ?? '',
		email: initialTenant?.email ?? '',
		phoneCountry: getPhoneCountryByValue(phoneState.phoneCountry).value,
		phoneValue: phoneState.phoneValue,
		businessType: initialTenant?.businessType ?? '',
		whatsappPhoneId: initialTenant?.whatsappPhoneId ?? '',
		whatsappAccessToken: initialTenant?.whatsappAccessToken ?? '',
		timezone: isAllowedTimezone(initialTenant?.timezone)
			? initialTenant?.timezone ?? DEFAULT_TIMEZONE
			: getInitialTimezone(),
		status: initialTenant?.status ?? DEFAULT_TENANT_STATUS,
		aiEnabled: initialTenant?.aiEnabled ?? DEFAULT_TENANT_AI_ENABLED,
	};
};

export type { TenantFormState };
export { getInitialFormState };
