'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/date-utils';
import type { Tenant } from '@/types/tenant.types';

interface TenantTableProps {
	tenants: Tenant[];
	onEdit: (tenant: Tenant) => void;
	onDelete: (tenant: Tenant) => void;
	onAddClick: () => void;
}

const statusLabel: Record<string, string> = {
	active: 'Activo',
	inactive: 'Inactivo',
};

export function TenantTable({
	tenants,
	onEdit,
	onDelete,
	onAddClick,
}: TenantTableProps) {
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
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{tenants.map((tenant) => (
							<TableRow key={tenant.id}>
								<TableCell className="font-medium">{tenant.name}</TableCell>
								<TableCell>{tenant.businessType || 'Sin definir'}</TableCell>
								<TableCell>{tenant.email || 'Sin correo'}</TableCell>
								<TableCell>{tenant.whatsappPhoneNumber}</TableCell>
								<TableCell>
									<Badge
										variant={
											tenant.status === 'inactive' ? 'secondary' : 'default'
										}
									>
										{statusLabel[tenant.status ?? 'active'] ?? 'Activo'}
									</Badge>
								</TableCell>
								<TableCell>{formatDate(new Date(tenant.createdAt))}</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(tenant)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(tenant)}
											className="text-red-600 hover:text-red-700 hover:bg-red-50"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="space-y-3 md:hidden">
				{tenants.map((tenant) => (
					<div
						key={tenant.id}
						className="rounded-xl border border-border bg-card p-4 shadow-sm"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="space-y-1">
								<p className="font-semibold leading-tight">{tenant.name}</p>
								<p className="text-sm text-muted-foreground">
									{tenant.businessType || 'Sin definir'}
								</p>
							</div>
							<Badge
								variant={tenant.status === 'inactive' ? 'secondary' : 'default'}
							>
								{statusLabel[tenant.status ?? 'active'] ?? 'Activo'}
							</Badge>
						</div>

						<div className="mt-4 space-y-2 text-sm">
							<div className="flex items-center justify-between gap-3">
								<span className="text-muted-foreground">Correo</span>
								<span className="text-right font-medium break-all">
									{tenant.email || 'Sin correo'}
								</span>
							</div>
							<div className="flex items-center justify-between gap-3">
								<span className="text-muted-foreground">WhatsApp</span>
								<span className="text-right font-medium break-all">
									{tenant.whatsappPhoneNumber}
								</span>
							</div>
							<div className="flex items-center justify-between gap-3">
								<span className="text-muted-foreground">Creado</span>
								<span className="font-medium">
									{formatDate(new Date(tenant.createdAt))}
								</span>
							</div>
						</div>

						<div className="mt-4 flex gap-2">
							<Button
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={() => onEdit(tenant)}
							>
								<Pencil className="mr-2 h-4 w-4" />
								Editar
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
								onClick={() => onDelete(tenant)}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Eliminar
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
