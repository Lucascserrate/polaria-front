import type { StaffMember } from '@/types/staff.types';

interface Props {
	staff: StaffMember[];
}

export function StaffStats({ staff }: Props) {
	const activeCount = staff.filter((s) => s.isActive).length;

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div className="bg-card border border-border rounded-lg p-4">
				<p className="text-sm text-muted-foreground">Personal total</p>
				<p className="text-2xl font-bold mt-1">{staff.length}</p>
			</div>
			<div className="bg-card border border-border rounded-lg p-4">
				<p className="text-sm text-muted-foreground">Activo</p>
				<p className="text-2xl font-bold mt-1 text-green-600">{activeCount}</p>
			</div>
			<div className="bg-card border border-border rounded-lg p-4">
				<p className="text-sm text-muted-foreground">Inactivo</p>
				<p className="text-2xl font-bold mt-1 text-muted-foreground">
					{staff.length - activeCount}
				</p>
			</div>
		</div>
	);
}
