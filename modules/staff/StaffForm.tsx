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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { StaffFormPayload, StaffMember } from '@/types/staff.types';
import { toCommissionInput } from '@/modules/staff/utils/commission';
import StaffScheduleFields from '@/modules/staff/StaffScheduleFields';
import {
	buildDefaultDraft,
	findBusinessHoursWarnings,
	fromScheduleDraft,
	toScheduleDraft,
	validateScheduleDraft,
	type ScheduleDraft,
} from '@/modules/staff/utils/schedule';
import useGetServices from '@/services/services/useGetServices';
import useGetSettings from '@/services/settings/useGetSettings';

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

	const { data: servicesData } = useGetServices();
	const { data: settings } = useGetSettings();

	const services = servicesData || [];

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
		? validateScheduleDraft(scheduleDraft)
		: null;
	const scheduleWarnings = usesCustomSchedule
		? findBusinessHoursWarnings(scheduleDraft, settings)
		: [];

	const handleToggleCustomSchedule = (next: boolean) => {
		setUsesCustomSchedule(next);
		// Al encenderla por primera vez se parte del horario del negocio, que es
		// lo que el profesional venía haciendo hasta ahora.
		if (next && fromScheduleDraft(scheduleDraft).length === 0) {
			setScheduleDraft(buildDefaultDraft(settings));
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
					{/* La grilla semanal no entra en pantalla junto al resto: los campos
					    scrollean y las acciones quedan siempre visibles. */}
					<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
						<div>
							<Label htmlFor="name">Nombre</Label>
							<Input
								id="name"
								placeholder="Ingresa el nombre"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="commission">Comisión</Label>
							<div className="relative">
								<Input
									id="commission"
									type="number"
									min="0"
									max="100"
									step="0.5"
									inputMode="decimal"
									placeholder="0"
									className="pr-8"
									value={commission}
									onChange={(e) => setCommission(e.target.value)}
									aria-invalid={Boolean(commissionError)}
								/>
								<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
									%
								</span>
							</div>
							{commissionError ? (
								<p className="text-sm text-red-600 mt-1">{commissionError}</p>
							) : (
								<p className="text-xs text-muted-foreground mt-1">
									Porcentaje de lo que factura. Déjalo vacío si no trabaja a
									comisión.
								</p>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between gap-2">
								<Label>Servicios</Label>
								{serviceIds.length > 0 ? (
									<Badge variant="secondary">
										{serviceIds.length} seleccionados
									</Badge>
								) : (
									<Badge variant="outline">Sin servicios</Badge>
								)}
							</div>

							<div className="border border-border rounded-lg p-3 space-y-2 max-h-56 overflow-auto">
								{services.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No hay servicios activos para asignar.
									</p>
								) : (
									services.map((service) => {
										const checked = serviceIds.includes(service.id);
										return (
											<label
												key={service.id}
												className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer"
											>
												<Checkbox
													checked={checked}
													onCheckedChange={(next) => {
														const isChecked = next === true;
														setServiceIds((prev) => {
															if (isChecked) {
																return Array.from(
																	new Set([...prev, service.id]),
																);
															}
															return prev.filter((id) => id !== service.id);
														});
													}}
												/>
												<span className="text-sm">{service.name}</span>
											</label>
										);
									})
								)}
							</div>
						</div>

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
									<StaffScheduleFields
										draft={scheduleDraft}
										onChange={setScheduleDraft}
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
