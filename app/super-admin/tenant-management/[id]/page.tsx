'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import TenantEditor from '@/modules/tenants/TenantEditor';
import { TENANTS_BASE_ROUTE } from '@/modules/tenants/routes';
import { tenantsService } from '@/services/tenants.service';
import type { Tenant, UpdateTenantDto } from '@/types/tenant.types';

/**
 * La ficha de un negocio, en su propia dirección.
 *
 * Que sea una URL y no un modal sobre el listado es lo que la vuelve compartible
 * entre quienes dan soporte: un negocio con un problema se pasa como enlace.
 */
const TenantPage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const id = params?.id;

	const [tenant, setTenant] = useState<Tenant | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		let cancelled = false;

		const load = async () => {
			setLoading(true);
			try {
				const data = await tenantsService.getById(id);
				if (!cancelled) setTenant(data);
			} catch {
				if (!cancelled) setTenant(null);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		void load();
		// Una navegación entre dos fichas puede resolver las respuestas al revés:
		// sin esto, la lenta pisaría a la que se está mirando.
		return () => {
			cancelled = true;
		};
	}, [id]);

	/**
	 * Relee la ficha **sin** volver a la pantalla de carga.
	 *
	 * Lo pide la sección de WhatsApp, que actúa en el momento: conectar cambia el
	 * tenant del servidor y hay que reflejarlo. Mostrar el spinner desmontaría el
	 * editor y tiraría lo que se estuviera escribiendo en Perfil o Ubicación, que
	 * no tienen nada que ver con lo que acaba de pasar.
	 */
	const refresh = useCallback(async () => {
		if (!id) return;

		try {
			setTenant(await tenantsService.getById(id));
		} catch (cause) {
			console.error('Error refreshing tenant:', cause);
		}
	}, [id]);

	const handleSave = async (payload: UpdateTenantDto) => {
		if (!id) return;
		setSaving(true);
		setError(null);

		try {
			await tenantsService.update(id, payload);
			router.push(TENANTS_BASE_ROUTE);
		} catch (cause) {
			setError(
				axios.isAxiosError(cause) &&
					typeof cause.response?.data?.message === 'string'
					? cause.response.data.message
					: 'No se pudieron guardar los cambios. Intentá de nuevo.',
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<p className="py-16 text-center text-muted-foreground">
				Cargando la ficha…
			</p>
		);
	}

	if (!tenant) {
		return (
			<div className="space-y-4 py-16 text-center">
				<p className="text-muted-foreground">No encontramos este negocio.</p>
				<Button asChild variant="outline">
					<Link href={TENANTS_BASE_ROUTE}>Volver al listado</Link>
				</Button>
			</div>
		);
	}

	return (
		<TenantEditor
			// Remonta el editor si cambia de negocio: el borrador se inicializa una
			// sola vez, así que sin esto una navegación entre dos fichas dejaría los
			// datos de la anterior.
			key={tenant.id}
			tenant={tenant}
			onRefresh={() => void refresh()}
			saving={saving}
			error={error}
			onSave={(payload) => void handleSave(payload)}
		/>
	);
};

export default TenantPage;
