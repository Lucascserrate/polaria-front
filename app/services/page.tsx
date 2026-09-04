'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import ServicesTable from '@/modules/services/ServicesTable';
import useGetServices from '@/services/services/useGetServices';
import useGetSettings from '@/services/settings/useGetSettings';

/**
 * El catálogo de servicios.
 *
 * Ya no hay tarjetas de resumen arriba. Eran tres —total, duración promedio,
 * precio promedio— y ninguna se usaba para decidir nada: el total ya lo dice la
 * lista, y los promedios de un catálogo de cinco servicios no describen al negocio
 * ni a ninguno de ellos. Ocupaban la primera pantalla completa antes de mostrar lo
 * que se venía a ver.
 */
const ServicesPage = () => {
	const { data: services = [], isPending, isError, error } = useGetServices();
	const { data: settings } = useGetSettings();

	// Sin configuración todavía, el código ISO es el del negocio por defecto.
	const currency = settings?.currency ?? 'BOB';

	if (isPending) {
		return (
			<p className="py-16 text-center text-muted-foreground">
				Cargando los servicios…
			</p>
		);
	}

	if (isError) {
		return (
			<p className="py-16 text-center text-destructive">
				{error?.message ?? 'No se pudieron cargar los servicios.'}
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
						Servicios
						<span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium tabular-nums text-muted-foreground">
							{services.length}
						</span>
					</h1>
					<p className="mt-1 text-muted-foreground">
						Qué ofrece el negocio, cuánto dura y cuánto cuesta.
					</p>
				</div>

				<Button asChild className="gap-2">
					<Link href={ROUTES.servicesNew}>
						<Plus className="size-4" />
						Nuevo
					</Link>
				</Button>
			</div>

			<ServicesTable services={services} currency={currency} />
		</div>
	);
};

export default ServicesPage;
