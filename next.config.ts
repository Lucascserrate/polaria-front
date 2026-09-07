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
};

export default nextConfig;
