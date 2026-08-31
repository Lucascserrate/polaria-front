'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ROUTES, clientRoute } from '@/constants/routes';
import type { ClientPayload } from '@/services/clients/clients.service';
import ClientEditor from '@/modules/clients/ClientEditor';
import useGetClient from '@/services/clients/useGetClient';
import useGetClientSummary from '@/services/clients/useGetClientSummary';
import useUpdateClient from '@/services/clients/useUpdateClient';
import useDeleteClient from '@/services/clients/useDeleteClient';
import useGetSettings from '@/services/settings/useGetSettings';

/**
 * Editar es una pantalla propia, y salir vuelve a la ficha abierta.
 *
 * Guardar y cerrar terminan los dos en `/clients?client=<id>&tab=profile`: se
 * entró desde ahí y ahí hay que volver, con el drawer abierto en la misma
 * pestaña. Eso es posible porque la ficha vive en la URL y no en el estado de la
 * lista; si no, volver dejaría al usuario mirando una tabla y preguntándose
 * dónde quedó el cliente que estaba viendo.
 *
 * Eliminar es la excepción: no hay ficha a la que volver, así que va a la lista.
 */
const EditClientPage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const id = params?.id;

	const { data: client, isLoading, isError } = useGetClient(id);
	const { data: summary } = useGetClientSummary(id);
	const { data: settings, isLoading: loadingSettings } = useGetSettings();
	const updateClient = useUpdateClient();
	const deleteClient = useDeleteClient();
	const [error, setError] = useState<string | null>(null);

	const backToProfile = () =>
		router.push(clientRoute(id as string, 'profile'), { scroll: false });

	const handleSave = async (payload: ClientPayload) => {
		if (!id) return;
		setError(null);

		try {
			await updateClient.mutateAsync({ id, data: payload });
			backToProfile();
		} catch (cause) {
			// El backend explica el caso: teléfono ilegible, o ya usado por otra
			// ficha del mismo negocio. Ese mensaje es el que sirve.
			setError(messageOf(cause, 'No se pudieron guardar los cambios.'));
		}
	};

	const handleDelete = async () => {
		if (!id) return;
		setError(null);

		try {
			await deleteClient.mutateAsync(id);
			router.push(ROUTES.clients);
		} catch (cause) {
			setError(messageOf(cause, 'No se pudo eliminar el cliente.'));
		}
	};

	/*
	 * También se espera a los ajustes, no sólo a la ficha. El editor prellena el
	 * teléfono en formato legible usando el prefijo del país, y ese prefijo sale
	 * de los ajustes: si el borrador se inicializa antes de que lleguen, el mismo
	 * número aparece a veces como `+591 79995002` y a veces como `+59179995002`,
	 * según qué haya en caché.
	 */
	if (isLoading || loadingSettings) {
		return (
			<p className="py-16 text-center text-muted-foreground">
				Cargando la ficha…
			</p>
		);
	}

	if (isError || !client) {
		return (
			<div className="space-y-4 py-16 text-center">
				<p className="text-muted-foreground">No encontramos a este cliente.</p>
				<Button asChild variant="outline">
					<Link href={ROUTES.clients}>Volver a clientes</Link>
				</Button>
			</div>
		);
	}

	return (
		<ClientEditor
			// Remonta el editor si cambia de cliente: el borrador se inicializa una
			// sola vez, así que sin esto una navegación entre dos fichas dejaría los
			// datos de la anterior.
			key={client.id}
			client={client}
			summary={summary}
			dialCode={settings?.dialCode}
			saving={updateClient.isPending}
			deleting={deleteClient.isPending}
			error={error}
			onSave={(payload) => void handleSave(payload)}
			onClose={backToProfile}
			onDelete={() => void handleDelete()}
		/>
	);
};

const messageOf = (cause: unknown, fallback: string) =>
	axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string'
		? cause.response.data.message
		: `${fallback} Intentá de nuevo.`;

export default EditClientPage;
