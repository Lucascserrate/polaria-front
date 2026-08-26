'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ROUTES } from '@/constants/routes';
import type { TeamMemberPayload } from '@/types/staff.types';
import TeamMemberEditor from '@/modules/team/TeamMemberEditor';
import useCreateStaff from '@/services/staff/useCreateStaff';

const NewTeamMemberPage = () => {
	const router = useRouter();
	const createStaff = useCreateStaff();
	const [error, setError] = useState<string | null>(null);

	const handleSave = async (payload: TeamMemberPayload) => {
		setError(null);

		try {
			await createStaff.mutateAsync({ ...payload, isActive: true });
			router.push(ROUTES.team);
		} catch (cause) {
			setError(
				axios.isAxiosError(cause) &&
					typeof cause.response?.data?.message === 'string'
					? cause.response.data.message
					: 'No se pudo crear el miembro del equipo. Intentá de nuevo.',
			);
		}
	};

	return (
		<TeamMemberEditor
			saving={createStaff.isPending}
			error={error}
			onSave={(payload) => void handleSave(payload)}
		/>
	);
};

export default NewTeamMemberPage;
