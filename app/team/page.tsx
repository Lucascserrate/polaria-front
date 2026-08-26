'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { StaffMember } from '@/types/staff.types';
import TeamTable from '@/modules/team/TeamTable';
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

	const activeCount = members.filter((member) => member.isActive).length;
	const bookableCount = members.filter(
		(member) => member.isActive && (member.providesServices ?? true),
	).length;

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

				<Button asChild className="gap-2">
					<Link href={ROUTES.teamNew}>
						<Plus className="size-4" />
						Añadir
					</Link>
				</Button>
			</div>

			{members.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-3">
					<Stat label="En el equipo" value={members.length} />
					<Stat label="Activos" value={activeCount} />
					{/*
					 * "Atienden" y no "activos" es la cuenta que importa: es la que
					 * responde cuántas personas puede ofrecer una reserva, y con
					 * administradores en el equipo deja de coincidir con el total.
					 */}
					<Stat label="Atienden clientes" value={bookableCount} />
				</div>
			)}

			{message && (
				<p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
					{message}
				</p>
			)}

			<TeamTable
				members={members}
				onToggleActive={handleToggleActive}
				onDelete={setDeleting}
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

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
	<div className="rounded-xl border border-border p-4">
		<p className="text-sm text-muted-foreground">{label}</p>
		<p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
	</div>
);

export default TeamPage;
