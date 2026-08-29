'use client';

import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import TeamAvatar from '../TeamAvatar';
import SectionHeader from '../SectionHeader';
import { ASSIGNABLE_ROLES, PHONE_CODES, ROLE_LABELS } from '../utils/roles';
import { fillStyleOf, TEAM_COLOR_LABELS, TEAM_COLORS } from '../utils/colors';
import type { TeamMemberDraft } from '../useTeamMemberDraft';
import type { StaffAccessRole } from '@/types/staff.types';

interface Props {
	draft: TeamMemberDraft;
	set: <K extends keyof TeamMemberDraft>(
		key: K,
		value: TeamMemberDraft[K],
	) => void;
	setRole: (role: StaffAccessRole) => void;
	error?: string;
	warnings?: string[];
	/** El dueño no puede dejar de serlo desde esta pantalla. */
	roleLocked?: boolean;
}

const ProfileSection: React.FC<Props> = ({
	draft,
	set,
	setRole,
	error,
	warnings = [],
	roleLocked = false,
}) => (
	<div className="space-y-8">
		<SectionHeader
			title="Perfil"
			description="Quién es la persona y cómo se la reconoce en la agenda."
		/>

		<div className="flex items-center gap-4">
			<TeamAvatar
				member={{
					firstName: draft.firstName,
					lastName: draft.lastName,
					calendarColor: draft.calendarColor,
				}}
				size="lg"
			/>
			<p className="text-sm text-muted-foreground">
				Las iniciales sobre el color que elijas abajo. Así aparece en la lista
				del equipo y en la agenda.
			</p>
		</div>

		<div className="grid gap-4 sm:grid-cols-2">
			<Field label="Nombre" htmlFor="firstName" required>
				<Input
					id="firstName"
					value={draft.firstName}
					onChange={(event) => set('firstName', event.target.value)}
					placeholder="Leandro"
					aria-invalid={Boolean(error)}
				/>
			</Field>

			<Field label="Apellido" htmlFor="lastName">
				<Input
					id="lastName"
					value={draft.lastName}
					onChange={(event) => set('lastName', event.target.value)}
					placeholder="Paredes"
				/>
			</Field>

			<Field
				label="Cargo"
				htmlFor="jobTitle"
				hint="Como se lo nombra en el negocio."
			>
				<Input
					id="jobTitle"
					value={draft.jobTitle}
					onChange={(event) => set('jobTitle', event.target.value)}
					placeholder="Barbero"
				/>
			</Field>

			<Field
				label="Email"
				htmlFor="email"
				hint="Queda guardado para cuando habilitemos su acceso a Polaria."
			>
				<Input
					id="email"
					type="email"
					value={draft.email}
					onChange={(event) => set('email', event.target.value)}
					placeholder="nombre@email.com"
					aria-invalid={Boolean(error)}
				/>
			</Field>

			<Field
				label="Teléfono"
				htmlFor="phone"
				hint="Se le avisa por WhatsApp cuando le agendan una cita."
				className="sm:col-span-2"
			>
				<div className="flex gap-2">
					<select
						aria-label="Prefijo de país"
						value={draft.phoneCode}
						onChange={(event) => set('phoneCode', event.target.value)}
						className="h-9 shrink-0 rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						{PHONE_CODES.map((entry) => (
							<option key={entry.code} value={entry.code}>
								{entry.code}
							</option>
						))}
					</select>
					<Input
						id="phone"
						inputMode="tel"
						value={draft.phone}
						onChange={(event) => set('phone', event.target.value)}
						placeholder="70000000"
					/>
				</div>
			</Field>
		</div>

		{error && <p className="text-sm text-red-600">{error}</p>}

		{warnings.map((warning) => (
			<p
				key={warning}
				className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
			>
				{warning}
			</p>
		))}

		<div className="space-y-3 border-t border-border pt-6">
			<div>
				<Label>Color del calendario</Label>
				<p className="mt-1 text-xs text-muted-foreground">
					Con qué color se distinguen sus citas en la agenda.
				</p>
			</div>

			<div className="flex flex-wrap gap-2">
				{TEAM_COLORS.map((color) => {
					const selected = draft.calendarColor === color;

					return (
						<button
							key={color}
							type="button"
							aria-label={TEAM_COLOR_LABELS[color]}
							aria-pressed={selected}
							onClick={() => set('calendarColor', selected ? null : color)}
							// Inline y no como clase: la paleta son hexadecimales propios,
							// no tonos de Tailwind, así que no hay clase que los nombre.
							style={fillStyleOf(color)}
							className={cn(
								'flex size-9 items-center justify-center rounded-full transition-transform',
								selected
									? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
									: 'hover:scale-105',
							)}
						>
							{selected && <Check className="size-4" />}
						</button>
					);
				})}
			</div>
		</div>

		<div className="space-y-4 border-t border-border pt-6">
			<div>
				<Label>Función en el negocio</Label>
				<p className="mt-1 text-xs text-muted-foreground">
					Define qué puede hacer dentro de Polaria.
				</p>
			</div>

			{roleLocked ? (
				<p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
					{ROLE_LABELS.OWNER} del negocio. Esta función no se cambia desde acá.
				</p>
			) : (
				<div className="grid gap-2 sm:grid-cols-2">
					{ASSIGNABLE_ROLES.map((role) => {
						const selected = draft.accessRole === role.value;

						return (
							<button
								key={role.value}
								type="button"
								aria-pressed={selected}
								onClick={() => setRole(role.value)}
								className={cn(
									'rounded-lg border p-3 text-left transition-colors',
									selected
										? 'border-foreground bg-muted'
										: 'border-border hover:bg-muted/50',
								)}
							>
								<p className="text-sm font-medium">{role.label}</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{role.description}
								</p>
							</button>
						);
					})}
				</div>
			)}

			{/*
			 * El escape del dueño-barbero.
			 *
			 * Es lo que hace que rol y reservabilidad sean dos cosas y no una: el rol
			 * propone un valor, y acá el negocio dice la verdad de su caso. Se muestra
			 * siempre, también con "Profesional" elegido, porque apagarlo es la forma
			 * de sacar a alguien de las reservas sin degradarle el rol.
			 */}
			<label className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
				<span>
					<span className="text-sm font-medium">Atiende clientes</span>
					<span className="mt-1 block text-xs text-muted-foreground">
						{draft.providesServices
							? 'Aparece entre los profesionales al agendar y tiene columna en la agenda.'
							: 'No aparece como profesional para reservar.'}
					</span>
				</span>
				<Switch
					checked={draft.providesServices}
					onCheckedChange={(next) => set('providesServices', next)}
				/>
			</label>
		</div>
	</div>
);

interface FieldProps {
	label: string;
	htmlFor: string;
	hint?: string;
	required?: boolean;
	className?: string;
	children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({
	label,
	htmlFor,
	hint,
	required,
	className,
	children,
}) => (
	<div className={cn('space-y-2', className)}>
		<Label htmlFor={htmlFor}>
			{label}
			{required && <span className="ml-0.5 text-muted-foreground">*</span>}
		</Label>
		{children}
		{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
	</div>
);

export default ProfileSection;
