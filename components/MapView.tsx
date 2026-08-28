'use client';

// Sin esto, el canvas y los controles del mapa se dibujan sin estilos.
import 'mapbox-gl/dist/mapbox-gl.css';

import { useEffect, useRef } from 'react';
import Map, { NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import { MAPBOX_STYLE, MAPBOX_TOKEN } from '@/constants/env';
import { cn } from '@/lib/utils';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

/**
 * Adónde volar, cuando alguien lo pide desde afuera.
 *
 * Lleva un `nonce` además de las coordenadas, y no es un detalle: sin él, pedir dos
 * veces seguidas el mismo punto —mover el mapa y volver a tocar "Mi ubicación"— no
 * cambiaría el valor, el efecto no se dispararía, y el botón parecería roto la
 * segunda vez.
 */
export interface FlyTarget extends Coordinates {
	nonce: number;
}

interface Props {
	/** Dónde abre el mapa. Solo se lee al montar; después manda el propio mapa. */
	initialCenter: Coordinates;
	zoom?: number;
	className?: string;
	/** Se llama cuando el mapa deja de moverse, con su centro. */
	onMoveEnd?: (center: Coordinates) => void;
	/** Cambiar esto mueve el mapa. Ver `FlyTarget`. */
	flyTo?: FlyTarget | null;
	/** Qué decir cuando no hay token configurado. */
	fallbackMessage?: string;
}

const DEFAULT_ZOOM = 16;

/**
 * Estilo por defecto, si el negocio no configuró uno propio.
 *
 * Existe para que la falta de `NEXT_PUBLIC_MAPBOX_STYLE` no deje el mapa en blanco:
 * sin estilo, Mapbox no dibuja nada y parece un fallo de red.
 */
const DEFAULT_STYLE = 'mapbox://styles/mapbox/streets-v12';

/**
 * El mapa, y solo el mapa.
 *
 * Existe para que quien lo use no tenga que saber de Mapbox. `LocationPicker`, por
 * ejemplo, se ocupa de elegir una ubicación —el pin centrado, el botón de "mi
 * ubicación", el texto con las coordenadas— y no de tokens, estilos ni controles.
 *
 * El token va acá adentro y no como prop: es una constante del entorno, no una
 * decisión de cada pantalla. Y **sin token no se renderiza el mapa** sino un aviso:
 * un `<Map>` sin credenciales queda gris y se lee como un error de carga.
 *
 * **No tiene prop de marcador, y es a propósito.** Su único consumidor elige el
 * centro del mapa, y para eso el pin tiene que estar clavado al centro del
 * contenedor —no a una coordenada—: durante el arrastre las coordenadas todavía son
 * las de antes, así que un `<Marker>` se correría del centro y saltaría de vuelta al
 * soltar. El día que exista un mapa que solo muestre una ubicación guardada, ahí sí
 * entra un `<Marker>`, que son seis líneas.
 */
export const MapView: React.FC<Props> = ({
	initialCenter,
	zoom = DEFAULT_ZOOM,
	className,
	onMoveEnd,
	flyTo,
	fallbackMessage = 'El mapa no está configurado en este entorno.',
}) => {
	const mapRef = useRef<MapRef | null>(null);

	useEffect(() => {
		if (!flyTo) return;

		mapRef.current?.flyTo({
			center: [flyTo.longitude, flyTo.latitude],
			zoom,
			essential: true,
		});
	}, [flyTo, zoom]);

	if (!MAPBOX_TOKEN) {
		return (
			<div
				className={cn(
					'flex items-center justify-center rounded-lg border border-border bg-muted/40 px-6 text-center',
					className,
				)}
			>
				<p className="text-sm text-muted-foreground">{fallbackMessage}</p>
			</div>
		);
	}

	/*
	 * El `className` va en un contenedor y no en `<Map>`: react-map-gl v8 no lo
	 * acepta —solo `style`— y además así el mapa y el aviso de "sin token" tienen la
	 * misma forma, que es lo que evita que la pantalla salte cuando falta la
	 * credencial.
	 */
	return (
		<div className={className}>
			<Map
				ref={mapRef}
				mapboxAccessToken={MAPBOX_TOKEN}
				mapStyle={MAPBOX_STYLE || DEFAULT_STYLE}
				initialViewState={{
					latitude: initialCenter.latitude,
					longitude: initialCenter.longitude,
					zoom,
				}}
				style={{ width: '100%', height: '100%' }}
				/*
				 * La rueda del mouse hace zoom.
				 *
				 * El costo es conocido y se acepta: con el cursor sobre el mapa, la rueda
				 * deja de scrollear la página. Si eso molesta, el reemplazo no es apagar
				 * esto sino `cooperativeGestures`, que pide Ctrl o dos dedos y muestra un
				 * cartel explicándolo.
				 */
				scrollZoom={true}
				// Los botones de zoom siguen estando: en táctil y con teclado son la
				// única vía, y no todo el mundo tiene rueda.
				//
				// El mapa es para ubicar un punto, no para explorar: rotarlo o inclinarlo
				// solo desorienta.
				dragRotate={false}
				pitchWithRotate={false}
				touchPitch={false}
				onMoveEnd={(event) =>
					onMoveEnd?.({
						latitude: event.viewState.latitude,
						longitude: event.viewState.longitude,
					})
				}
			>
				<NavigationControl position="top-right" showCompass={false} />
			</Map>
		</div>
	);
};

export default MapView;
