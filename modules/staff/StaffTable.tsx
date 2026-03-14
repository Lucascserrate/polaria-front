'use client';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface StaffMember {
	id: string;
	name: string;
	active: boolean;
	services: string[];
}

interface Props {
	staff: StaffMember[];
	onToggleActive: (id: string) => void;
	onDelete: (id: string) => void;
	onAddClick: () => void;
}

const StaffTable = ({ staff, onToggleActive, onDelete, onAddClick }: Props) => {
	if (staff.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground mb-4">No staff members added yet</p>
				<Button onClick={onAddClick}>
					<Plus className="w-4 h-4 mr-2" />
					Add Staff Member
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
							<TableHead>Estado</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{staff.map((member) => (
							<TableRow key={member.id}>
								<TableCell className="font-medium">{member.name}</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{member.services.map((service) => (
											<Badge key={service} variant="secondary">
												{service}
											</Badge>
										))}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<Switch
											checked={member.active}
											onCheckedChange={() => onToggleActive(member.id)}
										/>
										<span className="text-sm">
											{member.active ? 'Activo' : 'Inactivo'}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onDelete(member.id)}
									>
										<Trash2 className="w-4 h-4 text-destructive" />
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
								<p className="font-medium">{member.name}</p>
								<p className="text-sm text-muted-foreground mt-1">Services</p>
							</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={member.active}
									onCheckedChange={() => onToggleActive(member.id)}
								/>
							</div>
						</div>
						<div className="flex flex-wrap gap-1">
							{member.services.map((service) => (
								<Badge key={service} variant="secondary">
									{service}
								</Badge>
							))}
						</div>
						<div className="flex gap-2 pt-2 border-t border-border">
							<Button variant="ghost" size="sm" className="flex-1">
								{member.active ? 'Active' : 'Inactive'}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="flex-1"
								onClick={() => onDelete(member.id)}
							>
								<Trash2 className="w-4 h-4 mr-1 text-destructive" />
								Delete
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default StaffTable;
