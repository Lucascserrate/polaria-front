'use client';

import { Input } from '@/components/ui/input';
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
			description="Cómo se llama el negocio y con qué cuenta entra al panel."
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
				label="Tipo de negocio"
				htmlFor="businessType"
				hint="Define qué vocabulario usa Polaria al conversar."
			>
				<Input
					id="businessType"
					value={draft.businessType}
					onChange={(event) => set('businessType', event.target.value)}
					placeholder="barberia"
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

		{error && <p className="text-sm text-red-600">{error}</p>}
	</div>
);

export default ProfileSection;
