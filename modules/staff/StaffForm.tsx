'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { StaffFormPayload, StaffMember } from '@/types/staff.types';
import { toCommissionInput } from '@/modules/staff/utils/commission';
import WeeklyScheduleFields from '@/modules/schedule/WeeklyScheduleFields';
import {
	fromScheduleDraft,
	toScheduleDraft,
	validateScheduleDraft,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';
import {
	buildDefaultDraft,
	findBusinessHoursWarnings,
} from '@/modules/staff/utils/schedule';
import useGetSettings from '@/services/settings/useGetSettings';
import ComissionSection from './ComissionSection';
import ServiceSection from './ServiceSection';

interface StaffFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialStaff?: StaffMember | null;
	onSubmit: (staff: StaffFormPayload) => void;
}

export function StaffForm({
	open,
	onOpenChange,
	initialStaff,
	onSubmit,
}: StaffFormProps) {
	const [name, setName] = useState(() => initialStaff?.name ?? '');
	const [serviceIds, setServiceIds] = useState<string[]>(
		() => initialStaff?.services?.map((s) => s.id) ?? [],
	);
	const [commission, setCommission] = useState(() =>
		toCommissionInput(initialStaff?.commissionRate),
	);
	const [usesCustomSchedule, setUsesCustomSchedule] = useState(
		() => initialStaff?.usesCustomSchedule ?? false,
	);
	const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft>(() =>
		toScheduleDraft(initialStaff?.schedules),
	);

	const { data: settings } = useGetSettings();

	const mode: 'create' | 'edit' = initialStaff ? 'edit' : 'create';

	// Campo vacío significa "sin comisión configurada", que no es lo mismo que 0%.
	const commissionRate = commission.trim() === '' ? null : Number(commission);
	const commissionError =
		commissionRate !== null &&
		(!Number.isFinite(commissionRate) ||
			commissionRate < 0 ||
			commissionRate > 100)
			? 'La comisión debe ser un porcentaje entre 0 y 100.'
			: null;

	const scheduleError = usesCustomSchedule
		? validateScheduleDraft(
				scheduleDraft,
				'Marca al menos un día de trabajo, o apaga la jornada propia para usar el horario del negocio.',
			)
		: null;
	const scheduleWarnings = usesCustomSchedule
		? findBusinessHoursWarnings(scheduleDraft, settings?.businessHours)
		: [];

	const handleToggleCustomSchedule = (next: boolean) => {
		setUsesCustomSchedule(next);
		// Al encenderla por primera vez se parte del horario del negocio, que es
		// lo que el profesional venía haciendo hasta ahora.
		if (next && fromScheduleDraft(scheduleDraft).length === 0) {
			setScheduleDraft(buildDefaultDraft(settings?.businessHours));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || commissionError || scheduleError) return;

		onSubmit({
			name,
			serviceIds,
			commissionRate,
			usesCustomSchedule,
			// Con la jornada apagada no se mandan franjas: el backend conserva las
			// guardadas por si el negocio vuelve a encenderla.
			schedules: usesCustomSchedule
				? fromScheduleDraft(scheduleDraft)
				: undefined,
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === 'create' ? 'Agregar personal' : 'Editar personal'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'create'
							? 'Crea un nuevo miembro del staff y asigna los servicios.'
							: 'Actualiza el miembro del staff y los servicios que puede hacer.'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
						<div className="space-y-2">
							<Label htmlFor="name">Nombre</Label>
							<Input
								id="name"
								placeholder="Ingresa el nombre"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<ServiceSection
							serviceIds={serviceIds}
							setServiceIds={setServiceIds}
						/>

						<ComissionSection
							commission={commission}
							setCommission={setCommission}
							commissionError={commissionError}
						/>

						<div className="space-y-2">
							<div className="flex items-start justify-between gap-3">
								<div>
									<Label htmlFor="custom-schedule">Jornada propia</Label>
									<p className="text-xs text-muted-foreground mt-1">
										{usesCustomSchedule
											? 'Solo recibe turnos en los días y horas marcados abajo.'
											: 'Atiende en el horario del negocio.'}
									</p>
								</div>
								<Switch
									id="custom-schedule"
									checked={usesCustomSchedule}
									onCheckedChange={handleToggleCustomSchedule}
								/>
							</div>

							{usesCustomSchedule && (
								<>
									<WeeklyScheduleFields
										draft={scheduleDraft}
										onChange={setScheduleDraft}
										emptyDayLabel="No trabaja"
									/>

									{scheduleError && (
										<p className="text-sm text-red-600">{scheduleError}</p>
									)}

									{scheduleWarnings.map((warning) => (
										<p key={warning} className="text-sm text-amber-600">
											{warning}
										</p>
									))}
								</>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-4 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={
								!name || Boolean(commissionError) || Boolean(scheduleError)
							}
						>
							{mode === 'create' ? 'Crear' : 'Guardar'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
