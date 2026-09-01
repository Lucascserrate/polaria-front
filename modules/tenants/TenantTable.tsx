'use client';

import { AlertCircle, LogIn, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/date-utils';
import { businessTypeLabel } from './businessType';
import type { Tenant } from '@/types/tenant.types';

interface TenantTableProps {
	tenants: Tenant[];
	onOpen: (tenant: Tenant) => void;
	onEnter: (tenant: Tenant) => void;
	onDelete: (tenant: Tenant) => void;
	onAddClick: () => void;
}

const statusLabel: Record<string, string> = {
	active: 'Activo',
	inactive: 'Inactivo',
};

/**
 * El listado de negocios.
 *
 * La fila entera abre la ficha; editar y eliminar viven en el menú del click
 * derecho, como en Clientes. Es el gesto que el sistema operativo ya reservó
 * para "las acciones de esto", así que no hay que enseñarlo, y deja la fila
 * libre para su único trabajo: abrir. Una columna de botones competiría con ese
 * click en cada renglón y además obligaría a apuntarle a un icono de 16px.
 */
export function TenantTable({
	tenants,
	onOpen,
	onEnter,
	onDelete,
	onAddClick,
}: TenantTableProps) {
	/*
	 * En touch el menú se abre con una pulsación larga y, al soltar, el navegador
	 * todavía dispara el click: sin esto la ficha se abriría por debajo del menú
	 * que se acaba de abrir. El `data-state` lo pone el propio trigger.
	 */
	const open = (event: React.MouseEvent<HTMLElement>, tenant: Tenant) => {
		if (event.currentTarget.dataset.state === 'open') return;
		onOpen(tenant);
	};

	const actions = (tenant: Tenant) => (
		<ContextMenuContent>
			<ContextMenuItem onSelect={() => onOpen(tenant)}>
				<Pencil />
				Editar
			</ContextMenuItem>

			<ContextMenuItem onSelect={() => onEnter(tenant)}>
				<LogIn />
				Entrar al negocio
			</ContextMenuItem>

			<ContextMenuSeparator />

			<ContextMenuItem variant="destructive" onSelect={() => onDelete(tenant)}>
				<Trash2 />
				Eliminar
			</ContextMenuItem>
		</ContextMenuContent>
	);

	if (tenants.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground mb-4">
					No hay negocios registrados todavía
				</p>
				<Button onClick={onAddClick}>
					<Plus className="w-4 h-4 mr-2" />
					Crear negocio
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="hidden overflow-hidden rounded-lg border border-border md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre del negocio</TableHead>
							<TableHead>Tipo de negocio</TableHead>
							<TableHead>Correo principal</TableHead>
							<TableHead>WhatsApp</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Fecha de creación</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{tenants.map((tenant) => (
							<ContextMenu key={tenant.id}>
								<ContextMenuTrigger asChild>
									<TableRow
										tabIndex={0}
										role="button"
										aria-label={`Abrir la ficha de ${tenant.name}`}
										className="cursor-pointer data-[state=open]:bg-muted/50"
										onClick={(event) => open(event, tenant)}
										onKeyDown={(event) => {
											if (event.key === 'Enter' || event.key === ' ') {
												event.preventDefault();
												onOpen(tenant);
											}
										}}
									>
										<TableCell className="font-medium">{tenant.name}</TableCell>
										<TableCell>
											{businessTypeLabel(tenant.businessType) ?? 'Sin definir'}
										</TableCell>
										<TableCell>{tenant.email || 'Sin correo'}</TableCell>
										<TableCell>
											<WhatsappCell tenant={tenant} />
										</TableCell>
										<TableCell>
											<Badge
												variant={
													tenant.status === 'inactive' ? 'secondary' : 'default'
												}
											>
												{statusLabel[tenant.status ?? 'active'] ?? 'Activo'}
											</Badge>
										</TableCell>
										<TableCell>
											{formatDate(new Date(tenant.createdAt))}
										</TableCell>
									</TableRow>
								</ContextMenuTrigger>

								{actions(tenant)}
							</ContextMenu>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="space-y-3 md:hidden">
				{tenants.map((tenant) => (
					<ContextMenu key={tenant.id}>
						<ContextMenuTrigger asChild>
							<button
								type="button"
								onClick={(event) => open(event, tenant)}
								className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/40 data-[state=open]:bg-muted/40"
							>
								<span className="flex items-start justify-between gap-3">
									<span className="space-y-1">
										<span className="block font-semibold leading-tight">
											{tenant.name}
										</span>
										<span className="block text-sm text-muted-foreground">
											{businessTypeLabel(tenant.businessType) ?? 'Sin definir'}
										</span>
									</span>
									<Badge
										variant={
											tenant.status === 'inactive' ? 'secondary' : 'default'
										}
									>
										{statusLabel[tenant.status ?? 'active'] ?? 'Activo'}
									</Badge>
								</span>

								<span className="mt-4 block space-y-2 text-sm">
									<span className="flex items-center justify-between gap-3">
										<span className="text-muted-foreground">Correo</span>
										<span className="text-right font-medium break-all">
											{tenant.email || 'Sin correo'}
										</span>
									</span>
									<span className="flex items-center justify-between gap-3">
										<span className="text-muted-foreground">WhatsApp</span>
										<span className="text-right font-medium break-all">
											<WhatsappCell tenant={tenant} />
										</span>
									</span>
									<span className="flex items-center justify-between gap-3">
										<span className="text-muted-foreground">Creado</span>
										<span className="font-medium">
											{formatDate(new Date(tenant.createdAt))}
										</span>
									</span>
								</span>
							</button>
						</ContextMenuTrigger>

						{actions(tenant)}
					</ContextMenu>
				))}
			</div>
		</div>
	);
}

/**
 * El número, o el aviso de que el negocio todavía no conectó.
 *
 * Sin número no hay nada que Polaria pueda hacer por ese negocio: no recibe
 * mensajes ni puede enviarlos. Decirlo en el listado es lo que permite a soporte
 * distinguir de un vistazo un alta a medio terminar de un negocio operando.
 */
const WhatsappCell: React.FC<{ tenant: Tenant }> = ({ tenant }) =>
	tenant.whatsappPhoneNumber ? (
		<span className="tabular-nums">{tenant.whatsappPhoneNumber}</span>
	) : (
		<span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500">
			<AlertCircle className="size-3 shrink-0" />
			Sin conectar
		</span>
	);
