'use client';

import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SectionHeader from '../SectionHeader';
import Field from '../Field';
import type { TenantDraft } from '../useTenantDraft';

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

interface Props {
	draft: TenantDraft;
	set: <K extends keyof TenantDraft>(key: K, value: TenantDraft[K]) => void;
	warnings?: string[];
}

/**
 * Dónde queda el local.
 *
 * Son dos datos y no uno, y por eso están los dos: la dirección es la que se
 * **lee** en la página pública de reservas, y las coordenadas son las que Polaria
 * **envía** por WhatsApp como ubicación. Una coordenada no le dice nada a nadie
 * en una página, y una calle con número no se abre en el mapa del teléfono.
 *
 * Reusa el mismo `LocationPicker` del onboarding en vez de una versión "de
 * soporte": es la misma interacción sobre el mismo dato, y dos implementaciones
 * significarían que un arreglo en una no llega a la otra.
 */
const LocationSection: React.FC<Props> = ({ draft, set, warnings = [] }) => (
	<div className="space-y-8">
		<SectionHeader
			title="Ubicación"
			description="Dónde recibe el negocio. Todo opcional: no todos atienden en un local."
		/>

		<Field
			label="Dirección"
			htmlFor="address"
			hint="Tal como la diría alguien dando indicaciones. Es lo que se lee en la página de reservas."
		>
			<Input
				id="address"
				value={draft.address}
				onChange={(event) => set('address', event.target.value)}
				placeholder="Av. Cristóbal de Mendoza 1234, Santa Cruz"
			/>
		</Field>

		<div className="space-y-2">
			<div className="flex items-center justify-between gap-2">
				<p className="text-sm font-medium">Coordenadas</p>
				{draft.location && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => set('location', null)}
					>
						Quitar
					</Button>
				)}
			</div>
			<p className="text-xs text-muted-foreground">
				Con esto cargado, Polaria puede mandarle la ubicación al cliente por
				WhatsApp sin que tenga que salir de la conversación.
			</p>
			<LocationPicker
				value={draft.location}
				onChange={(next) => set('location', next)}
			/>
		</div>

		{warnings.map((warning) => (
			<p key={warning} className="text-sm text-warning">
				{warning}
			</p>
		))}
	</div>
);

export default LocationSection;
