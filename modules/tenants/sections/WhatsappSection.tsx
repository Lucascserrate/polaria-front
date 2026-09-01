'use client';

import { Input } from '@/components/ui/input';
import SectionHeader from '../SectionHeader';
import Field from '../Field';
import type { TenantDraft } from '../useTenantDraft';

interface Props {
	draft: TenantDraft;
	set: <K extends keyof TenantDraft>(key: K, value: TenantDraft[K]) => void;
	warnings?: string[];
}

/**
 * La conexión con Meta.
 *
 * Normalmente no se toca nada acá: estos tres datos los escribe el Embedded
 * Signup cuando el negocio conecta su número, y es el único camino que los sabe
 * bien. Están editables porque siguen siendo la única salida cuando una conexión
 * queda a medias y hay que arreglarla desde soporte.
 *
 * Un campo que se deja vacío no borra lo guardado: ver `toPayload`.
 */
const WhatsappSection: React.FC<Props> = ({ draft, set, warnings = [] }) => (
	<div className="space-y-8">
		<SectionHeader
			title="WhatsApp"
			description="Las credenciales de la conexión. Las escribe el registro embebido; acá solo se corrigen."
		/>

		<div className="space-y-4">
			<Field
				label="Número de teléfono"
				htmlFor="whatsappPhoneNumber"
				hint="El número visible del negocio, tal como lo devuelve Meta."
			>
				<Input
					id="whatsappPhoneNumber"
					value={draft.whatsappPhoneNumber}
					onChange={(event) => set('whatsappPhoneNumber', event.target.value)}
					placeholder="+15556384943"
				/>
			</Field>

			<Field label="WhatsApp Phone ID" htmlFor="whatsappPhoneId">
				<Input
					id="whatsappPhoneId"
					value={draft.whatsappPhoneId}
					onChange={(event) => set('whatsappPhoneId', event.target.value)}
					placeholder="1013549818517591"
				/>
			</Field>

			<Field label="WhatsApp Access Token" htmlFor="whatsappAccessToken">
				<Input
					id="whatsappAccessToken"
					value={draft.whatsappAccessToken}
					onChange={(event) => set('whatsappAccessToken', event.target.value)}
					placeholder="EAAL..."
				/>
			</Field>
		</div>

		{warnings.map((warning) => (
			<p key={warning} className="text-sm text-amber-600 dark:text-amber-500">
				{warning}
			</p>
		))}
	</div>
);

export default WhatsappSection;
