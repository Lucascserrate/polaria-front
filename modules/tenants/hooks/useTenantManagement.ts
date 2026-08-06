import { useMemo, useState } from 'react';

import { useCreateTenant } from '@/modules/tenants/hooks/useCreateTenant';
import { useDeleteTenant } from '@/modules/tenants/hooks/useDeleteTenant';
import { useGetTenants } from '@/modules/tenants/hooks/useGetTenants';
import { useUpdateTenant } from '@/modules/tenants/hooks/useUpdateTenant';
import { validateTenantSubmission } from '@/modules/tenants/utils/tenantValidation';
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
		setFormOpen(true);
	};

	const handleOpenEdit = (tenant: Tenant) => {
		setEditingTenant(tenant);
		setSubmissionError(null);
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

			const validation = validateTenantSubmission(
				payload,
				tenants,
				editingTenant ? 'edit' : 'create',
			);

			if (!validation.valid) {
				setSubmissionError(validation.error ?? null);
				return;
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
