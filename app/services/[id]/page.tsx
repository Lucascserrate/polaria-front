'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import ServiceEditor from '@/modules/services/ServiceEditor';
import type { ServicePayload } from '@/modules/services/useServiceDraft';
import useService from '@/services/services/useService';
import useUpdateService from '@/services/services/useUpdateService';
import useSetServiceActive from '@/services/services/useSetServiceActive';
import useBusinessCurrency from '@/modules/settings/useBusinessCurrency';

const messageOf = (cause: unknown, fallback: string): string =>
	axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string'
		? cause.response.data.message
		: fallback;

const ServicePage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const id = params?.id;

	const { data: service, isLoading, isError } = useService(id ?? '');
	const { currency } = useBusinessCurrency();
	const updateService = useUpdateService();
	const setServiceActive = useSetServiceActive();
	const [error, setError] = useState<string | null>(null);

	const handleSave = async (payload: ServicePayload) => {
		if (!id) return;
		setError(null);

		try {
			await updateService.mutateAsync({ id, data: payload });
			router.push(ROUTES.services);
		} catch (cause) {
			setError(messageOf(cause, 'No se pudieron guardar los cambios.'));
		}
	};

	const handleToggleActive = async (isActive: boolean) => {
		if (!id) return;
		setError(null);

		try {
			await setServiceActive.mutateAsync({ id, isActive });
			if (!isActive) router.push(ROUTES.services);
		} catch (cause) {
			setError(
				messageOf(
					cause,
					isActive
						? 'No se pudo volver a activar el servicio.'
						: 'No se pudo desactivar el servicio.',
				),
			);
		}
	};

	if (isLoading) {
		return (
			<p className="py-16 text-center text-muted-foreground">
				Cargando el servicio…
			</p>
		);
	}

	if (isError || !service) {
		return (
			<div className="space-y-4 py-16 text-center">
				<p className="text-muted-foreground">
					No encontramos este servicio en el catálogo.
				</p>
				<Button asChild variant="outline">
					<Link href={ROUTES.services}>Volver a servicios</Link>
				</Button>
			</div>
		);
	}

	return (
		<ServiceEditor
			key={service.id}
			service={service}
			defaultCurrency={currency}
			saving={updateService.isPending}
			toggling={setServiceActive.isPending}
			error={error}
			onSave={(payload) => void handleSave(payload)}
			onToggleActive={(isActive) => void handleToggleActive(isActive)}
		/>
	);
};

export default ServicePage;
