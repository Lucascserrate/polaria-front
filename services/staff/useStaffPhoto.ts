import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStaffPhoto, uploadStaffPhoto } from './staff.service';
import { staffKeys } from './staffKeys';
import type { StaffMember } from '@/types/staff.types';

/**
 * Subir y quitar la foto de un miembro del equipo.
 *
 * Van juntas en un hook porque son la misma decisión en los dos sentidos, igual
 * que `useStaffAccess`. Y como esas, actúan de inmediato: no pasan por el
 * borrador del editor ni esperan a "Guardar cambios".
 *
 * Las dos escriben la ficha que devuelve el backend en su caché en lugar de
 * invalidarla —al revés que el resto de los hooks de equipo— porque la
 * respuesta ya es la ficha completa recién leída de la base: invalidar
 * agregaría una segunda vuelta a la red justo después de subir una foto desde
 * un teléfono, con el avatar en blanco mientras tanto. El listado sí se
 * invalida: ahí la foto también se ve, pero puede estar sin pedir.
 *
 * El error no se maneja acá: el mensaje del backend —qué formato no se acepta,
 * qué tamaño se pasó— es lo que hay que mostrar, y eso lo hace la pantalla.
 */
const useStaffPhotoCache = () => {
	const queryClient = useQueryClient();

	return (member: StaffMember) => {
		queryClient.setQueryData(staffKeys.detail(member.id), member);
		void queryClient.invalidateQueries({ queryKey: staffKeys.list() });
	};
};

export const useUploadStaffPhoto = () => {
	const save = useStaffPhotoCache();

	return useMutation({
		mutationFn: ({ id, file }: { id: string; file: File }) =>
			uploadStaffPhoto(id, file),
		onSuccess: save,
	});
};

export const useRemoveStaffPhoto = () => {
	const save = useStaffPhotoCache();

	return useMutation({
		mutationFn: (id: string) => deleteStaffPhoto(id),
		onSuccess: save,
	});
};
