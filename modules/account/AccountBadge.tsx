'use client';

import useGetAccount from '@/services/account/useGetAccount';

const AccountBadge: React.FC = () => {
	const { data } = useGetAccount();

	if (!data) return null;

	return (
		<div className="flex items-center">
			<div className="min-w-0 collapsed:hidden">
				{data.email && (
					<p className="truncate text-xs text-muted-foreground">{data.email}</p>
				)}
			</div>
		</div>
	);
};

export default AccountBadge;
