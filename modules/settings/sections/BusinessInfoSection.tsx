'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import BusinessTypeStep from '@/modules/onboarding/steps/BusinessTypeStep';
import TimezoneSelect from '@/modules/settings/TimezoneSelect';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';
import type { Coordinates } from '@/modules/onboarding/LocationPicker';

/** Mapbox GL toca `window` al importarse, así que el mapa se carga en el navegador. */
const LocationPicker = dynamic(
	() => import('@/modules/onboarding/LocationPicker'),
	{
		ssr: false,
		loading: () => (
			<div className="h-64 animate-pulse rounded-lg border border-border bg-muted" />
		),
	},
);

/**
 * Información del negocio: los mismos cuatro datos que pide el onboarding.
 *
 * Reutiliza `BusinessTypeStep` y `LocationPicker` del wizard en lugar de tener
 * una versión "de configuración": son el mismo dato y la misma interacción, y dos
 * implementaciones significarían que un arreglo en una no llega a la otra.
 *
 * A diferencia del wizard, acá se guarda esta sección sola. En el onboarding se
 * guarda todo al final porque abandonar a mitad de camino dejaría el negocio
 * incompleto; acá el negocio ya existe y cada pantalla es independiente.
 */
/**
 * El enlace de la página pública, para copiar y pegar donde haga falta.
 *
 * Es de sólo lectura a propósito: el slug se asigna una vez a partir del nombre
 * y no cambia aunque el negocio se renombre, porque el enlace ya está pegado en
 * un QR sobre el mostrador y en la biografía de Instagram. Un campo editable
 * acá sería una forma silenciosa de romper todo eso.
 */
const PublicPageLink: React.FC<{ url: string | null }> = ({ url }) => {
	const [copied, setCopied] = useState(false);

	if (!url) return null;

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// Sin permiso de portapapeles queda el enlace a la vista para copiarlo
			// a mano, que es lo que hace la mayoría igual.
		}
	};

	return (
		<div className="space-y-2">
			<Label>Tu página de reservas</Label>
			<div className="flex flex-wrap items-center gap-2">
				<a
					href={url}
					target="_blank"
					rel="noreferrer"
					className="truncate rounded-md border border-border bg-muted px-3 py-2 text-sm underline-offset-4 hover:underline"
				>
					{url}
				</a>
				<Button variant="outline" size="sm" onClick={() => void copy()}>
					{copied ? (
						<>
							<Check className="mr-2 h-4 w-4" />
							Copiado
						</>
					) : (
						'Copiar enlace'
					)}
				</Button>
			</div>
			<p className="text-sm text-muted-foreground">
				Compartilo por WhatsApp, en tu perfil de Instagram o en un QR: tus
				clientes reservan desde ahí sin escribirte.
			</p>
		</div>
	);
};

const BusinessInfoSection: React.FC = () => {
	const { data: settings, isLoading } = useGetSettings();
	const {
		mutateAsync: save,
		isPending,
		isSuccess,
		isError,
	} = useUpdateSettings();

	const [name, setName] = useState<string | null>(null);
	const [businessType, setBusinessType] = useState<string | null>(null);
	const [timezone, setTimezone] = useState<string | null>(null);
	const [address, setAddress] = useState<string | null>(null);
	const [location, setLocation] = useState<Coordinates | null>(null);
	const [locationTouched, setLocationTouched] = useState(false);

	const currentName = name ?? settings?.polariaName ?? '';
	const currentType = businessType ?? settings?.businessType ?? '';
	const currentTimezone = timezone ?? settings?.timezone ?? '';
	const currentAddress = address ?? settings?.address ?? '';
	const currentLocation = locationTouched
		? location
		: (settings?.location ?? null);

	const canSave = currentName.trim().length > 0 && Boolean(currentType);

	const handleSave = async () => {
		if (!canSave) return;

		await save({
			polariaName: currentName.trim(),
			businessType: currentType,
			timezone: currentTimezone || undefined,
			// Vacío borra la dirección: es lo que significa haber limpiado el campo.
			address: currentAddress.trim() || null,
			location: currentLocation,
		});
	};

	if (isLoading) {
		return (
			<p className="text-sm text-muted-foreground">Cargando...</p>
		);
	}

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<Label htmlFor="business-name">Nombre del negocio</Label>
				<Input
					id="business-name"
					value={currentName}
					disabled={isPending}
					placeholder="Studio Nova"
					onChange={(event) => setName(event.target.value)}
				/>
				<p className="text-sm text-muted-foreground">
					Es el nombre con el que Polaria se presenta a tus clientes.
				</p>
			</div>

			<PublicPageLink url={settings?.publicBookingUrl ?? null} />

			<div className="space-y-2">
				<Label>Tipo de negocio</Label>
				<BusinessTypeStep value={currentType} onChange={setBusinessType} />
			</div>

			<TimezoneSelect
				value={currentTimezone}
				disabled={isPending}
				onChange={setTimezone}
			/>

			<div className="space-y-2">
				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="business-address">Dirección</Label>
					<span className="text-xs text-muted-foreground">Opcional</span>
				</div>
				<Input
					id="business-address"
					value={currentAddress}
					disabled={isPending}
					placeholder="Av. Cristóbal de Mendoza 1234, Santa Cruz"
					onChange={(event) => setAddress(event.target.value)}
				/>
				<p className="text-sm text-muted-foreground">
					Es la dirección que se lee en tu página de reservas. Las coordenadas
					de abajo son otra cosa: sirven para abrir el mapa y para enviar la
					ubicación por WhatsApp.
				</p>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between gap-2">
					<Label>Ubicación</Label>
					<span className="text-xs text-muted-foreground">Opcional</span>
				</div>
				<p className="text-sm text-muted-foreground">
					Con la ubicación cargada, Polaria puede enviársela a tus clientes por
					WhatsApp.
				</p>
				<LocationPicker
					value={currentLocation}
					onChange={(next) => {
						setLocationTouched(true);
						setLocation(next);
					}}
				/>
			</div>

			{isError && (
				<p className="text-sm text-red-600">
					No se pudo guardar. Intentá de nuevo.
				</p>
			)}

			<Button
				size="lg"
				disabled={!canSave || isPending}
				onClick={() => void handleSave()}
			>
				{isPending ? (
					'Guardando...'
				) : isSuccess ? (
					<>
						<Check className="mr-2 h-4 w-4" />
						Guardado
					</>
				) : (
					'Guardar cambios'
				)}
			</Button>
		</div>
	);
};

export default BusinessInfoSection;
