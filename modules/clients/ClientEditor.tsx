'use client';

import { cloneElement, useId, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneField from '@/components/PhoneField';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { ClientApi, ClientSummaryApi } from '@/types/appointments.types';
import type { ClientPayload } from '@/services/clients/clients.service';
import ClientAvatar from './ClientAvatar';
import DeleteClientDialog from './DeleteClientDialog';
import useClientDraft, { type ClientSection } from './useClientDraft';

const SECTIONS: Array<{ key: ClientSection; label: string }> = [
	{ key: 'profile', label: 'Perfil' },
	{ key: 'notes', label: 'Notas' },
];

interface Props {
	client: ClientApi;
	summary?: ClientSummaryApi;
	dialCode?: string;
	saving?: boolean;
	deleting?: boolean;
	error?: string | null;
	onSave: (payload: ClientPayload) => void;
	onClose: () => void;
	onDelete: () => void;
}

/**
 * La ficha del cliente en modo edición: una pantalla, no un modal.
 *
 * Es una pantalla por lo mismo que el editor del equipo: eliminar vive acá, y un
 * botón que borra al cliente con su historial no debería estar a un click de paso
 * dentro de un panel que se abre para mirar. Ver y editar quedan separados de
 * verdad cuando son dos direcciones distintas.
 *
 * Los tres botones de la cabecera son los de las referencias, y las dos salidas
 * —guardar y cerrar— vuelven al mismo lugar: la lista con la ficha abierta en
 * Datos personales, que es de donde se entró.
 */
const ClientEditor: React.FC<Props> = ({
	client,
	summary,
	dialCode,
	saving = false,
	deleting = false,
	error,
	onSave,
	onClose,
	onDelete,
}) => {
	const [section, setSection] = useState<ClientSection>('profile');
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const { draft, set, errors, canSave, isDirty, toPayload } = useClientDraft(
		client,
		dialCode,
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<ClientAvatar client={client} />
					<div className="min-w-0">
						<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
							Editar cliente
						</h1>
						<p className="truncate text-sm text-muted-foreground">
							{client.name || 'Sin nombre'}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						onClick={() => setConfirmingDelete(true)}
					>
						Eliminar
					</Button>
					<Button variant="outline" onClick={onClose}>
						Cerrar
					</Button>
					<Button
						disabled={!canSave || !isDirty || saving}
						onClick={() => onSave(toPayload())}
					>
						{saving && <Spinner className="size-3.5" />}
						Guardar
					</Button>
				</div>
			</div>

			{error && (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
					{error}
				</p>
			)}

			<div className="flex flex-col gap-6 lg:flex-row">
				{/*
				 * En móvil el nav es una fila con scroll horizontal, no un bloque antes
				 * del formulario: ahí el alto es lo escaso. Mismo criterio que el
				 * editor del equipo.
				 */}
				<nav className="shrink-0 lg:w-60">
					<div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:space-y-1 lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:p-3">
						<p className="hidden px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">
							Datos del cliente
						</p>

						{SECTIONS.map((item) => {
							const active = section === item.key;
							const hasError = Boolean(errors[item.key]);

							return (
								<button
									key={item.key}
									type="button"
									aria-current={active ? 'page' : undefined}
									onClick={() => setSection(item.key)}
									className={cn(
										'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors lg:w-full',
										active
											? 'bg-muted font-medium text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
									)}
								>
									<span className="flex-1 text-left">{item.label}</span>
									{hasError && (
										<AlertCircle
											className="size-3.5 text-red-600"
											aria-label="Falta resolver algo en esta sección"
										/>
									)}
								</button>
							);
						})}
					</div>
				</nav>

				<div className="min-w-0 flex-1 rounded-xl border border-border p-4 sm:p-6">
					{section === 'profile' ? (
						<div className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">Perfil</h2>
								<p className="text-sm text-muted-foreground">
									Con qué datos se reconoce y se contacta al cliente.
								</p>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<Field label="Nombre" required>
									<Input
										value={draft.name}
										placeholder="Ana García"
										onChange={(event) => set('name', event.target.value)}
									/>
								</Field>

								<Field label="Teléfono" required>
									<PhoneField
										value={draft.phone}
										defaultDial={dialCode}
										onChange={(next) => set('phone', next)}
									/>
								</Field>

								<Field label="Email">
									<Input
										type="email"
										value={draft.email}
										placeholder="ana@ejemplo.com"
										onChange={(event) => set('email', event.target.value)}
									/>
								</Field>

								<Field label="Fecha de nacimiento">
									<Input
										type="date"
										value={draft.birthDate}
										onChange={(event) => set('birthDate', event.target.value)}
									/>
								</Field>
							</div>

							{errors.profile && (
								<p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
									<AlertCircle className="size-4 shrink-0" />
									{errors.profile}
								</p>
							)}
						</div>
					) : (
						<div className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">Notas</h2>
								<p className="text-sm text-muted-foreground">
									Lo que conviene recordar de esta persona. Sólo lo ve el
									negocio.
								</p>
							</div>

							<textarea
								rows={8}
								value={draft.notes}
								placeholder="Alérgico a un producto, prefiere turnos temprano, viene con su hijo…"
								onChange={(event) => set('notes', event.target.value)}
								className="w-full rounded-lg border border-border bg-transparent p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							/>
						</div>
					)}
				</div>
			</div>

			<DeleteClientDialog
				client={client}
				summary={summary}
				open={confirmingDelete}
				pending={deleting}
				onOpenChange={setConfirmingDelete}
				onConfirm={onDelete}
			/>
		</div>
	);
};

/**
 * Una etiqueta y su campo, asociados de verdad.
 *
 * El `id` se genera y se inyecta en el hijo en lugar de dejar la etiqueta suelta
 * al lado: sin `htmlFor`, un lector de pantalla anuncia el campo sin nombre, y
 * tocar la etiqueta no enfoca el input.
 */
const Field: React.FC<{
	label: string;
	required?: boolean;
	/** Aclaración bajo el campo. Va acá y no dentro de `children` para que la
	 * etiqueta siga apuntando a un único control. */
	hint?: string;
	children: React.ReactElement<{ id?: string }>;
}> = ({ label, required, hint, children }) => {
	const id = useId();

	return (
		<div>
			<Label htmlFor={id} className="mb-1.5 block">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</Label>
			{cloneElement(children, { id })}
			{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
		</div>
	);
};

export default ClientEditor;
