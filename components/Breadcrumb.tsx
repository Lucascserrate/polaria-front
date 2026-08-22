import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Props {
	/** Tramos anteriores, en orden. El último es la pantalla actual. */
	trail: Array<{ label: string; href: string }>;
	current: string;
}

/**
 * Migas de pan de una subsección.
 *
 * Existe porque las secciones de Configuración dejaron de ser tarjetas en una
 * misma página: al tener ruta propia hace falta decir dónde está uno y cómo
 * volver, y el botón "atrás" del navegador no es una respuesta para eso.
 */
const Breadcrumb: React.FC<Props> = ({ trail, current }) => {
	return (
		<nav aria-label="Ruta de navegación" className="flex items-center gap-1.5">
			{trail.map((step) => (
				<span key={step.href} className="flex items-center gap-1.5">
					<Link
						href={step.href}
						className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					>
						{step.label}
					</Link>
					<ChevronRight
						aria-hidden="true"
						className="h-3.5 w-3.5 text-muted-foreground"
					/>
				</span>
			))}
			<span className="text-sm font-medium text-foreground" aria-current="page">
				{current}
			</span>
		</nav>
	);
};

export default Breadcrumb;
