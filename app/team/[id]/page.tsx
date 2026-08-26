'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { TeamMemberPayload } from '@/types/staff.types';
import TeamMemberEditor from '@/modules/team/TeamMemberEditor';
import useGetStaffMember from '@/services/staff/useGetStaffMember';
import useUpdateStaff from '@/services/staff/useUpdateStaff';

const TeamMemberPage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const id = params?.id;

	const { data: member, isLoading, isError } = useGetStaffMember(id);
	const updateStaff = useUpdateStaff();
	const [error, setError] = useState<string | null>(null);

	const handleSave = async (payload: TeamMemberPayload) => {
		if (!id) return;
		setError(null);

		try {
			await updateStaff.mutateAsync({ id, data: payload });
			router.push(ROUTES.team);
		} catch (cause) {
			setError(
				axios.isAxiosError(cause) &&
					typeof cause.response?.data?.message === 'string'
					? cause.response.data.message
					: 'No se pudieron guardar los cambios. Intentá de nuevo.',
			);
		}
	};

	if (isLoading) {
		return (
			<p className="py-16 text-center text-muted-foreground">
				Cargando la ficha…
			</p>
		);
	}

	if (isError || !member) {
		return (
			<div className="space-y-4 py-16 text-center">
				<p className="text-muted-foreground">
					No encontramos a esta persona en el equipo.
				</p>
				<Button asChild variant="outline">
					<Link href={ROUTES.team}>Volver al equipo</Link>
				</Button>
			</div>
		);
	}

	return (
		<TeamMemberEditor
			// Remonta el editor si cambia de persona: el borrador se inicializa una
			// sola vez, así que sin esto una navegación entre dos fichas dejaría los
			// datos de la anterior.
			key={member.id}
			member={member}
			saving={updateStaff.isPending}
			error={error}
			onSave={(payload) => void handleSave(payload)}
		/>
	);
};

export default TeamMemberPage;
