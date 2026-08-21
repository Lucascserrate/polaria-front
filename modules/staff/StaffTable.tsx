'use client';
import { Plus, Pencil, SquarePen, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { StaffMember } from '@/types/staff.types';
import {
	formatCommissionRate,
	parseCommissionRate,
} from '@/modules/staff/utils/commission';

interface Props {
	staff: StaffMember[];
	onToggleActive: (id: string) => void;
	onEdit: (staff: StaffMember) => void;
	onDelete: (staff: StaffMember) => void;
	onAddClick: () => void;
}

const StaffTable = ({
	staff,
	onToggleActive,
	onEdit,
	onDelete,
	onAddClick,
}: Props) => {
	if (staff.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground mb-4">
					Aún no hay miembros del personal agregados
				</p>
				<Button onClick={onAddClick}>
					<Plus className="w-4 h-4 mr-2" />
					Agregar personal
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Desktop Table */}
			<div className="hidden md:block border border-border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Servicios</TableHead>
							<TableHead>Comisión</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{staff.map((member) => (
							<TableRow key={member.id}>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										{member.name}
										{/* Solo se marca la excepción: quien usa el horario del
										    negocio no necesita ningún distintivo. */}
										{member.usesCustomSchedule && (
											<Badge variant="outline" className="font-normal">
												Jornada propia
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell>
									{member.services && member.services.length > 0 ? (
										<span>{member.services.map((s) => s.name).join(', ')}</span>
									) : (
										<span className="text-muted-foreground">Sin servicios</span>
									)}
								</TableCell>
								<TableCell>
									{parseCommissionRate(member.commissionRate) === null ? (
										<span className="text-muted-foreground">Sin comisión</span>
									) : (
										<span className="font-medium">
											{formatCommissionRate(member.commissionRate)}
										</span>
									)}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<Switch
											checked={member.isActive}
											onCheckedChange={() => onToggleActive(member.id)}
										/>
										<span className="text-sm">
											{member.isActive ? 'Activo' : 'Inactivo'}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="sm"
										aria-label={`Editar a ${member.name}`}
										onClick={() => onEdit(member)}
									>
										<Pencil className="w-4 h-4" />
									</Button>
									{/*
									 * Destructiva y en `ghost`: la acción habitual de esta fila es
									 * editar, y eliminar no debería competir por la mirada.
									 */}
									<Button
										variant="ghost"
										size="sm"
										className="text-muted-foreground hover:text-destructive"
										aria-label={`Eliminar a ${member.name}`}
										onClick={() => onDelete(member)}
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Mobile Cards */}
			<div className="md:hidden space-y-3">
				{staff.map((member) => (
					<div
						key={member.id}
						className="bg-card border border-border rounded-lg p-4 space-y-3"
					>
						<div className="flex items-start justify-between">
							<div>
								<div className="flex items-center gap-2">
									<p className="font-medium">{member.name}</p>
									{member.usesCustomSchedule && (
										<Badge variant="outline" className="font-normal">
											Jornada propia
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{member.services && member.services.length > 0
										? member.services.map((s) => s.name).join(', ')
										: 'Sin servicios'}
								</p>
								<p className="text-sm text-muted-foreground mt-1">
									Comisión: {formatCommissionRate(member.commissionRate)}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={member.isActive}
									onCheckedChange={() => onToggleActive(member.id)}
								/>
							</div>
						</div>
						<div className="flex gap-2 pt-2 border-t border-border">
							<Button variant="ghost" size="sm" className="flex-1">
								{member.isActive ? 'Activo' : 'Inactivo'}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="flex-1"
								onClick={() => onEdit(member)}
							>
								<SquarePen className="w-4 h-4 mr-1" />
								Editar
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default StaffTable;
