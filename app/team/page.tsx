'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { MoreVertical, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { StaffMember } from '@/types/staff.types';
import TeamTable from '@/modules/team/TeamTable';
import JoinRequestsCard from '@/modules/team/JoinRequestsCard';
import JoinRequestsDialog from '@/modules/team/JoinRequestsDialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePendingJoinRequests } from '@/services/staff/useJoinRequests';
import DeleteStaffDialog from '@/modules/staff/DeleteStaffDialog';
import useGetStaff from '@/services/staff/useGetStaff';
import useUpdateStaff from '@/services/staff/useUpdateStaff';
import useDeleteStaff from '@/services/staff/useDeleteStaff';

const TeamPage = () => {
	const { data: members = [], isLoading } = useGetStaff();
	const updateStaff = useUpdateStaff();
	const deleteStaff = useDeleteStaff();

	const [deleting, setDeleting] = useState<StaffMember | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [showingRequests, setShowingRequests] = useState(false);

	/*
	 * Se pide acá además de dentro del diálogo, para el número del menú.
	 *
	 * Es la misma consulta y React Query la resuelve una sola vez, así que no son
	 * dos peticiones: es la misma respuesta leída desde los dos lugares que la
	 * necesitan.
	 */
	const { data: requests = [] } = usePendingJoinRequests();

	const handleToggleActive = (id: string) => {
		const member = members.find((candidate) => candidate.id === id);
		if (!member) return;

		updateStaff.mutate({ id, data: { isActive: !member.isActive } });
	};

	const handleDelete = async (member: StaffMember) => {
		setMessage(null);

		try {
			const { mode } = await deleteStaff.mutateAsync(member.id);
			setDeleting(null);
			// Solo se avisa la baja lógica: que se conserve el historial es lo que el
			// dueño no esperaría. Una eliminación definitiva se explica sola con la
			// fila que desaparece.
			setMessage(
				mode === 'SOFT'
					? `${member.name} se dio de baja. Su historial y sus comisiones quedan intactos.`
					: null,
			);
		} catch (error) {
			// El 409 llega con la cantidad de citas próximas: es la información que le
			// dice al negocio qué tiene que resolver antes.
			setMessage(
				axios.isAxiosError(error) &&
					typeof error.response?.data?.message === 'string'
					? error.response.data.message
					: 'No se pudo eliminar al miembro del equipo. Intentá de nuevo.',
			);
			setDeleting(null);
		}
	};

	if (isLoading) {
		return (
			<p className="py-16 text-center text-muted-foreground">
				Cargando el equipo…
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
						Miembros del equipo
						<span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium tabular-nums text-muted-foreground">
							{members.length}
						</span>
					</h1>
					<p className="mt-1 text-muted-foreground">
						Quiénes forman parte del negocio y qué hace cada uno.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button asChild className="gap-2">
						<Link href={ROUTES.teamNew}>
							<Plus className="size-4" />
							Añadir
						</Link>
					</Button>

					{/*
					 * La puerta permanente a las solicitudes.
					 *
					 * Existe aunque no haya ninguna: es donde el dueño confirma que no
					 * hay —o que sí— cuando alguien le avisa por WhatsApp que ya pidió.
					 * La tarjeta de arriba es el aviso y aparece sola; esto es para ir a
					 * buscar.
					 */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								aria-label="Más opciones del equipo"
							>
								<MoreVertical className="size-4" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => setShowingRequests(true)}>
								<UserPlus />
								Ver solicitudes
								{/*
								 * El número al costado: el menú cerrado no dice si hay algo, y
								 * abrirlo para encontrar un cero es el click que esto evita.
								 */}
								{requests.length > 0 && (
									<span className="ml-auto rounded-full bg-warning/15 px-1.5 text-xs font-medium tabular-nums text-warning">
										{requests.length}
									</span>
								)}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{message && (
				<p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
					{message}
				</p>
			)}

			<JoinRequestsCard />

			<TeamTable
				members={members}
				onToggleActive={handleToggleActive}
				onDelete={setDeleting}
			/>

			<JoinRequestsDialog
				open={showingRequests}
				onOpenChange={setShowingRequests}
			/>

			<DeleteStaffDialog
				staff={deleting}
				pending={deleteStaff.isPending}
				onOpenChange={(next) => {
					if (!next) setDeleting(null);
				}}
				onConfirm={(member) => void handleDelete(member)}
			/>
		</div>
	);
};

export default TeamPage;
