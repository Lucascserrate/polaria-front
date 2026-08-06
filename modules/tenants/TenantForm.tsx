'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
	CreateTenantDto,
	Tenant,
	TenantStatus,
	UpdateTenantDto,
} from '@/types/tenant.types';

import PhoneNumberInput from '@/components/PhoneNumberInput';
import TimezoneInput from '@/components/TimezoneInput';
import { composeInternationalPhoneNumber } from './utils/phoneUtils';
import { getInitialTimezone } from './utils/timezoneUtils';
import {
	getInitialFormState,
	type TenantFormState,
} from './utils/tenantFormState';
import { normalizeTenantPayload } from './utils/tenantPayload';
import { validateTenantForm } from './utils/tenantValidation';

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialTenant?: Tenant | null;
	onSubmit: (tenant: CreateTenantDto | UpdateTenantDto) => void;
}

export function TenantForm({
	open,
	onOpenChange,
	initialTenant,
	onSubmit,
}: Props) {
	const mode = initialTenant ? 'edit' : 'create';
	const [form, setForm] = useState<TenantFormState>(() =>
		getInitialFormState(initialTenant),
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [{ open: prevOpen, initialTenant: prevInitialTenant }, setPrevProps] =
		useState({ open, initialTenant });

	// Sincroniza el estado del formulario cuando se abre o cambia el tenant
	if (open && (prevOpen !== open || prevInitialTenant !== initialTenant)) {
		setPrevProps({ open, initialTenant });
		setForm(getInitialFormState(initialTenant));
		setErrors({});
	}

	const updateField = <K extends keyof TenantFormState>(
		field: K,
		value: TenantFormState[K],
	) => {
		setForm((current) => ({ ...current, [field]: value }));
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const nextErrors = validateTenantForm(form);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) return;

		const whatsappPhoneNumber = composeInternationalPhoneNumber(
			form.phoneCountry,
			form.phoneValue,
		);

		const timezone =
			mode === 'create'
				? form.timezone.trim() || getInitialTimezone()
				: form.timezone.trim() || undefined;

		const basePayload = {
			name: form.name.trim(),
			email: form.email.trim(),
			whatsappPhoneNumber,
			businessType: form.businessType.trim() || undefined,
			whatsappPhoneId: form.whatsappPhoneId.trim() || undefined,
			whatsappAccessToken: form.whatsappAccessToken.trim() || undefined,
			timezone,
			status: form.status,
			aiEnabled: form.aiEnabled,
		};

		const payload = normalizeTenantPayload(
			basePayload,
		) as CreateTenantDto | UpdateTenantDto;

		onSubmit(payload);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{mode === 'create' ? 'Crear negocio' : 'Editar negocio'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'create'
							? 'Completa solo los datos base del negocio.'
							: 'Actualiza la información base y las credenciales del negocio.'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Nombre</Label>
						<Input
							id="name"
							value={form.name}
							onChange={(event) => updateField('name', event.target.value)}
							placeholder="Ej. Barberia Central"
						/>
						{errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="tenantNumber">Número</Label>
						<PhoneNumberInput
							phoneCountry={form.phoneCountry}
							phoneValue={form.phoneValue}
							onPhoneCountryChange={(phoneCountry) =>
								updateField('phoneCountry', phoneCountry)
							}
							onPhoneValueChange={(phoneValue) =>
								updateField('phoneValue', phoneValue)
							}
						/>
						{errors.tenantNumber && (
							<p className="text-sm text-red-600">{errors.tenantNumber}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Correo electrónico</Label>
						<Input
							id="email"
							type="email"
							value={form.email}
							onChange={(event) => updateField('email', event.target.value)}
							placeholder="admin@negocio.com"
						/>
						{errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="timezone">Zona horaria</Label>
						<TimezoneInput
							timezone={form.timezone}
							setTimezone={(timezone) => updateField('timezone', timezone)}
						/>
						<p className="text-xs text-muted-foreground">
							{mode === 'create'
								? 'Se completa automáticamente según el navegador, pero puedes cambiarla si lo prefieres.'
								: 'Selecciona la zona horaria del negocio.'}
						</p>
					</div>

					{mode === 'edit' && (
						<>
							<div className="space-y-2">
								<Label htmlFor="businessType">Tipo de negocio</Label>
								<Input
									id="businessType"
									value={form.businessType}
									onChange={(event) =>
										updateField('businessType', event.target.value)
									}
									placeholder="Ej. barberia"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="whatsappPhoneId">WhatsApp Phone ID</Label>
								<Input
									id="whatsappPhoneId"
									value={form.whatsappPhoneId}
									onChange={(event) =>
										updateField('whatsappPhoneId', event.target.value)
									}
									placeholder="1013549818517591"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="whatsappAccessToken">
									WhatsApp Access Token
								</Label>
								<Input
									id="whatsappAccessToken"
									value={form.whatsappAccessToken}
									onChange={(event) =>
										updateField('whatsappAccessToken', event.target.value)
									}
									placeholder="EAAL..."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Estado</Label>
								<Select
									value={form.status}
									onValueChange={(value) =>
										updateField('status', value as TenantStatus)
									}
								>
									<SelectTrigger id="status">
										<SelectValue placeholder="Selecciona un estado" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Activo</SelectItem>
										<SelectItem value="inactive">Inactivo</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
								<div>
									<p className="text-sm font-medium">AI habilitada</p>
									<p className="text-xs text-muted-foreground">
										Controla si el tenant puede usar funcionalidades de IA.
									</p>
								</div>
								<Switch
									checked={form.aiEnabled}
									onCheckedChange={(aiEnabled) =>
										updateField('aiEnabled', aiEnabled)
									}
								/>
							</div>
						</>
					)}

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button type="submit">
							{mode === 'create' ? 'Crear negocio' : 'Guardar cambios'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
