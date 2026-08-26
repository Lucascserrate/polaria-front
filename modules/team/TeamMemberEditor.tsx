'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { StaffMember, TeamMemberPayload } from '@/types/staff.types';
import { formatCommissionRate } from '@/modules/staff/utils/commission';
import useTeamMemberDraft, { type SectionKey } from './useTeamMemberDraft';
import { accessStateOf } from './utils/access';
import ProfileSection from './sections/ProfileSection';
import ServicesSection from './sections/ServicesSection';
import ScheduleSection from './sections/ScheduleSection';
import CommissionSection from './sections/CommissionSection';
import AccessSection from './sections/AccessSection';

interface Props {
	/** Ausente al crear. */
	member?: StaffMember | null;
	saving?: boolean;
	error?: string | null;
	onSave: (payload: TeamMemberPayload) => void;
}

interface NavGroup {
	label: string;
	items: Array<{ key: SectionKey; label: string }>;
}

/**
 * Los grupos del nav.
 *
 * "Datos personales" es la persona; "Trabajo" es su función en el negocio. La
 * separación es la que toman las referencias y sirve porque son dos preguntas que
 * se responden en momentos distintos: los datos se cargan una vez, lo del trabajo
 * se ajusta seguido.
 */
const NAV: NavGroup[] = [
	{
		label: 'Datos personales',
		items: [{ key: 'profile', label: 'Perfil' }],
	},
	{
		label: 'Trabajo',
		items: [
			{ key: 'services', label: 'Servicios' },
			{ key: 'schedule', label: 'Horarios' },
			{ key: 'commission', label: 'Comisiones' },
		],
	},
	{
		label: 'Sistema',
		items: [{ key: 'access', label: 'Acceso' }],
	},
];

/**
 * El acceso solo existe cuando la ficha ya existe.
 *
 * No se puede habilitar la entrada de alguien que todavía no está guardado, y
 * ofrecerlo al crear sería una sección que solo puede decir "primero guardá".
 */
const navFor = (isNew: boolean): NavGroup[] =>
	isNew ? NAV.filter((group) => group.label !== 'Sistema') : NAV;

/**
 * La ficha completa de un miembro del equipo.
 *
 * Es una pantalla y no un modal porque ya no es un formulario: son cuatro grupos
 * de decisiones que no se toman juntas, y en un diálogo cualquiera de ellas
 * quedaba detrás de un scroll interno.
 *
 * El guardado es uno solo, en la cabecera, y manda la ficha entera. Guardar por
 * sección obligaría a explicar en cada una si lo de al lado quedó pendiente, y
 * dejaría al equipo en estados a medias que el backend valida como un todo —la
 * jornada propia y sus franjas, por ejemplo, tienen que viajar juntas.
 */
const TeamMemberEditor: React.FC<Props> = ({
	member,
	saving = false,
	error,
	onSave,
}) => {
	const [section, setSection] = useState<SectionKey>('profile');
	const {
		draft,
		set,
		setRole,
		setUsesCustomSchedule,
		issues,
		canSave,
		toPayload,
	} = useTeamMemberDraft(member);

	const isOwner = draft.accessRole === 'OWNER';

	/** Lo que cada sección dice de sí misma en el nav. */
	const badgeOf = (key: SectionKey): string | null => {
		if (key === 'services') return String(draft.serviceIds.length);
		if (key === 'schedule') return draft.usesCustomSchedule ? 'Propia' : null;
		if (key === 'commission') {
			return draft.commission.trim() === ''
				? null
				: formatCommissionRate(draft.commission);
		}
		if (key === 'access' && member) {
			const state = accessStateOf(member);
			return state === 'ACTIVE'
				? 'Sí'
				: state === 'INVITED'
					? 'Pendiente'
					: null;
		}
		return null;
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<Button
						asChild
						variant="ghost"
						size="icon-sm"
						aria-label="Volver al equipo"
					>
						<Link href={ROUTES.team}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
						{member ? member.name : 'Añadir miembro del equipo'}
					</h1>
				</div>

				<div className="flex items-center gap-2">
					<Button asChild variant="outline">
						<Link href={ROUTES.team}>Cancelar</Link>
					</Button>
					<Button
						disabled={!canSave || saving}
						onClick={() => onSave(toPayload())}
					>
						{saving && <Spinner className="size-3.5" />}
						{member ? 'Guardar cambios' : 'Crear miembro'}
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
				 * En móvil el nav es una fila de pestañas con scroll horizontal, no un
				 * bloque de siete filas antes del formulario: ahí el alto es lo escaso.
				 */}
				<nav className="shrink-0 lg:w-60">
					<div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:space-y-1 lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:p-3">
						{navFor(!member).map((group) => (
							<div key={group.label} className="contents lg:block lg:space-y-1">
								<p className="hidden px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">
									{group.label}
								</p>

								{group.items.map((item) => {
									const active = section === item.key;
									const badge = badgeOf(item.key);
									const hasError = Boolean(issues.errors[item.key]);

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

											{hasError ? (
												<AlertCircle
													className="size-3.5 text-red-600"
													aria-label="Falta resolver algo en esta sección"
												/>
											) : (
												badge && (
													<span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
														{badge}
													</span>
												)
											)}
										</button>
									);
								})}
							</div>
						))}
					</div>
				</nav>

				<div className="min-w-0 flex-1 rounded-xl border border-border p-4 sm:p-6">
					{section === 'profile' && (
						<ProfileSection
							draft={draft}
							set={set}
							setRole={setRole}
							error={issues.errors.profile}
							roleLocked={isOwner}
						/>
					)}

					{section === 'services' && (
						<ServicesSection
							serviceIds={draft.serviceIds}
							onChange={(serviceIds) => set('serviceIds', serviceIds)}
							warnings={issues.warnings.services}
						/>
					)}

					{section === 'schedule' && (
						<ScheduleSection
							usesCustomSchedule={draft.usesCustomSchedule}
							onUsesCustomScheduleChange={setUsesCustomSchedule}
							scheduleDraft={draft.scheduleDraft}
							onScheduleChange={(next) => set('scheduleDraft', next)}
							error={issues.errors.schedule}
							warnings={issues.warnings.schedule}
						/>
					)}

					{section === 'commission' && (
						<CommissionSection
							commission={draft.commission}
							onChange={(value) => set('commission', value)}
							error={issues.errors.commission}
						/>
					)}

					{section === 'access' && member && <AccessSection member={member} />}
				</div>
			</div>
		</div>
	);
};

export default TeamMemberEditor;
