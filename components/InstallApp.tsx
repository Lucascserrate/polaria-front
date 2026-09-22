'use client';

import { MonitorDown } from 'lucide-react';

import { promptInstall } from '@/components/install-prompt';
import { useCanInstall } from '@/components/use-install-prompt';
import { cn } from '@/lib/utils';

interface Props {
	className?: string;
}

/**
 * La oferta de instalar Polaria, cuando el navegador la permite.
 *
 * No se dibuja nada si no hay nada que ofrecer, y ése es todo el criterio: no
 * hay lista de navegadores ni de sistemas operativos escrita acá. En Chrome y
 * Edge aparece; en Safari y Firefox no llega el evento y el footer queda como
 * estaba; adentro de la aplicación ya instalada tampoco, que sería ofrecer lo
 * que ya tienen.
 *
 * El texto dice "aplicación" y no "descargar" a propósito: no se descarga nada
 * ni hay que desinstalar después desde el panel de control. Es esta misma
 * pantalla en una ventana propia.
 */
const InstallApp: React.FC<Props> = ({ className }) => {
	const available = useCanInstall();

	if (!available) return null;

	return (
		<button
			type="button"
			/*
			 * No hace falta apagarlo mientras el diálogo está abierto: al pedirlo, la
			 * oferta deja de existir y el botón se va solo de la pantalla.
			 */
			onClick={() => void promptInstall()}
			title="Instalar aplicación"
			className={cn(
				'flex w-full cursor-pointer items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground',
				'collapsed:justify-center collapsed:px-0',
				className,
			)}
		>
			<MonitorDown className="size-4 shrink-0" aria-hidden="true" />
			<span className="collapsed:hidden">Instalar aplicación</span>
			{/*
			 * Colapsado el nombre desaparece de la pantalla pero no del botón: sin
			 * esto, un lector de pantalla anuncia un botón sin nombre.
			 */}
			<span className="sr-only hidden collapsed:inline">
				Instalar aplicación
			</span>
		</button>
	);
};

export default InstallApp;
