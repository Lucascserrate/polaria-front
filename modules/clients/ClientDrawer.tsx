'use client';

import { Calendar, LayoutGrid, UserRound, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import useGetClient from '@/services/clients/useGetClient';
import ClientAppointmentsPanel from './panels/ClientAppointmentsPanel';
import ClientProfilePanel from './panels/ClientProfilePanel';
import ClientSummaryPanel from './panels/ClientSummaryPanel';

export type ClientTab = 'summary' | 'appointments' | 'profile';

const TABS: Array<{ key: ClientTab; label: string; icon: LucideIcon }> = [
	{ key: 'summary', label: 'Resumen', icon: LayoutGrid },
	{ key: 'appointments', label: 'Citas', icon: Calendar },
	{ key: 'profile', label: 'Datos personales', icon: UserRound },
];

export const isClientTab = (value: string | null): value is ClientTab =>
	TABS.some((tab) => tab.key === value);

interface Props {
	clientId: string | null;
	tab: ClientTab;
	dialCode?: string;
	currency: string;
	onTabChange: (tab: ClientTab) => void;
	onClose: () => void;
}

/**
 * La ficha del cliente: verla, no editarla.
 *
 * Dos paneles y no tres. Las referencias abren uno extra sólo para la identidad
 * —foto, nombre, email—, y esa columna repite lo que ya dice el encabezado y lo
 * que dice Datos personales. Con dos, el contenido tiene el ancho que necesita
 * el historial de citas, que es lo que más se mira acá.
 *
 * La pestaña abierta vive en la URL, no en el estado. Editar sale a otra
 * pantalla, y volver tiene que reabrir a la misma persona en la misma pestaña:
 * eso sólo se puede reconstruir si estaba escrito en la dirección.
 */
const ClientDrawer: React.FC<Props> = ({
	clientId,
	tab,
	dialCode,
	currency,
	onTabChange,
	onClose,
}) => {
	const { data: client, isLoading, isError } = useGetClient(clientId);

	return (
		<Drawer
			direction="right"
			open={!!clientId}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			{/*
			 * El ancho se declara con la misma variante que usa `DrawerContent`, y no
			 * como un `sm:max-w-3xl` suelto. La clase de vaul
			 * —`data-[vaul-drawer-direction=right]:sm:max-w-sm`— lleva un selector de
			 * atributo, así que tiene más especificidad y le gana a cualquier
			 * `max-w` plano: el drawer se abriría angosto y las dos columnas no
			 * entrarían.
			 */}
			<DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-3xl">
				<div className="flex items-center justify-between gap-4 border-b border-border p-4">
					<div className="min-w-0">
						<DrawerTitle className="truncate text-base font-semibold">
							{client?.name || 'Cliente'}
						</DrawerTitle>
						<DrawerDescription className="truncate text-xs">
							{client?.email || 'Ficha del cliente'}
						</DrawerDescription>
					</div>

					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Cerrar la ficha"
						onClick={onClose}
					>
						<X className="size-4" />
					</Button>
				</div>

				{isLoading ? (
					<div className="flex flex-1 items-center justify-center py-16">
						<Spinner className="size-5" />
					</div>
				) : isError || !client ? (
					<p className="flex-1 py-16 text-center text-muted-foreground">
						No encontramos a este cliente.
					</p>
				) : (
					<div className="flex min-h-0 flex-1 flex-col sm:flex-row">
						{/*
						 * En móvil el nav pasa a ser una fila arriba: una columna lateral
						 * en una pantalla angosta se come el ancho que necesita el
						 * contenido.
						 */}
						<nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 sm:w-52 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0 sm:p-3">
							{TABS.map(({ key, label, icon: Icon }) => (
								<button
									key={key}
									type="button"
									aria-current={tab === key ? 'page' : undefined}
									onClick={() => onTabChange(key)}
									className={cn(
										'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
										tab === key
											? 'bg-muted font-medium text-foreground'
											: 'text-muted-foreground hover:bg-muted/60',
									)}
								>
									<Icon className="size-4 shrink-0" />
									{label}
								</button>
							))}
						</nav>

						<div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
							{tab === 'summary' && <ClientSummaryPanel client={client} />}
							{tab === 'appointments' && (
								<ClientAppointmentsPanel
									clientId={client.id}
									currency={currency}
								/>
							)}
							{tab === 'profile' && (
								<ClientProfilePanel client={client} dialCode={dialCode} />
							)}
						</div>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
};

export default ClientDrawer;
