interface Props {
	title: string;
	description: string;
}

/** Título de sección y la línea que dice para qué sirve. */
const SectionHeader: React.FC<Props> = ({ title, description }) => (
	<div>
		<h2 className="text-xl font-semibold tracking-tight">{title}</h2>
		<p className="mt-1 text-sm text-muted-foreground">{description}</p>
	</div>
);

export default SectionHeader;
