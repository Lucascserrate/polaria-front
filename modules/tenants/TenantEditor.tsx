'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type {
	Tenant,
	TrialSummary,
	UpdateTenantDto,
} from '@/types/tenant.types';
import { TENANTS_BASE_ROUTE } from './routes';
import useTenantDraft, { type SectionKey } from './useTenantDraft';
import useTenantTrial from './useTenantTrial';
import ProfileSection from './sections/ProfileSection';
import LocationSection from './sections/LocationSection';
import WhatsappSection from './sections/WhatsappSection';
import TrialSection from './sections/TrialSection';
import SystemSection from './sections/SystemSection';

interface Props {
	tenant: Tenant;
	/** Relee la ficha desde el servidor. Lo necesita la sección de WhatsApp. */
	onRefresh: () => void;
	/** Abre una sesión de soporte dentro del negocio. */
	onEnter: () => void;
	saving?: boolean;
	error?: string | null;
	onSave: (payload: UpdateTenantDto) => void;
}

interface NavGroup {
	label: string;
	items: Array<{ key: SectionKey; label: string }>;
}

/**
 * Los grupos del nav.
 *
 * "El negocio" es lo que el negocio es —cómo se llama, dónde está—; el resto es
 * plomería que solo existe porque Polaria lo necesita. Separarlos importa porque
 * son dos cosas que se tocan en momentos distintos: los datos se corrigen a
 * pedido del negocio, las credenciales se tocan cuando algo se rompió.
 */
const NAV: NavGroup[] = [
	{
		label: 'El negocio',
		items: [
			{ key: 'profile', label: 'Perfil' },
			{ key: 'location', label: 'Ubicación' },
		],
	},
	{
		label: 'Integraciones',
		items: [{ key: 'whatsapp', label: 'WhatsApp' }],
	},
	{
		label: 'Comercial',
		items: [{ key: 'trial', label: 'Prueba gratuita' }],
	},
	{
		label: 'Sistema',
		items: [{ key: 'system', label: 'Estado e IA' }],
	},
];

/**
 * La ficha completa de un negocio.
 *
 * Es una pantalla y no un modal por la misma razón que la del equipo: ya no es
 * un formulario, son varios grupos de datos que no se revisan juntos, y en un
 * diálogo cualquiera de ellos —el mapa, sobre todo— quedaba detrás de un scroll
 * interno de 400px.
 *
 * El guardado es uno solo, en la cabecera, y manda la ficha entera. Guardar por
 * sección obligaría a explicar en cada una si lo de al lado quedó pendiente.
 *
 * WhatsApp y la prueba gratuita quedan afuera de ese guardado, y no es una
 * excepción caprichosa: no son campos sino acciones que ocurren en el momento
 * —conectar, extender—. Si vivieran en el borrador, guardar después de actuar
 * pisaría con lo que se leyó al abrir la pantalla.
 */
const TenantEditor: React.FC<Props> = ({
	tenant,
	onRefresh,
	onEnter,
	saving = false,
	error,
	onSave,
}) => {
	const [section, setSection] = useState<SectionKey>('profile');
	const { draft, set, issues, canSave, toPayload } = useTenantDraft(tenant);

	/*
	 * La prueba se carga acá y no dentro de su sección para que el nav pueda
	 * decir cuántos días quedan sin obligar a entrar. Es lo primero que soporte
	 * quiere saber al abrir la ficha de un negocio que llamó por un problema.
	 */
	const trial = useTenantTrial(tenant.id);

	/** Lo que cada sección dice de sí misma en el nav. */
	const badgeOf = (key: SectionKey): string | null => {
		if (key === 'location') return draft.location ? 'En el mapa' : null;
		if (key === 'whatsapp') return tenant.whatsappPhoneId ? 'Conectado' : null;
		if (key === 'trial') return trialBadge(trial.trial);
		if (key === 'system')
			return draft.status === 'inactive' ? 'Inactivo' : null;
		return null;
	};

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<Button
						asChild
						variant="ghost"
						size="icon-sm"
						aria-label="Volver al listado de negocios"
					>
						<Link href={TENANTS_BASE_ROUTE}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
						{tenant.name}
					</h1>
				</div>

				<div className="flex items-center gap-2">
					{/*
					 * Entrar está acá y no solo en el listado porque es lo que sigue
					 * naturalmente a mirar la ficha: se abre para entender un problema y lo
					 * siguiente es verlo con los ojos del negocio.
					 */}
					<Button variant="outline" onClick={onEnter}>
						<LogIn className="size-4" />
						Entrar al negocio
					</Button>
					<Button asChild variant="outline">
						<Link href={TENANTS_BASE_ROUTE}>Cancelar</Link>
					</Button>
					<Button
						disabled={!canSave || saving}
						onClick={() => onSave(toPayload())}
					>
						{saving && <Spinner className="size-3.5" />}
						Guardar cambios
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
				 * En móvil el nav es una fila de pestañas con scroll horizontal, no un
				 * bloque de filas antes del formulario: ahí el alto es lo escaso.
				 */}
				<nav className="shrink-0 lg:w-60">
					<div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:space-y-1 lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:p-3">
						{NAV.map((group) => (
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
													className="size-3.5 text-destructive"
													aria-label="Falta resolver algo en esta sección"
												/>
											) : (
												badge && (
													<span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.5 text-[11px] font-medium">
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
							error={issues.errors.profile}
						/>
					)}

					{section === 'location' && (
						<LocationSection
							draft={draft}
							set={set}
							warnings={issues.warnings.location}
						/>
					)}

					{section === 'whatsapp' && (
						<WhatsappSection tenant={tenant} onRefresh={onRefresh} />
					)}

					{section === 'trial' && (
						<TrialSection
							trial={trial.trial}
							loading={trial.loading}
							pending={trial.pending}
							error={trial.error}
							onExtend={trial.extend}
						/>
					)}

					{section === 'system' && <SystemSection draft={draft} set={set} />}
				</div>
			</div>
		</div>
	);
};

/**
 * Lo que la solapa dice de la prueba, en el ancho de una etiqueta.
 *
 * Sólo los estados que piden mirar: una prueba que corre —con sus días— y una
 * vencida. Un negocio pago o sin prueba iniciada no tiene nada urgente que
 * contar acá, y una etiqueta en cada solapa deja de señalar nada.
 */
const trialBadge = (trial: TrialSummary | null): string | null => {
	if (!trial) return null;
	if (trial.state === 'TRIAL_EXPIRED') return 'Vencida';

	return trial.daysRemaining !== null ? `${trial.daysRemaining} d` : null;
};

export default TenantEditor;
