'use client';

import * as React from 'react';
import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import PhoneInput from 'react-phone-number-input/input';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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

const getTimezoneOptions = () => {
	if (
		typeof Intl !== 'undefined' &&
		typeof Intl.supportedValuesOf === 'function'
	) {
		const supported = Intl.supportedValuesOf('timeZone');
		if (supported && supported.length > 0) {
			return supported
				.filter((value): value is string => !!value)
				.sort((a, b) => a.localeCompare(b));
		}
	}

	return [getInitialTimezone()];
};

const getCountryLabel = (countryCode: string) => {
	try {
		const displayNames = new Intl.DisplayNames(['es'], { type: 'region' });
		return displayNames.of(countryCode) ?? countryCode;
	} catch {
		return countryCode;
	}
};

const getInitialPhoneCountry = (value: string) => {
	if (!value) return 'BO';

	try {
		const parsedPhone = parsePhoneNumber(value);
		return parsedPhone?.country ?? 'BO';
	} catch {
		return 'BO';
	}
};

const PhoneInputField = React.forwardRef<
	HTMLInputElement,
	React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
	<Input
		ref={ref}
		type="tel"
		className={cn(
			'border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
			className,
		)}
		{...props}
	/>
));

PhoneInputField.displayName = 'PhoneInputField';

