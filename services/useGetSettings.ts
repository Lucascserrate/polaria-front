import { useQuery } from '@tanstack/react-query';
import { getSettings, type SettingsResponse } from '@/services/settings';

const useGetSettings = () => {
	return useQuery<SettingsResponse>({
		queryKey: ['settings'],
		queryFn: getSettings,
	});
};

export default useGetSettings;
