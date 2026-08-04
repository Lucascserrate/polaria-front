import { useMemo, useState } from 'react';

import { useCreateTenant } from '@/modules/tenants/hooks/useCreateTenant';
import { useDeleteTenant } from '@/modules/tenants/hooks/useDeleteTenant';
import { useGetTenants } from '@/modules/tenants/hooks/useGetTenants';
import { useUpdateTenant } from '@/modules/tenants/hooks/useUpdateTenant';
import type {
	CreateTenantDto,
	Tenant,
	UpdateTenantDto,
} from '@/types/tenant.types';

export const useTenantManagement = () => {
	const { data: tenantsData, isLoading, isError, error } = useGetTenants();
	const tenants = useMemo(() => tenantsData ?? [], [tenantsData]);
	const createTenant = useCreateTenant();
	const updateTenant = useUpdateTenant();
	const deleteTenant = useDeleteTenant();
	const [formOpen, setFormOpen] = useState(false);
	const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
	const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
	const [submissionError, setSubmissionError] = useState<string | null>(null);
	const [formSeed, setFormSeed] = useState(0);

	const activeCount = useMemo(
		() => tenants.filter((tenant) => tenant.status !== 'inactive').length,
		[tenants],
	);

	const inactiveCount = useMemo(
		() => tenants.length - activeCount,
		[activeCount, tenants.length],
	);

	const handleOpenCreate = () => {
		setEditingTenant(null);
		setSubmissionError(null);
		setFormSeed((current) => current + 1);
		setFormOpen(true);
	};

	const handleOpenEdit = (tenant: Tenant) => {
		setEditingTenant(tenant);
		setSubmissionError(null);
		setFormSeed((current) => current + 1);
		setFormOpen(true);
	};

	const handleDeleteRequest = (tenant: Tenant) => {
		setTenantToDelete(tenant);
	};

	const handleDelete = async () => {
		if (!tenantToDelete) return;

		try {
			await deleteTenant.mutateAsync(tenantToDelete.id);
			setTenantToDelete(null);
		} catch (error) {
			console.error('Error deleting tenant:', error);
		}
	};

	const handleSubmit = async (payload: CreateTenantDto | UpdateTenantDto) => {
		try {
			setSubmissionError(null);

			if (!editingTenant && 'whatsappPhoneNumber' in payload) {
				const normalizedPhone = payload.whatsappPhoneNumber?.trim();
				if (!normalizedPhone) {
					setSubmissionError('El número de WhatsApp es obligatorio.');
					return;
				}

				const duplicateTenant = tenants.find(
					(tenant) => tenant.whatsappPhoneNumber === normalizedPhone,
				);

				if (duplicateTenant) {
					setSubmissionError(
						'Ya existe un tenant con ese número de WhatsApp. Usa un número diferente.',
					);
					return;
				}
			}

			if (editingTenant) {
				await updateTenant.mutateAsync({
					id: editingTenant.id,
					body: payload as UpdateTenantDto,
				});
				setEditingTenant(null);
				return;
			}

			await createTenant.mutateAsync(payload as CreateTenantDto);
		} catch (error) {
			console.error('Error saving tenant:', error);
		}
	};

	const handleFormOpenChange = (open: boolean) => {
		setFormOpen(open);
		if (!open) {
			setEditingTenant(null);
			setSubmissionError(null);
		}
	};

	const handleDeleteDialogChange = (open: boolean) => {
		if (!open) {
			setTenantToDelete(null);
		}
	};

	return {
		state: {
			formOpen,
			editingTenant,
			tenantToDelete,
			submissionError,
		},
		derived: {
			tenants,
			activeCount,
			inactiveCount,
			isLoading,
			isError,
			error,
			formSeed,
		},
		actions: {
			handleOpenCreate,
			handleOpenEdit,
			handleDeleteRequest,
			handleDelete,
			handleSubmit,
			handleFormOpenChange,
			handleDeleteDialogChange,
		},
	};
};
