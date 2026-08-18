import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import useGetServices from '@/services/services/useGetServices';

interface Props {
	serviceIds: string[];
	setServiceIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const ServiceSection = ({ serviceIds, setServiceIds }: Props) => {
	const { data: servicesData } = useGetServices();

	const services = servicesData || [];
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Label>Servicios</Label>
				{serviceIds.length > 0 ? (
					<Badge variant="secondary">{serviceIds.length} seleccionados</Badge>
				) : (
					<Badge variant="outline">Sin servicios</Badge>
				)}
			</div>

			<div className="border border-border rounded-lg p-3 space-y-2 max-h-56 overflow-auto">
				{services.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No hay servicios activos para asignar.
					</p>
				) : (
					services.map((service) => {
						const checked = serviceIds.includes(service.id);
						return (
							<label
								key={service.id}
								className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer"
							>
								<Checkbox
									checked={checked}
									onCheckedChange={(next) => {
										const isChecked = next === true;
										setServiceIds((prev) => {
											if (isChecked) {
												return Array.from(new Set([...prev, service.id]));
											}
											return prev.filter((id) => id !== service.id);
										});
									}}
								/>
								<span className="text-sm">{service.name}</span>
							</label>
						);
					})
				)}
			</div>
		</div>
	);
};

export default ServiceSection;
