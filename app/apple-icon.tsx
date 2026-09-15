import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * El icono que usa iOS cuando alguien agrega la aplicación a la pantalla de
 * inicio, y el que Safari muestra en los favoritos.
 *
 * Es otro archivo y no un tamaño más de `icon.tsx` porque iOS no mira el
 * favicon: si no encuentra `apple-touch-icon`, guarda una captura de la
 * pantalla y la pone como icono. 180 es el tamaño que pide.
 *
 * Dos diferencias con el favicon, las dos a propósito:
 *
 * - **Sin esquinas redondeadas.** El sistema le aplica su propia máscara; si lo
 *   redondeáramos nosotros, se redondearía dos veces.
 * - **La estrella va suelta**, ocupando menos de un tercio del lado. A 32
 *   píxeles ese aire deja una mancha negra con un punto adentro y por eso el
 *   favicon la agranda; acá el icono se ve grande y el aire es el tratamiento
 *   de la marca.
 */
export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#111111',
			}}
		>
			<svg width="54" height="54" viewBox="0 0 24 24" fill="none">
				<path
					d="M12 1.5c.62 5.6 4.9 9.88 10.5 10.5-5.6.62-9.88 4.9-10.5 10.5-.62-5.6-4.9-9.88-10.5-10.5C7.1 11.38 11.38 7.1 12 1.5Z"
					fill="#ffffff"
				/>
			</svg>
		</div>,
		size,
	);
}
