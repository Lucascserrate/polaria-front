import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		/**
		 * Las fotos del negocio y su logo viven en Cloudinary, así que el
		 * optimizador de Next necesita permiso explícito para ese host: sin esto,
		 * `next/image` rechaza la URL en tiempo de ejecución.
		 *
		 * Acotado a `/<cloud>/image/upload/**` y no a todo el dominio, que es la
		 * recomendación de Next: el hostname es compartido por todas las cuentas
		 * de Cloudinary, y abrirlo entero convertiría nuestro optimizador en un
		 * redimensionador gratuito para las imágenes de cualquiera.
		 */
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				pathname: '/**/image/upload/**',
			},
		],
	},

	/**
	 * Los nombres viejos de los iconos, en la raíz.
	 *
	 * Las etiquetas del `<head>` ya dicen dónde está cada icono y es lo que mira
	 * cualquier navegador de hoy. Pero iOS —y varios rastreadores— además piden
	 * estas rutas fijas a ciegas, sin leer el HTML, y hasta acá respondían 404.
	 * Cuesta tres líneas cerrarles esa puerta.
	 *
	 * Son reescrituras y no redirecciones a propósito: el que pide
	 * `/apple-touch-icon.png` recibe el PNG en esa misma URL, sin un salto de por
	 * medio que alguno pueda no seguir.
	 */
	async rewrites() {
		return [
			{ source: '/apple-touch-icon.png', destination: '/apple-icon' },
			{
				source: '/apple-touch-icon-precomposed.png',
				destination: '/apple-icon',
			},
			{ source: '/favicon.ico', destination: '/icon/32' },
		];
	},
};

export default nextConfig;
