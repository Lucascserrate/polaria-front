'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import ClientsTable from '@/modules/clients/ClientsTable';
import NewClientDialog from '@/modules/clients/NewClientDialog';
import useGetClients from '@/services/clients/useGetClients';
import useGetSettings from '@/services/settings/useGetSettings';

const PAGE_SIZE = 20;

const ClientsPage = () => {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [adding, setAdding] = useState(false);

	const debouncedSearch = useDebouncedValue(search);
	const { data: settings } = useGetSettings();
	const { data, isLoading } = useGetClients({
		search: debouncedSearch || undefined,
		page,
		limit: PAGE_SIZE,
	});

	const clients = data?.items ?? [];
	const total = data?.total ?? 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
						Clientes
						{total > 0 && (
							<span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium tabular-nums text-muted-foreground">
								{total}
							</span>
						)}
					</h1>
					<p className="mt-1 text-muted-foreground">
						Quiénes reservan en el negocio y cómo contactarlos.
					</p>
				</div>

				<Button className="gap-2" onClick={() => setAdding(true)}>
					<Plus className="size-4" />
					Añadir
				</Button>
			</div>

			<div className="relative max-w-sm">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={search}
					className="pl-9"
					placeholder="Nombre, teléfono o email"
					aria-label="Buscar clientes"
					onChange={(event) => {
						setSearch(event.target.value);
						// Buscar desde la página cuatro no tendría sentido: los resultados
						// son otros y esa página puede no existir.
						setPage(1);
					}}
				/>
			</div>

			{isLoading ? (
				<p className="py-16 text-center text-muted-foreground">
					Cargando los clientes…
				</p>
			) : clients.length === 0 ? (
				<EmptyState
					searching={!!debouncedSearch}
					onAdd={() => setAdding(true)}
				/>
			) : (
				<>
					<ClientsTable clients={clients} dialCode={settings?.dialCode} />
					<Pagination
						page={page}
						total={total}
						shown={clients.length}
						hasMore={data?.hasMore ?? false}
						onChange={setPage}
					/>
				</>
			)}

			<NewClientDialog
				open={adding}
				dialCode={settings?.dialCode}
				onOpenChange={setAdding}
			/>
		</div>
	);
};

const EmptyState: React.FC<{ searching: boolean; onAdd: () => void }> = ({
	searching,
	onAdd,
}) => (
	<div className="rounded-xl border border-border py-12 text-center">
		<p className="mb-4 text-muted-foreground">
			{searching
				? 'Ningún cliente coincide con esa búsqueda.'
				: 'Todavía no hay clientes. Se cargan solos cuando alguien reserva por WhatsApp o desde la página.'}
		</p>
		{!searching && (
			<Button onClick={onAdd}>
				<Plus className="size-4" />
				Añadir cliente
			</Button>
		)}
	</div>
);

const Pagination: React.FC<{
	page: number;
	total: number;
	shown: number;
	hasMore: boolean;
	onChange: (page: number) => void;
}> = ({ page, total, shown, hasMore, onChange }) => {
	const from = (page - 1) * PAGE_SIZE + 1;

	return (
		<div className="flex items-center justify-between gap-4">
			<p className="text-sm text-muted-foreground">
				{from}–{from + shown - 1} de <span className="font-medium">{total}</span>
			</p>

			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={page === 1}
					onClick={() => onChange(page - 1)}
				>
					Anterior
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!hasMore}
					onClick={() => onChange(page + 1)}
				>
					Siguiente
				</Button>
			</div>
		</div>
	);
};

export default ClientsPage;