export function TenantForm({
	open,
	onOpenChange,
	initialTenant,
	onSubmit,
}: TenantFormProps) {
	const mode = initialTenant ? 'edit' : 'create';

	const [name, setName] = useState(() => initialTenant?.name ?? '');
	const [email, setEmail] = useState(() => initialTenant?.email ?? '');
	const [phoneValue, setPhoneValue] = useState(
		() => initialTenant?.whatsappPhoneNumber ?? '',
	);
	const [phoneCountry, setPhoneCountry] = useState(() =>
		getInitialPhoneCountry(initialTenant?.whatsappPhoneNumber ?? ''),
	);
	const [countrySearch, setCountrySearch] = useState('');
	const [countryPickerOpen, setCountryPickerOpen] = useState(false);
	const [timezoneSearch, setTimezoneSearch] = useState('');
	const [timezonePickerOpen, setTimezonePickerOpen] = useState(false);
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

	React.useEffect(() => {
		if (initialTenant?.timezone) {
			setTimezone(initialTenant.timezone);
		} else {
			setTimezone(getInitialTimezone());
		}
	}, [initialTenant, open]);

	const countryOptions = React.useMemo(
		() =>
			getCountries().map((countryCode) => ({
				value: countryCode,
				label: getCountryLabel(countryCode),
				callingCode: getCountryCallingCode(countryCode),
			})),
		[],
	);

	const filteredCountries = React.useMemo(() => {
		const normalizedQuery = countrySearch.trim().toLowerCase();
		if (!normalizedQuery) return countryOptions;

		return countryOptions.filter((option) => {
			const query = normalizedQuery.replace(/\+/g, '');
			return (
				option.label.toLowerCase().includes(query) ||
				option.callingCode.toLowerCase().includes(query)
			);
		});
	}, [countryOptions, countrySearch]);

	const timezoneOptions = React.useMemo(() => getTimezoneOptions(), []);
	const filteredTimezones = React.useMemo(() => {
		const normalizedQuery = timezoneSearch.trim().toLowerCase();
		if (!normalizedQuery) return timezoneOptions;

		return timezoneOptions.filter((option) =>
			option.toLowerCase().includes(normalizedQuery),
		);
	}, [timezoneOptions, timezoneSearch]);

	const validate = () => {
		const nextErrors: Record<string, string> = {};

		if (!name.trim()) {
			nextErrors.name = 'El nombre es obligatorio.';
		}

		if (!phoneValue.trim()) {
			nextErrors.tenantNumber = 'El número es obligatorio.';
		} else if (!isValidPhoneNumber(phoneValue)) {
			nextErrors.tenantNumber =
				'Ingresa un número válido para el país seleccionado.';
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

		const composedPhoneNumber = phoneValue.trim();

		if (mode === 'create') {
			onSubmit({
				name: name.trim(),
				email: email.trim(),
				whatsappPhoneNumber: composedPhoneNumber,
				timezone: timezone.trim() || getInitialTimezone(),
			});
		} else {
			onSubmit({
				name: name.trim(),
				email: email.trim(),
				whatsappPhoneNumber: composedPhoneNumber,
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
						<Label htmlFor="name">Nombre</Label>
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
						<Label htmlFor="tenantNumber">Número</Label>
						<div className="flex overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
							<Popover
								open={countryPickerOpen}
								onOpenChange={setCountryPickerOpen}
							>
								<PopoverTrigger asChild>
									<button
										type="button"
										className="flex shrink-0 items-center gap-2 border-r border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
									>
										<span className="text-base leading-none">
											{String.fromCodePoint(
												...Array.from(phoneCountry).map(
													(char) => 127397 + char.charCodeAt(0),
												),
											)}
										</span>
										<span className="whitespace-nowrap">
											+{getCountryCallingCode(phoneCountry)}
										</span>
										<ChevronDown className="h-4 w-4 opacity-70" />
									</button>
								</PopoverTrigger>
								<PopoverContent align="start" className="w-[320px] p-0">
									<div className="border-b p-2">
										<div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
											<Search className="h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Buscar país o código"
												value={countrySearch}
												onChange={(event) =>
													setCountrySearch(event.target.value)
												}
												className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
											/>
										</div>
									</div>
									<div className="max-h-56 overflow-y-auto p-1">
										{filteredCountries.map((option) => {
											const isSelected = option.value === phoneCountry;
											return (
												<button
													type="button"
													key={option.value}
													className={cn(
														'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
														isSelected && 'bg-accent text-accent-foreground',
													)}
													onClick={() => {
														setPhoneCountry(option.value);
														setCountrySearch('');
														setCountryPickerOpen(false);
													}}
												>
													<span className="flex items-center gap-2">
														<span className="text-base leading-none">
															{String.fromCodePoint(
																...Array.from(option.value).map(
																	(char) => 127397 + char.charCodeAt(0),
																),
															)}
														</span>
														<span className="font-medium">{option.label}</span>
													</span>
													<span className="text-muted-foreground">
														+{option.callingCode}
													</span>
												</button>
											);
										})}
										{filteredCountries.length === 0 && (
											<div className="px-3 py-4 text-sm text-muted-foreground">
												No se encontraron resultados.
											</div>
										)}
									</div>
								</PopoverContent>
							</Popover>
							<div className="flex-1">
								<PhoneInput
									international
									country={phoneCountry}
									value={phoneValue}
									onChange={(value) => setPhoneValue(value ?? '')}
									inputComponent={PhoneInputField}
									className="w-full"
									inputClassName="w-full border-0 bg-transparent px-3 py-2 text-sm shadow-none outline-none focus-visible:ring-0"
									placeholder="Ej. 3001234567"
								/>
							</div>
						</div>
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

					{(mode === 'create' || mode === 'edit') && (
						<div className="space-y-2">
							<Label htmlFor="timezone">Zona horaria</Label>
							<div className="overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
								<Popover
									open={timezonePickerOpen}
									onOpenChange={setTimezonePickerOpen}
								>
									<PopoverTrigger asChild>
										<button
											type="button"
											className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
										>
											<span className="truncate">
												{timezone || 'Selecciona una zona horaria'}
											</span>
											<ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
										</button>
									</PopoverTrigger>
									<PopoverContent
										align="start"
										className="w-90 max-w-[calc(100vw-2rem)] p-0"
									>
										<div className="border-b p-2">
											<div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
												<Search className="h-4 w-4 text-muted-foreground" />
												<Input
													placeholder="Buscar zona horaria"
													value={timezoneSearch}
													onChange={(event) =>
														setTimezoneSearch(event.target.value)
													}
													className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
												/>
											</div>
										</div>
										<div className="max-h-56 overflow-y-auto p-1">
											{filteredTimezones.map((option) => {
												const isSelected = option === timezone;
												return (
													<button
														type="button"
														key={option}
														className={cn(
															'flex w-full items-start rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
															isSelected && 'bg-accent text-accent-foreground',
														)}
														onClick={() => {
															setTimezone(option);
															setTimezoneSearch('');
															setTimezonePickerOpen(false);
														}}
													>
														<span className="font-medium">{option}</span>
													</button>
												);
											})}
											{filteredTimezones.length === 0 && (
												<div className="px-3 py-4 text-sm text-muted-foreground">
													No se encontraron resultados.
												</div>
											)}
										</div>
									</PopoverContent>
								</Popover>
							</div>
							<p className="text-xs text-muted-foreground">
								{mode === 'create'
									? 'Se completa automáticamente según el navegador, pero puedes cambiarla si lo prefieres.'
									: 'Selecciona la zona horaria del negocio.'}
							</p>
						</div>
					)}

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
