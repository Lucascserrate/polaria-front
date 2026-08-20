'use client';

import {
	selectableClass,
	type ServiceOption,
} from '@/modules/appointment-wizard/options';

interface Props {
	services: ServiceOption[];
	selectedId: string | null;
	onSelect: (serviceId: string) => void;
}

const ServiceStep: React.FC<Props> = ({ services, selectedId, onSelect }) => {
	if (services.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No hay servicios activos. Creá uno en la pantalla de Servicios.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			{services.map((service) => (
				<button
					key={service.id}
					type="button"
					onClick={() => onSelect(service.id)}
					className={selectableClass(service.id === selectedId)}
				>
					<span className="block text-sm font-medium">{service.name}</span>
					<span className="block text-xs text-muted-foreground">
						{service.durationMinutes} min
					</span>
				</button>
			))}
		</div>
	);
};

export default ServiceStep;
