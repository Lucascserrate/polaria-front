'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateTenantDialog } from '@/modules/tenants/CreateTenantDialog';
import { TenantTable } from '@/modules/tenants/TenantTable';
import { tenantRoute } from '@/modules/tenants/routes';
import { tenantsService } from '@/services/tenants.service';
import type { CreateTenantDto, Tenant } from '@/types/tenant.types';

export default function TenantManagementPage() {
	const router = useRouter();
	const [tenants, setTenants] = useState<Tenant[]>([]);
	const [loading, setLoading] = useState(true);
	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState<Tenant | null>(null);
	const [deletePending, setDeletePending] = useState(false);

	useEffect(() => {
		void loadTenants();
	}, []);

	const loadTenants = async () => {
		try {
			setLoading(true);
			const data = await tenantsService.getAll();
			setTenants(data);
		} catch (error) {
			console.error('Error loading tenants:', error);
		} finally {
			setLoading(false);
		}
	};

	const activeCount = useMemo(
		() => tenants.filter((tenant) => tenant.status !== 'inactive').length,
		[tenants],
	);

	const handleCreate = async (payload: CreateTenantDto) => {
		setCreating(true);
		setCreateError(null);

		try {
			const created = await tenantsService.create(payload);
			setCreateOpen(false);
			// Directo a la ficha: el alta deja el negocio a medio configurar a
			// propósito, y lo que sigue —tipo, ubicación, zona horaria— está ahí.
			router.push(tenantRoute(created.id));
		} catch (error) {
			setCreateError(messageOf(error, 'No se pudo crear el negocio.'));
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async (tenant: Tenant) => {
		setDeletePending(true);

		try {
			await tenantsService.delete(tenant.id);
			setTenants((current) => current.filter((item) => item.id !== tenant.id));
			setDeleting(null);
		} catch (error) {
			console.error('Error deleting tenant:', error);
		} finally {
			setDeletePending(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">Cargando tenants...</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
			<div className="space-y-1">
				<h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
				<p className="max-w-2xl text-muted-foreground">
					Administra la información base de cada tenant desde una vista interna
					preparada para futuras reglas de seguridad por roles.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total tenants
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{tenants.length}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Activos
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-green-600">{activeCount}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Inactivos
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-muted-foreground">
							{tenants.length - activeCount}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Negocios</CardTitle>
						<p className="mt-1 text-sm text-muted-foreground">
							Click para abrir la ficha. Click derecho para editar o eliminar.
						</p>
					</div>

					<Button onClick={() => setCreateOpen(true)} className="gap-2">
						<Plus className="h-4 w-4" />
						Crear negocio
					</Button>
				</CardHeader>

				<CardContent className="p-6">
					<TenantTable
						tenants={tenants}
						onAddClick={() => setCreateOpen(true)}
						onOpen={(tenant) => router.push(tenantRoute(tenant.id))}
						onDelete={setDeleting}
					/>
				</CardContent>
			</Card>

			<CreateTenantDialog
				// Remonta el diálogo en cada apertura: los campos se inicializan una
				// sola vez, así que sin esto el segundo alta arrancaría con lo tipeado
				// en la primera.
				key={createOpen ? 'open' : 'closed'}
				open={createOpen}
				saving={creating}
				error={createError}
				onOpenChange={(open) => {
					setCreateOpen(open);
					if (!open) setCreateError(null);
				}}
				onSubmit={(payload) => void handleCreate(payload)}
			/>

			<DeleteTenantDialog
				tenant={deleting}
				pending={deletePending}
				onOpenChange={(open) => {
					if (!open) setDeleting(null);
				}}
				onConfirm={(tenant) => void handleDelete(tenant)}
			/>
		</div>
	);
}

/**
 * Confirmación de baja.
 *
 * Reemplaza al `window.confirm` que había: con las acciones en el menú del click
 * derecho, un diálogo nativo del navegador aparece desanclado del gesto y sin
 * decir qué se lleva puesto. Y acá se lleva puesto todo: la fila se borra de
 * verdad, con sus citas, clientes y conversaciones colgando.
 */
const DeleteTenantDialog: React.FC<{
	tenant: Tenant | null;
	pending?: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (tenant: Tenant) => void;
}> = ({ tenant, pending = false, onOpenChange, onConfirm }) => {
	if (!tenant) return null;

	return (
		<AlertDialog open onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Eliminar {tenant.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						Se borra el negocio entero: su equipo, sus clientes, sus citas y sus
						conversaciones.{' '}
						<strong className="text-foreground">
							Esta acción no se puede deshacer.
						</strong>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={pending}
						className="bg-destructive hover:bg-destructive/90"
						onClick={(event) => {
							// El diálogo se cierra solo al confirmar; acá se espera a que la
							// baja termine para poder mostrar el error si falla.
							event.preventDefault();
							onConfirm(tenant);
						}}
					>
						Eliminar
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const messageOf = (cause: unknown, fallback: string) =>
	axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string'
		? cause.response.data.message
		: `${fallback} Intentá de nuevo.`;
