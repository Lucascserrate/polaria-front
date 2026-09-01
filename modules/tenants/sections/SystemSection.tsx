'use client';

import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import SectionHeader from '../SectionHeader';
import Field from '../Field';
import type { TenantDraft } from '../useTenantDraft';
import type { TenantStatus } from '@/types/tenant.types';

interface Props {
	draft: TenantDraft;
	set: <K extends keyof TenantDraft>(key: K, value: TenantDraft[K]) => void;
}

const SystemSection: React.FC<Props> = ({ draft, set }) => (
	<div className="space-y-8">
		<SectionHeader
			title="Sistema"
			description="Los dos interruptores que soporte puede mover sin tocar nada del negocio."
		/>

		<Field
			label="Estado"
			htmlFor="status"
			hint="Un negocio inactivo sigue existiendo con todos sus datos; deja de operar."
		>
			<Select
				value={draft.status}
				onValueChange={(value) => set('status', value as TenantStatus)}
			>
				<SelectTrigger id="status">
					<SelectValue placeholder="Selecciona un estado" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="active">Activo</SelectItem>
					<SelectItem value="inactive">Inactivo</SelectItem>
				</SelectContent>
			</Select>
		</Field>

		<label className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
			<span>
				<span className="text-sm font-medium">IA habilitada</span>
				<span className="mt-1 block text-xs text-muted-foreground">
					El interruptor general de Polaria: apagado, deja de responder los
					mensajes de este negocio al instante.
				</span>
			</span>
			<Switch
				checked={draft.aiEnabled}
				onCheckedChange={(next) => set('aiEnabled', next)}
			/>
		</label>
	</div>
);

export default SystemSection;
