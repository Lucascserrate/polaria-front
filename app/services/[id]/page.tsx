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
import useDeleteService from '@/services/services/useDeleteService';
import useGetSettings from '@/services/settings/useGetSettings';

const messageOf = (cause: unknown, fallback: string): string =>
	axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string'
		? cause.response.data.message
		: fallback;

const ServicePage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const id = params?.id;

	const { data: service, isLoading, isError } = useService(id ?? '');
	const { data: settings } = useGetSettings();
	const updateService = useUpdateService();
	const deleteService = useDeleteService();
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

	const handleDelete = async () => {
		if (!id) return;
		setError(null);

		try {
			await deleteService.mutateAsync(id);
			router.push(ROUTES.services);
		} catch (cause) {
			setError(messageOf(cause, 'No se pudo eliminar el servicio.'));
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
			// Remonta el editor si cambia de servicio: el borrador se inicializa una
			// sola vez, así que sin esto una navegación entre dos servicios dejaría
			// los datos del anterior.
			key={service.id}
			service={service}
			currency={settings?.currency ?? 'BOB'}
			saving={updateService.isPending}
			deleting={deleteService.isPending}
			error={error}
			onSave={(payload) => void handleSave(payload)}
			onDelete={() => void handleDelete()}
		/>
	);
};

export default ServicePage;
