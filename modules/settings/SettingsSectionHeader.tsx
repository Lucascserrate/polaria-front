import Breadcrumb from '@/components/Breadcrumb';
import { ROUTES } from '@/constants/routes';

interface Props {
	title: string;
	description: string;
}

/** Encabezado común de las subsecciones: migas, título y una línea de contexto. */
const SettingsSectionHeader: React.FC<Props> = ({ title, description }) => {
	return (
		<div className="space-y-3">
			<Breadcrumb
				trail={[{ label: 'Configuración', href: ROUTES.settings }]}
				current={title}
			/>
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</div>
	);
};

export default SettingsSectionHeader;
