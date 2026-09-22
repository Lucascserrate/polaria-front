import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importClients } from './clientsImport.service';
import { clientKeys } from './clientKeys';

/**
 * La importación de verdad.
 *
 * Invalida toda la cartera y no una página: entraron cientos de fichas de una
 * vez, así que no hay lista, total ni búsqueda que siga siendo válida.
 */
const useImportClients = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: importClients,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: clientKeys.all });
		},
	});
};

export default useImportClients;
