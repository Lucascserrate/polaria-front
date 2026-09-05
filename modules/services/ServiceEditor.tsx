'use client';

import { cloneElement, useId, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { Service } from '@/types/services.types';
import useServiceDraft, {
	type ServicePayload,
	type ServiceSection,
} from './useServiceDraft';
import DeleteServiceDialog from './DeleteServiceDialog';

const SECTIONS: Array<{ key: ServiceSection; label: string }> = [
	{ key: 'details', label: 'Detalles' },
	{ key: 'pricing', label: 'Duración y precio' },
	{ key: 'booking', label: 'Reserva' },
];

interface Props {
	/** Ausente al crear. */
	service?: Service | null;
	/** La del negocio, para escribir el precio en su moneda. */
	currency: string;
	saving?: boolean;
	deleting?: boolean;
	error?: string | null;
	onSave: (payload: ServicePayload) => void;
	/** Ausente al crear: no hay nada que eliminar todavía. */
	onDelete?: () => void;
}

/**
 * Un servicio en modo edición: una pantalla, no un diálogo.
 *
 * Es una pantalla por lo mismo que los editores del equipo y de clientes.
 * Eliminar vive acá, y un botón que saca un servicio del catálogo no debería
 * estar a un click de paso en una lista; y el diálogo que había antes obligaba a
 * elegir entre un alto incómodo o un scroll interno cada vez que se agregara un
 * campo.
 *
 * Son tres secciones y no un formulario largo porque responden tres preguntas
 * distintas: qué es el servicio, cuánto cuesta y cuánto ocupa en la agenda, y
 * quién puede reservarlo. La segunda es la que se ajusta seguido; la tercera se
 * decide una vez y casi nunca se toca, y por eso está última.
 *
 * El guardado es uno solo, en la cabecera, y manda el servicio entero: la
 * pantalla se recorre por secciones pero el servicio es uno.
 */
const ServiceEditor: React.FC<Props> = ({
	service,
	currency,
	saving = false,
	deleting = false,
	error,
	onSave,
	onDelete,
}) => {
	const [section, setSection] = useState<ServiceSection>('details');
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const { draft, set, errors, canSave, toPayload } = useServiceDraft(service);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<Button
						asChild
						variant="ghost"
						size="icon-sm"
						aria-label="Volver a servicios"
					>
						<Link href={ROUTES.services}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
						{service ? service.name : 'Nuevo servicio'}
					</h1>
				</div>

				<div className="flex items-center gap-2">
					{/* Solo al editar: al crear no hay nada que eliminar. */}
					{onDelete && (
						<Button
							variant="ghost"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => setConfirmingDelete(true)}
						>
							Eliminar
						</Button>
					)}
					<Button asChild variant="outline">
						<Link href={ROUTES.services}>Cancelar</Link>
					</Button>
					<Button
						disabled={!canSave || saving}
						onClick={() => onSave(toPayload())}
					>
						{saving && <Spinner className="size-3.5" />}
						{service ? 'Guardar cambios' : 'Crear servicio'}
					</Button>
				</div>
			</div>

			{error && (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			)}

			<div className="flex flex-col gap-6 lg:flex-row">
				{/*
				 * En móvil el nav es una fila con scroll horizontal, no un bloque antes
				 * del formulario: ahí el alto es lo escaso. Mismo criterio que los otros
				 * dos editores.
				 */}
				<nav className="shrink-0 lg:w-60">
					<div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:space-y-1 lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:p-3">
						<p className="hidden px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">
							Datos del servicio
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
											className="size-3.5 text-destructive"
											aria-label="Falta resolver algo en esta sección"
										/>
									)}
								</button>
							);
						})}
					</div>
				</nav>

				<div className="min-w-0 flex-1 rounded-xl border border-border p-4 sm:p-6">
					{section === 'details' ? (
						<div className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">Detalles</h2>
								<p className="text-sm text-muted-foreground">
									Con qué nombre lo eligen tus clientes al reservar.
								</p>
							</div>

							<Field label="Nombre" required>
								<Input
									value={draft.name}
									placeholder="Corte de pelo"
									onChange={(event) => set('name', event.target.value)}
								/>
							</Field>

							<Field
								label="Descripción"
								hint="Opcional. Sirve para aclarar qué incluye."
							>
								<Input
									value={draft.description}
									placeholder="Incluye lavado y peinado"
									onChange={(event) => set('description', event.target.value)}
								/>
							</Field>

							{errors.details && <SectionError message={errors.details} />}
						</div>
					) : section === 'pricing' ? (
						<div className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">Duración y precio</h2>
								<p className="text-sm text-muted-foreground">
									Cuánto ocupa en la agenda y cuánto se cobra.
								</p>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<Field
									label="Duración"
									required
									hint="En minutos. Es el espacio que reserva en la agenda."
								>
									<Input
										type="number"
										min="5"
										step="5"
										inputMode="numeric"
										value={draft.duration}
										placeholder="30"
										onChange={(event) => set('duration', event.target.value)}
									/>
								</Field>

								<Field label="Precio" required hint={`En ${currency}.`}>
									<Input
										type="number"
										min="0"
										step="1"
										inputMode="decimal"
										value={draft.price}
										placeholder="0"
										onChange={(event) => set('price', event.target.value)}
									/>
								</Field>
							</div>

							{/*
							 * El precio de una cita ya reservada no cambia con esto: se congela
							 * al reservar. Decirlo evita la duda de si editar el catálogo
							 * reescribe el historial y lo facturado.
							 */}
							<p className="border-t border-border pt-3 text-xs text-muted-foreground">
								Cambiar el precio no afecta a las citas ya reservadas: cada una
								conserva el precio que tenía cuando se agendó.
							</p>

							{errors.pricing && <SectionError message={errors.pricing} />}
						</div>
					) : (
						<div className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">Reserva</h2>
								<p className="text-sm text-muted-foreground">
									Quién puede poner este servicio en la agenda.
								</p>
							</div>

							<PolicyOption
								name="bookingPolicy"
								value="CLIENT_BOOKS"
								checked={draft.bookingPolicy === 'CLIENT_BOOKS'}
								onSelect={() => set('bookingPolicy', 'CLIENT_BOOKS')}
								label="El cliente lo reserva"
								description="Aparece entre las opciones al reservar por WhatsApp y en tu página. Es lo habitual."
							/>

							<PolicyOption
								name="bookingPolicy"
								value="CONSULTATION_FIRST"
								checked={draft.bookingPolicy === 'CONSULTATION_FIRST'}
								onSelect={() => set('bookingPolicy', 'CONSULTATION_FIRST')}
								label="Requiere una consulta previa"
								description="El cliente no puede reservarlo solo. Lo agendás vos desde la agenda, después de verlo."
							/>

							{/*
							 * Lo que **no** cambia, que es la duda que deja la opción de
							 * arriba: se parece a dar de baja el servicio, y no lo es.
							 */}
							<div className="border-t border-border pt-3 text-xs text-muted-foreground">
								<p>Con consulta previa, el servicio sigue existiendo:</p>
								<ul className="mt-1.5 list-disc space-y-1 pl-4">
									<li>
										Se muestra en tu página, con su precio, sin poder elegirlo.
									</li>
									<li>
										Si un cliente pregunta por WhatsApp, Polaria le explica que
										hace falta coordinar una consulta.
									</li>
									<li>Vos lo agendás normalmente desde la agenda.</li>
								</ul>
							</div>
						</div>
					)}
				</div>
			</div>

			{service && onDelete && (
				<DeleteServiceDialog
					service={service}
					open={confirmingDelete}
					pending={deleting}
					onOpenChange={setConfirmingDelete}
					onConfirm={onDelete}
				/>
			)}
		</div>
	);
};

