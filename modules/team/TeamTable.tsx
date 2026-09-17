'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleCheck, CircleSlash, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { ROUTES } from '@/constants/routes';
import type { StaffMember } from '@/types/staff.types';
import { formatCommissionRate } from '@/modules/staff/utils/commission';
import TeamAvatar from './TeamAvatar';
import { ROLE_LABELS } from './utils/roles';
import MemberState from './MemberState';
import RoleCell from './RoleCell';

interface Props {
	members: StaffMember[];
	onToggleActive: (id: string) => void;
	onDelete: (member: StaffMember) => void;
}

/**
 * En touch el menú se abre con una pulsación larga y, al soltar, el navegador
 * dispara el click igual: sin esto la ficha se abriría por debajo del menú que
 * se acaba de abrir. El `data-state` lo pone el propio trigger, que acá es la
 * fila y no el enlace, así que se busca hacia arriba.
 */
const swallowClickUnderMenu = (event: React.MouseEvent<HTMLElement>) => {
	if (event.currentTarget.closest('[data-state="open"]'))
		event.preventDefault();
};

const TeamTable: React.FC<Props> = ({ members, onToggleActive, onDelete }) => {
	const router = useRouter();

	const actions = (member: StaffMember) => (
		<ContextMenuContent>
			<ContextMenuItem
				onSelect={() => router.push(`${ROUTES.team}/${member.id}`)}
			>
				<Pencil />
				Editar
			</ContextMenuItem>

			<ContextMenuItem onSelect={() => onToggleActive(member.id)}>
				{member.isActive ? <CircleSlash /> : <CircleCheck />}
				{member.isActive ? 'Desactivar' : 'Activar'}
			</ContextMenuItem>

			<ContextMenuSeparator />

			<ContextMenuItem variant="destructive" onSelect={() => onDelete(member)}>
				<Trash2 />
				Eliminar...
			</ContextMenuItem>
		</ContextMenuContent>
	);

	if (members.length === 0) {
		return (
			<div className="rounded-xl border border-border py-12 text-center">
				<p className="mb-4 text-muted-foreground">
					Todavía no hay nadie en el equipo.
				</p>
				<Button asChild>
					<Link href={ROUTES.teamNew}>
						<Plus className="size-4" />
						Añadir miembro
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* Escritorio */}
			<div className="hidden overflow-hidden rounded-xl border border-border md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Función</TableHead>
							<TableHead>Servicios</TableHead>
							<TableHead>Comisión</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{members.map((member) => (
							<ContextMenu key={member.id}>
								<ContextMenuTrigger asChild>
									<TableRow className="data-[state=open]:bg-muted/50">
										<TableCell>
											<Link
												href={`${ROUTES.team}/${member.id}`}
												onClick={swallowClickUnderMenu}
												className="flex items-center gap-3 group"
											>
												<TeamAvatar member={member} />
												<span className="min-w-0 group-hover:underline">
													<span className="block truncate font-medium">
														{member.name}
													</span>
													<MemberState
														member={member}
														fallback={member.jobTitle ?? null}
													/>
												</span>
											</Link>
										</TableCell>
										<TableCell>
											<RoleCell member={member} />
										</TableCell>
										<TableCell className="text-sm tabular-nums text-muted-foreground">
											{member.services?.length ?? 0}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{formatCommissionRate(member.commissionRate)}
										</TableCell>
									</TableRow>
								</ContextMenuTrigger>

								{actions(member)}
							</ContextMenu>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Móvil */}
			<ul className="space-y-2 md:hidden">
				{members.map((member) => (
					<li key={member.id}>
						<ContextMenu>
							<ContextMenuTrigger asChild>
								<Link
									href={`${ROUTES.team}/${member.id}`}
									onClick={swallowClickUnderMenu}
									className="flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40 data-[state=open]:bg-muted/40"
								>
									<TeamAvatar member={member} />
									<span className="min-w-0 flex-1">
										<span className="block truncate font-medium">
											{member.name}
										</span>
										<span className="mt-0.5 block">
											<MemberState
												member={member}
												fallback={
													member.jobTitle ??
													ROLE_LABELS[member.accessRole ?? 'PROFESSIONAL']
												}
											/>
										</span>
										<span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
											<span>{member.services?.length ?? 0} servicios</span>
											<span aria-hidden="true">·</span>
											<span>{formatCommissionRate(member.commissionRate)}</span>
										</span>
										{!member.providesServices && (
											<span className="mt-2 block border-t border-border pt-2 text-xs text-muted-foreground">
												No atiende clientes.
											</span>
										)}
									</span>
								</Link>
							</ContextMenuTrigger>

							{actions(member)}
						</ContextMenu>
					</li>
				))}
			</ul>
		</>
	);
};

export default TeamTable;
