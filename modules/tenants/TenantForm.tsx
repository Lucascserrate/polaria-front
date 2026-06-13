'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type {
	CreateTenantDto,
	Tenant,
	TenantStatus,
	UpdateTenantDto,
} from '@/types/tenant.types';

interface TenantFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialTenant?: Tenant | null;
	onSubmit: (tenant: CreateTenantDto | UpdateTenantDto) => void;
}

const isValidEmail = (value: string) =>
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const getInitialTimezone = () =>
	Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/La_Paz';

export function TenantForm({
	open,
	onOpenChange,
	initialTenant,
	onSubmit,
}: TenantFormProps) {
	const [businessName, setBusinessName] = useState(
		() => initialTenant?.name ?? '',
	);
	const [businessType, setBusinessType] = useState(
		() => initialTenant?.businessType ?? '',
	);
	const [email, setEmail] = useState(() => initialTenant?.email ?? '');
	const [phone, setPhone] = useState(
		() => initialTenant?.whatsappPhoneNumber ?? '',
	);
	const [whatsappPhoneId, setWhatsappPhoneId] = useState(
		() => initialTenant?.whatsappPhoneId ?? '',
	);
	const [whatsappAccessToken, setWhatsappAccessToken] = useState(
		() => initialTenant?.whatsappAccessToken ?? '',
	);
	const [timezone, setTimezone] = useState(
		() => initialTenant?.timezone ?? getInitialTimezone(),
	);
	const [status, setStatus] = useState<TenantStatus>(
		() => initialTenant?.status ?? 'active',
	);
	const [aiEnabled, setAiEnabled] = useState(
		() => initialTenant?.aiEnabled ?? true,
	);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const nextErrors: Record<string, string> = {};

		if (!businessName.trim()) {
			nextErrors.businessName = 'El nombre del negocio es obligatorio.';
		}

		if (!email.trim()) {
			nextErrors.email = 'El correo es obligatorio.';
		} else if (!isValidEmail(email)) {
			nextErrors.email = 'Ingresa un correo válido.';
		}

		if (!phone.trim()) {
			nextErrors.phone = 'El número de WhatsApp es obligatorio.';
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validate()) return;

		onSubmit({
			name: businessName.trim(),
			businessType: businessType.trim() || undefined,
			email: email.trim(),
			whatsappPhoneNumber: phone.trim(),
			whatsappPhoneId: whatsappPhoneId.trim() || undefined,
			whatsappAccessToken: whatsappAccessToken.trim() || undefined,
			timezone: timezone.trim() || undefined,
			status,
			aiEnabled,
		});

		onOpenChange(false);
	};

	const mode = initialTenant ? 'edit' : 'create';

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{mode === 'create' ? 'Crear Tenant' : 'Editar Tenant'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'create'
							? 'Completa los datos del tenant y sus credenciales de WhatsApp.'
							: 'Actualiza la información base y las credenciales del tenant.'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="businessName">Nombre del negocio</Label>
						<Input
							id="businessName"
							value={businessName}
							onChange={(event) => setBusinessName(event.target.value)}
							placeholder="Ej. Barbería Central"
						/>
						{errors.businessName && (
							<p className="text-sm text-red-600">{errors.businessName}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="businessType">Tipo de negocio</Label>
						<Input
							id="businessType"
							value={businessType}
							onChange={(event) => setBusinessType(event.target.value)}
							placeholder="Ej. barberia"
						/>
						{errors.businessType && (
							<p className="text-sm text-red-600">{errors.businessType}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Correo principal</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="admin@negocio.com"
						/>
						{errors.email && (
							<p className="text-sm text-red-600">{errors.email}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone">WhatsApp Phone Number</Label>
						<Input
							id="phone"
							value={phone}
							onChange={(event) => setPhone(event.target.value)}
							placeholder="15556384943"
						/>
						{errors.phone && (
							<p className="text-sm text-red-600">{errors.phone}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="whatsappPhoneId">WhatsApp Phone ID</Label>
						<Input
							id="whatsappPhoneId"
							value={whatsappPhoneId}
							onChange={(event) => setWhatsappPhoneId(event.target.value)}
							placeholder="1013549818517591"
						/>
						{errors.whatsappPhoneId && (
							<p className="text-sm text-red-600">{errors.whatsappPhoneId}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="whatsappAccessToken">WhatsApp Access Token</Label>
						<Input
							id="whatsappAccessToken"
							value={whatsappAccessToken}
							onChange={(event) => setWhatsappAccessToken(event.target.value)}
							placeholder="EAAL..."
						/>
						{errors.whatsappAccessToken && (
							<p className="text-sm text-red-600">
								{errors.whatsappAccessToken}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="timezone">Zona horaria</Label>
						<Input
							id="timezone"
							value={timezone}
							onChange={(event) => setTimezone(event.target.value)}
							placeholder="America/La_Paz"
						/>
						{errors.timezone && (
							<p className="text-sm text-red-600">{errors.timezone}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="status">Estado</Label>
						<Select
							value={status}
							onValueChange={(value) => setStatus(value as TenantStatus)}
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
						<Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button type="submit">
							{mode === 'create' ? 'Crear Tenant' : 'Guardar cambios'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
