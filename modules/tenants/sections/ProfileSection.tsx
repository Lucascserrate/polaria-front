'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BusinessTypeStep from '@/modules/onboarding/steps/BusinessTypeStep';
import SectionHeader from '../SectionHeader';
import Field from '../Field';
import type { TenantDraft } from '../useTenantDraft';

interface Props {
	draft: TenantDraft;
	set: <K extends keyof TenantDraft>(key: K, value: TenantDraft[K]) => void;
	error?: string;
}

const ProfileSection: React.FC<Props> = ({ draft, set, error }) => (
	<div className="space-y-8">
		<SectionHeader
			title="Perfil"
			description="Cómo se llama el negocio, a qué se dedica y con qué cuenta entra al panel."
		/>

		<div className="grid gap-4 sm:grid-cols-2">
			<Field label="Nombre" htmlFor="name" required>
				<Input
					id="name"
					value={draft.name}
					onChange={(event) => set('name', event.target.value)}
					placeholder="Barbería Central"
					aria-invalid={Boolean(error)}
				/>
			</Field>

			<Field
				label="Correo electrónico"
				htmlFor="email"
				hint="Es lo que vincula el negocio con su cuenta de Google al entrar."
			>
				<Input
					id="email"
					type="email"
					value={draft.email}
					onChange={(event) => set('email', event.target.value)}
					placeholder="admin@negocio.com"
				/>
			</Field>

			<Field
				label="Zona horaria"
				htmlFor="timezone"
				required
				className="sm:col-span-2"
				hint="Identificador IANA. El horario de atención se interpreta acá: una zona equivocada corre toda la agenda."
			>
				<Input
					id="timezone"
					value={draft.timezone}
					onChange={(event) => set('timezone', event.target.value)}
					placeholder="America/La_Paz"
				/>
			</Field>
		</div>

		{/*
		 * Las mismas tarjetas del onboarding, y no un campo de texto.
		 *
		 * El rubro es una lista cerrada de códigos —`BARBERSHOP`, no "barberia"—
		 * porque alimenta decisiones de producto: servicios sugeridos, tono del
		 * asistente. El campo libre que había acá dejaba a soporte escribiendo
		 * etiquetas que ninguna de esas decisiones sabe leer.
		 */}
		<div className="space-y-2">
			<Label>Tipo de negocio</Label>
			<BusinessTypeStep
				value={draft.businessType}
				onChange={(value) => set('businessType', value)}
			/>
		</div>

		{error && <p className="text-sm text-destructive">{error}</p>}
	</div>
);

export default ProfileSection;
