interface Props {
	title: string;
	description: string;
}

/**
 * El encabezado de una sección del editor.
 *
 * Título y una línea que dice para qué sirve la sección. Es lo que toma de las
 * referencias: sin la línea, el nav lateral y el título repiten la misma palabra y
 * la pantalla no dice nada que no dijera el menú.
 */
const SectionHeader: React.FC<Props> = ({ title, description }) => (
	<div>
		<h2 className="text-xl font-semibold tracking-tight">{title}</h2>
		<p className="mt-1 text-sm text-muted-foreground">{description}</p>
	</div>
);

export default SectionHeader;