/**
 * Una opción de política, como tarjeta y no como radio suelto.
 *
 * El control nativo va adentro de la etiqueta y no al lado: así toda la tarjeta
 * —título y explicación incluidos— selecciona la opción, y el teclado sigue
 * recorriendo el grupo con las flechas como en cualquier radio, que es lo que se
 * pierde al dibujarlo con `div`s y un `onClick`.
 */
const PolicyOption: React.FC<{
	name: string;
	value: string;
	checked: boolean;
	onSelect: () => void;
	label: string;
	description: string;
}> = ({ name, value, checked, onSelect, label, description }) => (
	<label
		className={cn(
			'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
			checked
				? 'border-primary bg-primary/5'
				: 'border-border hover:bg-muted/50',
		)}
	>
		<input
			type="radio"
			name={name}
			value={value}
			checked={checked}
			onChange={onSelect}
			className="mt-0.5 size-4 shrink-0 accent-primary"
		/>
		<span className="min-w-0">
			<span className="block text-sm font-medium">{label}</span>
			<span className="mt-0.5 block text-xs text-muted-foreground">
				{description}
			</span>
		</span>
	</label>
);

const SectionError: React.FC<{ message: string }> = ({ message }) => (
	<p className="flex items-center gap-1.5 text-sm text-destructive">
		<AlertCircle className="size-4 shrink-0" />
		{message}
	</p>
);

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
	/**
	 * Aclaración bajo el campo. Va acá y no dentro de `children` para que la
	 * etiqueta siga apuntando a un único control.
	 */
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

export default ServiceEditor;
