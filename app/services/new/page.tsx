'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ROUTES } from '@/constants/routes';
import ServiceEditor from '@/modules/services/ServiceEditor';
import type { ServicePayload } from '@/modules/services/useServiceDraft';
import useCreateService from '@/services/services/useCreateService';
import useGetSettings from '@/services/settings/useGetSettings';

const NewServicePage = () => {
	const router = useRouter();
	const createService = useCreateService();
	const { data: settings } = useGetSettings();
	const [error, setError] = useState<string | null>(null);

	const handleSave = async (payload: ServicePayload) => {
		setError(null);

		try {
			await createService.mutateAsync({
				...payload,
				/*
				 * La zona la manda el navegador porque el DTO la exige, pero la que
				 * manda para la agenda es la del negocio: `Service.timezone` no se usa
				 * para calcular horarios —eso sale de `Tenant.timezone`—, así que acá
				 * solo hay que enviar algo válido.
				 */
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				isActive: true,
			});
			router.push(ROUTES.services);
		} catch (cause) {
			setError(
				axios.isAxiosError(cause) &&
					typeof cause.response?.data?.message === 'string'
					? cause.response.data.message
					: 'No se pudo crear el servicio. Intentá de nuevo.',
			);
		}
	};

	return (
		<ServiceEditor
			currency={settings?.currency ?? 'BOB'}
			saving={createService.isPending}
			error={error}
			onSave={(payload) => void handleSave(payload)}
		/>
	);
};

export default NewServicePage;
