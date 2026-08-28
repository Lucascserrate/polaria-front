'use client';

import { useState } from 'react';
import { Crosshair, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView, {
	type Coordinates,
	type FlyTarget,
} from '@/components/MapView';

export type { Coordinates };

interface Props {
	value: Coordinates | null;
	onChange: (value: Coordinates) => void;
}

/** Centro por defecto cuando el negocio todavía no eligió nada. Santa Cruz. */
const FALLBACK_CENTER: Coordinates = {
	latitude: -17.783327,
	longitude: -63.18214,
};

/**
 * Selector de ubicación sobre un mapa.
 *
 * Acá no hay nada de Mapbox: el mapa es `MapView`, y esta pantalla se ocupa solo de
 * elegir un punto. Antes tenía las dos cosas mezcladas —token, estilo, controles,
 * ciclo de vida del mapa— y el gesto de selección quedaba enterrado entre plomería.
 *
 * **La selección es el centro del mapa**, no un marcador que se arrastra. Mover el
 * mapa es lo que la gente hace por instinto, y no hay que acertarle a un pin chico
 * con el dedo. De ahí que el pin sea un elemento del DOM centrado por CSS y no un
 * `<Marker>`: así no puede quedar desalineado del punto que se está eligiendo, y no
 * intercepta los gestos.
 */
const LocationPicker: React.FC<Props> = ({ value, onChange }) => {
	const [locating, setLocating] = useState(false);

	/**
	 * Adónde mover el mapa, cuando lo pide el botón.
	 *
	 * Es lo único que lo mueve desde afuera. **No se actualiza con `value`**, y eso es
	 * lo que evita un bucle: cada movimiento del mapa produce un `value` nuevo, así
	 * que seguirlo lo movería mientras el usuario lo está arrastrando.
	 */
	const [flyTo, setFlyTo] = useState<FlyTarget | null>(null);

	/** Se lee una sola vez, al montar. Después la posición la manda el mapa. */
	const [initialCenter] = useState(() => value ?? FALLBACK_CENTER);

	const locate = () => {
		if (!navigator.geolocation) return;

		setLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setFlyTo({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					// Ver `FlyTarget`: sin esto, pedir dos veces el mismo punto no movería
					// el mapa la segunda vez.
					nonce: Date.now(),
				});
				setLocating(false);
			},
			// Si el usuario niega el permiso no se insiste: el mapa se mueve a mano.
			() => setLocating(false),
			{ enableHighAccuracy: true, timeout: 10_000 },
		);
	};

	return (
		<div className="space-y-2">
			<div className="relative h-64 overflow-hidden rounded-lg border border-border">
				<MapView
					initialCenter={initialCenter}
					onMoveEnd={onChange}
					flyTo={flyTo}
					className="h-full w-full"
					fallbackMessage="El mapa no está configurado en este entorno. Podés seguir sin elegir la ubicación."
				/>

				{/* A la izquierda: arriba a la derecha van los controles de zoom. */}
				<Button
					type="button"
					variant="secondary"
					size="sm"
					className="absolute top-2 left-2 z-10 gap-1 shadow-sm"
					disabled={locating}
					onClick={locate}
				>
					<Crosshair className="h-3.5 w-3.5" />
					{locating ? 'Buscando...' : 'Mi ubicación'}
				</Button>

				{/* El pin marca el centro exacto y no intercepta los gestos del mapa. */}
				<MapPin
					aria-hidden="true"
					className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-full drop-shadow"
				/>
			</div>

			<p className="text-xs text-muted-foreground">
				{value
					? `Ubicación elegida: ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
					: 'Mové el mapa para centrar el pin en la puerta de tu local.'}
			</p>
		</div>
	);
};

export default LocationPicker;
