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
	const mode = initialTenant ? 'edit' : 'create';

	const [name, setName] = useState(() => initialTenant?.name ?? '');
	const [email, setEmail] = useState(() => initialTenant?.email ?? '');
	const [tenantNumber, setTenantNumber] = useState(
		() => initialTenant?.whatsappPhoneNumber ?? '',
	);
	const [businessType, setBusinessType] = useState(
		() => initialTenant?.businessType ?? '',
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

		if (!name.trim()) {
			nextErrors.name = 'El nombre del tenant es obligatorio.';
		}

		if (!tenantNumber.trim()) {
			nextErrors.tenantNumber = 'El número del tenant es obligatorio.';
		}

		if (!email.trim()) {
			nextErrors.email = 'El correo electrónico es obligatorio.';
		} else if (!isValidEmail(email)) {
			nextErrors.email = 'Ingresa un correo válido.';
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validate()) return;

		if (mode === 'create') {
			onSubmit({
				name: name.trim(),
				email: email.trim(),
				whatsappPhoneNumber: tenantNumber.trim(),
			});
		} else {
			onSubmit({
				name: name.trim(),
				email: email.trim(),
				whatsappPhoneNumber: tenantNumber.trim(),
				businessType: businessType.trim() || undefined,
				whatsappPhoneId: whatsappPhoneId.trim() || undefined,
				whatsappAccessToken: whatsappAccessToken.trim() || undefined,
				timezone: timezone.trim() || undefined,
				status,
				aiEnabled,
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
						<Label htmlFor="name">Nombre del tenant</Label>
						<Input
							id="name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Ej. Barbería Central"
						/>
						{errors.name && (
							<p className="text-sm text-red-600">{errors.name}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="tenantNumber">Número del tenant</Label>
						<Input
							id="tenantNumber"
							value={tenantNumber}
							onChange={(event) => setTenantNumber(event.target.value)}
							placeholder="Ej. 15556384943"
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
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="admin@negocio.com"
						/>
						{errors.email && (
							<p className="text-sm text-red-600">{errors.email}</p>
						)}
					</div>

					{mode === 'edit' && (
						<>
							<div className="space-y-2">
								<Label htmlFor="businessType">Tipo de negocio</Label>
								<Input
									id="businessType"
									value={businessType}
									onChange={(event) => setBusinessType(event.target.value)}
									placeholder="Ej. barberia"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="whatsappPhoneId">WhatsApp Phone ID</Label>
								<Input
									id="whatsappPhoneId"
									value={whatsappPhoneId}
									onChange={(event) => setWhatsappPhoneId(event.target.value)}
									placeholder="1013549818517591"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="whatsappAccessToken">
									WhatsApp Access Token
								</Label>
								<Input
									id="whatsappAccessToken"
									value={whatsappAccessToken}
									onChange={(event) =>
										setWhatsappAccessToken(event.target.value)
									}
									placeholder="EAAL..."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="timezone">Zona horaria</Label>
								<Input
									id="timezone"
									value={timezone}
									onChange={(event) => setTimezone(event.target.value)}
									placeholder="America/La_Paz"
								/>
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
