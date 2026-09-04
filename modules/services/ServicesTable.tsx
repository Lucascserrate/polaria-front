'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { ROUTES } from '@/constants/routes';
import { formatMoney } from '@/lib/money';
import type { Service } from '@/types/services.types';

interface Props {
	services: Service[];
	/** La del negocio: los precios se escriben en su moneda, no en dólares. */
	currency: string;
}

/**
 * El catálogo de servicios, en una tabla.
 *
 * Sin columna de acciones. La fila entera lleva al editor —que es una pantalla, y
 * no un diálogo que hubiera que abrir desde un lápiz— y eliminar vive adentro,
 * como en clientes: sacar un servicio del catálogo no debería estar a un click de
 * paso mientras alguien recorre la lista.
 */
const ServicesTable: React.FC<Props> = ({ services, currency }) => {
	if (services.length === 0) {
		return (
			<div className="rounded-xl border border-border py-12 text-center">
				<p className="mb-4 text-muted-foreground">
					Todavía no hay servicios en el catálogo.
				</p>
				<Button asChild>
					<Link href={ROUTES.servicesNew}>
						<Plus className="size-4" />
						Nuevo servicio
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* Escritorio */}
			<div className="hidden overflow-hidden rounded-xl border border-border md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Servicio</TableHead>
							<TableHead>Duración</TableHead>
							<TableHead className="text-right">Precio</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{services.map((service) => (
							<TableRow key={service.id}>
								<TableCell>
									<Link
										href={`${ROUTES.services}/${service.id}`}
										className="group block min-w-0"
									>
										<span className="block truncate font-medium group-hover:underline">
											{service.name}
										</span>
										{service.description && (
											<span className="block truncate text-xs text-muted-foreground">
												{service.description}
											</span>
										)}
									</Link>
								</TableCell>
								<TableCell className="text-sm tabular-nums text-muted-foreground">
									{`${service.durationMinutes} min`}
								</TableCell>
								<TableCell className="text-right font-medium tabular-nums">
									{formatMoney(Number(service.price), currency)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Móvil */}
			<ul className="space-y-2 md:hidden">
				{services.map((service) => (
					<li key={service.id} className="rounded-xl border border-border">
						<Link
							href={`${ROUTES.services}/${service.id}`}
							className="flex items-start justify-between gap-3 p-3"
						>
							<span className="min-w-0">
								<span className="block truncate font-medium">
									{service.name}
								</span>
								<span className="mt-0.5 block text-xs text-muted-foreground">
									{`${service.durationMinutes} min`}
								</span>
							</span>
							<span className="shrink-0 font-medium tabular-nums">
								{formatMoney(Number(service.price), currency)}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</>
	);
};

export default ServicesTable;
