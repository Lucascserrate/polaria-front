import { useQuery } from '@tanstack/react-query';
import { SETTINGS_KEY } from '@/modules/settings/utils/constants';
import { getSettings, SettingsResponse } from './settings.service';

const useGetSettings = () => {
	return useQuery<SettingsResponse>({
		queryKey: SETTINGS_KEY,
		queryFn: getSettings,
	});
};

export default useGetSettings;
