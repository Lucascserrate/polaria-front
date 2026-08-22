'use client';

import 'leaflet/dist/leaflet.css';

import { useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Crosshair, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

interface Props {
	value: Coordinates | null;
	onChange: (value: Coordinates) => void;
}

/** Centro por defecto cuando el negocio todavía no eligió nada. */
const FALLBACK_CENTER: Coordinates = {
	latitude: -17.783327,
	longitude: -63.182140,
};

const ZOOM = 16;

/**
 * Informa el centro del mapa cada vez que deja de moverse.
 *
 * La selección es el centro y no un marcador que se arrastra: así el gesto es
 * mover el mapa, que es lo que la gente hace por instinto, y no hay que acertarle
 * a un pin chico con el dedo.
 */
const CenterReporter: React.FC<{ onChange: (value: Coordinates) => void }> = ({
	onChange,
}) => {
	useMapEvents({
		moveend: (event) => {
			const center = event.target.getCenter();
			onChange({ latitude: center.lat, longitude: center.lng });
		},
	});

	return null;
};

/** Botón para saltar a la ubicación del dispositivo. */
const LocateButton: React.FC = () => {
	const map = useMap();
	const [locating, setLocating] = useState(false);

	const locate = () => {
		if (!navigator.geolocation) return;

		setLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				map.flyTo(
					[position.coords.latitude, position.coords.longitude],
					ZOOM,
				);
				setLocating(false);
			},
			// Si el usuario niega el permiso no se insiste: el mapa se mueve a mano.
			() => setLocating(false),
			{ enableHighAccuracy: true, timeout: 10_000 },
		);
	};

	return (
		<Button
			type="button"
			variant="secondary"
			size="sm"
			className="absolute right-2 top-2 z-[500] gap-1 shadow-sm"
			disabled={locating}
			onClick={locate}
		>
			<Crosshair className="h-3.5 w-3.5" />
			{locating ? 'Buscando...' : 'Mi ubicación'}
		</Button>
	);
};

/**
 * Selector de ubicación sobre un mapa.
 *
 * Usa OpenStreetMap con Leaflet y no un proveedor con clave: el registro es
 * self-service, y un mapa que depende de una API key con facturación se rompe
 * para todos los negocios nuevos el día que esa cuenta tenga un problema.
 *
 * El pin es un elemento del DOM centrado por CSS, no un marcador de Leaflet. Así
 * se evita el asunto conocido de los iconos de Leaflet con los empaquetadores, y
 * el pin no puede quedar desalineado del punto que se está eligiendo.
 */
const LocationPicker: React.FC<Props> = ({ value, onChange }) => {
	const center = value ?? FALLBACK_CENTER;

	return (
		<div className="space-y-2">
			<div className="relative h-64 overflow-hidden rounded-lg border border-border">
				<MapContainer
					center={[center.latitude, center.longitude]}
					zoom={ZOOM}
					className="h-full w-full"
					// Sin esto, la rueda del mouse captura el scroll de la página al
					// pasar por encima del mapa.
					scrollWheelZoom={false}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<CenterReporter onChange={onChange} />
					<LocateButton />
				</MapContainer>

				{/* El pin marca el centro exacto y no intercepta los gestos del mapa. */}
				<MapPin
					aria-hidden="true"
					className="pointer-events-none absolute left-1/2 top-1/2 z-[400] h-8 w-8 -translate-x-1/2 -translate-y-full text-destructive drop-shadow"
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
