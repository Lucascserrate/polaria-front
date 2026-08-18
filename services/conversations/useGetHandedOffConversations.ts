import { useQuery } from '@tanstack/react-query';
import {
	HANDOFF_KEY,
	HANDOFF_REFETCH_MS,
} from '@/modules/conversations/constants';
import { getHandedOffConversations } from './conversations.service';

const useGetHandedOffConversations = () => {
	return useQuery({
		queryKey: HANDOFF_KEY,
		queryFn: getHandedOffConversations,
		refetchInterval: HANDOFF_REFETCH_MS,
	});
};

export default useGetHandedOffConversations;
