'use client';

import { useState } from 'react';
import axios from 'axios';
import { CircleCheck, Clock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { StaffMember } from '@/types/staff.types';
import { ROLE_LABELS } from '../utils/roles';
import { accessStateOf } from '../utils/access';
import SectionHeader from '../SectionHeader';
import {
	useGrantStaffAccess,
	useRevokeStaffAccess,
} from '@/services/staff/useStaffAccess';

interface Props {
	member: StaffMember;
}

/**
 * El acceso de esta persona a Polaria.
 *
 * Es la única sección que **no** pasa por el guardado de la cabecera, y no es una
 * inconsistencia: dar y quitar acceso no es editar un campo, es abrir y cerrar una
 * puerta. Meterlo en el mismo botón que el color del calendario dejaría que un
 * "Guardar cambios" hecho por otra razón revocara un acceso sin que nadie lo
 * pidiera —y peor, que un "Cancelar" pareciera deshacerlo cuando ya no se puede.
 *
 * Por eso también existe solo al editar: no se puede habilitar el acceso de alguien
 * que todavía no tiene ficha.
 */
const AccessSection: React.FC<Props> = ({ member }) => {
	const state = accessStateOf(member);
	const [email, setEmail] = useState(member.accessEmail ?? member.email ?? '');
	const [error, setError] = useState<string | null>(null);

	const grant = useGrantStaffAccess();
	const revoke = useRevokeStaffAccess();

	const busy = grant.isPending || revoke.isPending;
	const roleLabel = ROLE_LABELS[member.accessRole ?? 'PROFESSIONAL'];

	const run = async (action: () => Promise<unknown>) => {
		setError(null);
		try {
			await action();
		} catch (cause) {
			setError(
				axios.isAxiosError(cause) &&
					typeof cause.response?.data?.message === 'string'
					? cause.response.data.message
					: 'No se pudo cambiar el acceso. Intentá de nuevo.',
			);
		}
	};

	return (
		<div className="space-y-6">
			<SectionHeader
				title="Acceso a Polaria"
				description="Si puede entrar al sistema, y con qué cuenta."
			/>

			{state !== 'NONE' && (
				<div className="flex items-start gap-3 rounded-lg border border-border p-4">
					{state === 'ACTIVE' ? (
						<CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-500" />
					) : (
						<Clock className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-500" />
					)}

					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium">
							{state === 'ACTIVE' ? 'Acceso activo' : 'Invitación pendiente'}
						</p>
						<p className="mt-0.5 text-sm break-words text-muted-foreground">
							{member.accessEmail}
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							{state === 'ACTIVE'
								? `Entra como ${roleLabel.toLowerCase()}.`
								: 'Va a poder entrar con Google usando ese correo. Todavía no lo hizo.'}
						</p>
					</div>
				</div>
			)}

			{state === 'NONE' ? (
				<div className="space-y-3">
					<div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
						<KeyRound className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{member.name} está en el equipo pero no puede entrar a Polaria.
							Habilitá su acceso para que vea{' '}
							{(member.accessRole ?? 'PROFESSIONAL') === 'PROFESSIONAL'
								? 'su agenda y sus números'
								: 'el panel del negocio'}
							.
						</p>
					</div>

					<div className="max-w-md space-y-2">
						<Label htmlFor="accessEmail">Correo de acceso</Label>
						<Input
							id="accessEmail"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="nombre@email.com"
							aria-invalid={Boolean(error)}
						/>
						<p className="text-xs text-muted-foreground">
							Tiene que ser una cuenta de Google. Es con la que va a iniciar
							sesión, y no cambia si después corregís el correo de contacto.
						</p>
					</div>

					<Button
						disabled={busy || !email.trim()}
						onClick={() =>
							void run(() => grant.mutateAsync({ id: member.id, email }))
						}
					>
						{grant.isPending && <Spinner className="size-3.5" />}
						Habilitar acceso
					</Button>
				</div>
			) : (
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						disabled={busy}
						onClick={() => void run(() => revoke.mutateAsync(member.id))}
					>
						{revoke.isPending && <Spinner className="size-3.5" />}
						Quitar acceso
					</Button>
				</div>
			)}

			{error && <p className="text-sm text-red-600">{error}</p>}

			{state !== 'NONE' && (
				<p className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
					Desactivar a alguien en el equipo también le cierra el acceso, sin
					necesidad de quitárselo acá.
				</p>
			)}
		</div>
	);
};

export default AccessSection;
