'use client';

import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/types/staff.types';
import { formatCommissionRate } from '@/modules/staff/utils/commission';
import TeamAvatar from './TeamAvatar';
import { ROLE_LABELS } from './utils/roles';

interface Props {
	members: StaffMember[];
	onToggleActive: (id: string) => void;
	onDelete: (member: StaffMember) => void;
}

/**
 * El equipo, en una tabla.
 *
 * La fila entera lleva a la ficha: el editor es una pantalla, así que no hay
 * motivo para esconder la entrada detrás de un botón de lápiz. Queda un solo botón
 * propio, el de eliminar, porque es lo único que no debería pasar por un click de
 * paso.
 */
const TeamTable: React.FC<Props> = ({ members, onToggleActive, onDelete }) => {
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
							<TableHead>Activo</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{members.map((member) => (
							<TableRow key={member.id}>
								<TableCell>
									<Link
										href={`${ROUTES.team}/${member.id}`}
										className="flex items-center gap-3 hover:underline"
									>
										<TeamAvatar member={member} />
										<span className="min-w-0">
											<span className="block truncate font-medium">
												{member.name}
											</span>
											{member.jobTitle && (
												<span className="block truncate text-xs text-muted-foreground">
													{member.jobTitle}
												</span>
											)}
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
								<TableCell>
									<Switch
										checked={member.isActive}
										onCheckedChange={() => onToggleActive(member.id)}
										aria-label={`${member.isActive ? 'Desactivar' : 'Activar'} a ${member.name}`}
									/>
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Eliminar a ${member.name}`}
										onClick={() => onDelete(member)}
									>
										<Trash2 className="size-4 text-destructive" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Móvil */}
			<ul className="space-y-2 md:hidden">
				{members.map((member) => (
					<li key={member.id} className="rounded-xl border border-border p-3">
						<div className="flex items-start gap-3">
							<Link
								href={`${ROUTES.team}/${member.id}`}
								className="flex min-w-0 flex-1 items-start gap-3"
							>
								<TeamAvatar member={member} />
								<span className="min-w-0 flex-1">
									<span className="block truncate font-medium">
										{member.name}
									</span>
									<span className="mt-0.5 block text-xs text-muted-foreground">
										{member.jobTitle ??
											ROLE_LABELS[member.accessRole ?? 'PROFESSIONAL']}
									</span>
									<span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
										<span>{member.services?.length ?? 0} servicios</span>
										<span aria-hidden="true">·</span>
										<span>{formatCommissionRate(member.commissionRate)}</span>
									</span>
								</span>
							</Link>

							<div className="flex shrink-0 flex-col items-end gap-2">
								<Switch
									checked={member.isActive}
									onCheckedChange={() => onToggleActive(member.id)}
									aria-label={`${member.isActive ? 'Desactivar' : 'Activar'} a ${member.name}`}
								/>
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label={`Eliminar a ${member.name}`}
									onClick={() => onDelete(member)}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</div>

						{!member.providesServices && (
							<p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
								No atiende clientes.
							</p>
						)}
					</li>
				))}
			</ul>
		</>
	);
};

/**
 * La función de alguien, y si además atiende.
 *
 * Se dicen las dos cosas porque son dos: "Administrador" solo no distingue al que
 * lleva la caja del dueño que también corta pelo, y esa diferencia es la que
 * explica por qué uno aparece en la agenda y el otro no.
 */
const RoleCell: React.FC<{ member: StaffMember }> = ({ member }) => {
	const role = member.accessRole ?? 'PROFESSIONAL';
	const provides = member.providesServices ?? true;

	return (
		<span className="block">
			<span className="block text-sm">{ROLE_LABELS[role]}</span>
			<span
				className={cn(
					'block text-xs',
					provides
						? 'text-muted-foreground'
						: 'text-amber-600 dark:text-amber-500',
				)}
			>
				{provides ? 'Atiende clientes' : 'No atiende'}
			</span>
		</span>
	);
};

export default TeamTable;
