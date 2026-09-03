'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES, clientRoute } from '@/constants/routes';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import ClientDrawer, {
	isClientTab,
	type ClientTab,
} from '@/modules/clients/ClientDrawer';
import ClientsTable from '@/modules/clients/ClientsTable';
import DeleteClientDialog from '@/modules/clients/DeleteClientDialog';
import NewClientDialog from '@/modules/clients/NewClientDialog';
import useDeleteClient from '@/services/clients/useDeleteClient';
import useGetClients from '@/services/clients/useGetClients';
import useGetClientSummary from '@/services/clients/useGetClientSummary';
import useGetSettings from '@/services/settings/useGetSettings';
import type { ClientApi } from '@/types/appointments.types';

const PAGE_SIZE = 20;

const ClientsPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [adding, setAdding] = useState(false);
	const [deleting, setDeleting] = useState<ClientApi | null>(null);
	const [error, setError] = useState<string | null>(null);

	const debouncedSearch = useDebouncedValue(search);
	const { data: settings } = useGetSettings();
	const { data, isLoading } = useGetClients({
		search: debouncedSearch || undefined,
		page,
		limit: PAGE_SIZE,
	});

	/*
	 * El resumen del que se va a eliminar, no el de la fila que se mira. Es lo
	 * que le deja al diálogo decir de antemano si el cliente tiene citas por
	 * delante —y entonces no se puede— o historial que conservar.
	 */
	const { data: deletingSummary } = useGetClientSummary(deleting?.id);
	const deleteClient = useDeleteClient();

	const clients = data?.items ?? [];
	const total = data?.total ?? 0;

	/*
	 * Qué ficha está abierta y en qué pestaña sale de la URL, no del estado.
	 *
	 * Editar es otra pantalla, y al volver hay que reabrir a la misma persona
	 * donde estaba: eso sólo se puede reconstruir si estaba escrito en la
	 * dirección. De paso la ficha queda linkeable desde una cita.
	 */
	const openClientId = searchParams.get('client');
	const rawTab = searchParams.get('tab');
	const tab: ClientTab = isClientTab(rawTab) ? rawTab : 'summary';

	const openClient = (id: string, nextTab: ClientTab = 'summary') =>
		router.push(clientRoute(id, nextTab), { scroll: false });

	const handleDelete = async () => {
		if (!deleting) return;
		setError(null);

		try {
			await deleteClient.mutateAsync(deleting.id);
			// Si la ficha abierta era la suya, ya no hay a quién mostrar.
			if (openClientId === deleting.id) {
				router.push(ROUTES.clients, { scroll: false });
			}
			setDeleting(null);
		} catch (cause) {
			// El backend explica el caso —citas próximas, por ejemplo—, y ese
			// mensaje es el que sirve.
			setError(
				axios.isAxiosError(cause) &&
					typeof cause.response?.data?.message === 'string'
					? cause.response.data.message
					: 'No se pudo eliminar el cliente. Intentá de nuevo.',
			);
			setDeleting(null);
		}
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-6">
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

			{error && (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			)}

			<div className="relative max-w-sm shrink-0">
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
					<ClientsTable
						clients={clients}
						dialCode={settings?.dialCode}
						onOpen={(client) => openClient(client.id)}
						onEdit={(client) =>
							router.push(`${ROUTES.clients}/${client.id}/edit`)
						}
						onDelete={setDeleting}
					/>
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

			{deleting && (
				<DeleteClientDialog
					client={deleting}
					summary={deletingSummary}
					open
					pending={deleteClient.isPending}
					onOpenChange={(next) => {
						if (!next) setDeleting(null);
					}}
					onConfirm={() => void handleDelete()}
				/>
			)}

			<ClientDrawer
				clientId={openClientId}
				tab={tab}
				dialCode={settings?.dialCode}
				currency={settings?.currency ?? 'BOB'}
				onTabChange={(next) => {
					// Reemplaza en vez de apilar: cambiar de pestaña no es navegar, y
					// apilarlas obligaría a doce "atrás" para salir de la ficha.
					if (openClientId) {
						router.replace(clientRoute(openClientId, next), { scroll: false });
					}
				}}
				onClose={() => router.push(ROUTES.clients, { scroll: false })}
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
				{from}–{from + shown - 1} de{' '}
				<span className="font-medium">{total}</span>
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

/**
 * `useSearchParams` obliga a un límite de Suspense en el App Router: sin él, la
 * compilación de producción falla al prerenderizar la página.
 */
const ClientsPageWithSuspense = () => (
	<Suspense fallback={null}>
		<ClientsPage />
	</Suspense>
);

export default ClientsPageWithSuspense;
