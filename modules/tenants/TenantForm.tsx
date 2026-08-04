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
import isValidEmail from '@/lib/isValidEmail';
import type {
	CreateTenantDto,
	Tenant,
	TenantStatus,
	UpdateTenantDto,
} from '@/types/tenant.types';

import PhoneNumberInput from '@/components/PhoneNumberInput';
import TimezoneInput from '@/components/TimezoneInput';
import {
	composeInternationalPhoneNumber,
} from './utils/phoneUtils';
import { getInitialTimezone } from './utils/timezoneUtils';
import { getInitialFormState, type TenantFormState } from './utils/tenantFormState';

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
	const [form, setForm] = useState<TenantFormState>(() => getInitialFormState(initialTenant));
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const nextErrors: Record<string, string> = {};

		if (!form.name.trim()) {
			nextErrors.name = 'El nombre es obligatorio.';
		}

		if (!form.email.trim()) {
			nextErrors.email = 'El correo electrónico es obligatorio.';
		} else if (!isValidEmail(form.email)) {
			nextErrors.email = 'Ingresa un correo válido.';
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validate()) return;

		const whatsappPhoneNumber = composeInternationalPhoneNumber(
			form.phoneCountry,
			form.phoneValue,
		);

		if (mode === 'create') {
			onSubmit({
				name: form.name.trim(),
				email: form.email.trim(),
				whatsappPhoneNumber,
				timezone: form.timezone.trim() || getInitialTimezone(),
			});
		} else {
			onSubmit({
				name: form.name.trim(),
				email: form.email.trim(),
				whatsappPhoneNumber,
				businessType: form.businessType.trim() || undefined,
				whatsappPhoneId: form.whatsappPhoneId.trim() || undefined,
				whatsappAccessToken: form.whatsappAccessToken.trim() || undefined,
				timezone: form.timezone.trim() || undefined,
				status: form.status,
				aiEnabled: form.aiEnabled,
			});
		}

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
							onChange={(event) =>
								setForm((current) => ({ ...current, name: event.target.value }))
							}
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
								setForm((current) => ({ ...current, phoneCountry }))
							}
							onPhoneValueChange={(phoneValue) =>
								setForm((current) => ({ ...current, phoneValue }))
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
							onChange={(event) =>
								setForm((current) => ({ ...current, email: event.target.value }))
							}
							placeholder="admin@negocio.com"
						/>
						{errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="timezone">Zona horaria</Label>
						<TimezoneInput
							timezone={form.timezone}
							setTimezone={(timezone) =>
								setForm((current) => ({ ...current, timezone }))
							}
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
										setForm((current) => ({
											...current,
											businessType: event.target.value,
										}))
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
										setForm((current) => ({
											...current,
											whatsappPhoneId: event.target.value,
										}))
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
										setForm((current) => ({
											...current,
											whatsappAccessToken: event.target.value,
										}))
									}
									placeholder="EAAL..."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Estado</Label>
								<Select
									value={form.status}
									onValueChange={(value) =>
										setForm((current) => ({
											...current,
											status: value as TenantStatus,
										}))
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
										setForm((current) => ({ ...current, aiEnabled }))
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
