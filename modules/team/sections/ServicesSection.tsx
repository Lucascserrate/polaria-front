'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/money';
import useGetServices from '@/services/services/useGetServices';
import useGetSettings from '@/services/settings/useGetSettings';
import SectionHeader from '../SectionHeader';

interface Props {
	serviceIds: string[];
	onChange: (serviceIds: string[]) => void;
	warnings?: string[];
}

/** `1 h 30 min`, y `45 min` cuando no llega a la hora. */
const describeDuration = (minutes: number): string => {
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;

	if (!hours) return `${rest} min`;
	return rest ? `${hours} h y ${rest} min` : `${hours} h`;
};

/**
 * Qué servicios presta esta persona.
 *
 * El buscador y el "todos" no son adorno: un negocio con veinte servicios es lo
 * normal, y sin ellos asignar el catálogo completo son veinte clicks. Cada fila
 * dice precio y duración porque es lo que permite reconocer un servicio del que
 * solo se recuerda a medias el nombre.
 */
const ServicesSection: React.FC<Props> = ({
	serviceIds,
	onChange,
	warnings = [],
}) => {
	const [query, setQuery] = useState('');
	const { data: services = [], isLoading } = useGetServices();
	const { data: settings } = useGetSettings();

	const currency = settings?.currency ?? 'BOB';

	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return services;
		return services.filter((service) =>
			service.name.toLowerCase().includes(needle),
		);
	}, [services, query]);

	const selected = new Set(serviceIds);

	/*
	 * "Todos" se calcula sobre lo visible, no sobre el catálogo entero.
	 *
	 * Con un filtro escrito, marcar "todos" tiene que marcar lo que se está
	 * mirando: si marcara el catálogo completo, el buscador se convertiría en una
	 * forma de asignar servicios que no se ven.
	 */
	const visibleIds = visible.map((service) => service.id);
	const allVisibleSelected =
		visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

	const toggleAllVisible = (checked: boolean) => {
		const next = new Set(selected);
		for (const id of visibleIds) {
			if (checked) next.add(id);
			else next.delete(id);
		}
		onChange([...next]);
	};

	const toggleOne = (id: string, checked: boolean) => {
		const next = new Set(selected);
		if (checked) next.add(id);
		else next.delete(id);
		onChange([...next]);
	};

	return (
		<div className="space-y-6">
			<SectionHeader
				title="Servicios"
				description="Los servicios que presta este miembro del equipo."
			/>

			<div className="relative">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Buscar servicios"
					className="pl-9"
					aria-label="Buscar servicios"
				/>
			</div>

			{warnings.map((warning) => (
				<p
					key={warning}
					className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
				>
					{warning}
				</p>
			))}

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Cargando servicios…</p>
			) : services.length === 0 ? (
				<p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
					Todavía no hay servicios en el catálogo. Cargalos primero y después
					asignalos acá.
				</p>
			) : (
				<div className="space-y-1">
					<label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50">
						<Checkbox
							checked={allVisibleSelected}
							onCheckedChange={(next) => toggleAllVisible(next === true)}
						/>
						<span className="text-sm font-medium">
							{query.trim() ? 'Todos los encontrados' : 'Todos los servicios'}
						</span>
						<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
							{visibleIds.length}
						</span>
					</label>

					<div className="border-t border-border" />

					{visible.length === 0 ? (
						<p className="px-3 py-4 text-sm text-muted-foreground">
							Ningún servicio coincide con «{query.trim()}».
						</p>
					) : (
						visible.map((service) => {
							const checked = selected.has(service.id);

							return (
								<label
									key={service.id}
									className={cn(
										'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
										checked ? 'bg-muted/60' : 'hover:bg-muted/40',
									)}
								>
									<Checkbox
										checked={checked}
										onCheckedChange={(next) =>
											toggleOne(service.id, next === true)
										}
									/>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-medium">
											{service.name}
										</span>
										<span className="block text-xs text-muted-foreground">
											{describeDuration(service.durationMinutes)}
										</span>
									</span>
									<span className="shrink-0 text-sm tabular-nums text-muted-foreground">
										{formatMoney(Number(service.price), currency)}
									</span>
								</label>
							);
						})
					)}
				</div>
			)}
		</div>
	);
};

export default ServicesSection;
