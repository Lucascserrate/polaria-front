import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Tests de la lógica pura, sin navegador.
 *
 * No hay entorno de DOM ni render de componentes a propósito: lo que se prueba
 * acá es la aritmética que ubica cada cita en el calendario, que es la que se
 * rompe sin lanzar ningún error. Un componente mal maquetado se ve; una cita
 * media hora más arriba, no.
 */
export default defineConfig({
	test: {
		environment: 'node',
		include: ['**/*.test.ts'],
		exclude: ['node_modules/**', '.next/**'],
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('.', import.meta.url)),
		},
	},
});
