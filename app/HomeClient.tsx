'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/modules/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function HomeClient() {
	const router = useRouter();
	const { isLoading, isError } = useAuth();

	useEffect(() => {
		if (isLoading) return;

		if (isError) {
			router.replace(ROUTES.auth);
		} else {
			router.replace(ROUTES.dashboard);
		}
	}, [isLoading, isError, router]);

	return null;
}
