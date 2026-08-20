'use client';

import {
	selectableClass,
	type StaffOption,
} from '@/modules/appointment-wizard/options';

interface Props {
	/** Ya filtrados con `eligibleStaffFor`. */
	staff: StaffOption[];
	selectedId: string | null;
	onSelect: (staffId: string) => void;
}

const StaffStep: React.FC<Props> = ({ staff, selectedId, onSelect }) => {
	if (staff.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Ningún profesional tiene asignado este servicio. Asignalo en la pantalla
				de Staff o elegí otro servicio.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			{staff.map((member) => (
				<button
					key={member.id}
					type="button"
					onClick={() => onSelect(member.id)}
					className={selectableClass(member.id === selectedId)}
				>
					<span className="block text-sm font-medium">{member.name}</span>
				</button>
			))}
		</div>
	);
};

export default StaffStep;
