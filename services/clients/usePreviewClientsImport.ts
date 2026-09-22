import { useMutation } from '@tanstack/react-query';
import { previewClientsImport } from './clientsImport.service';

/**
 * El análisis del CSV: qué se crearía, qué ya existe y qué se omite.
 *
 * Es una mutación y no una consulta aunque no escriba nada: lo que la dispara es
 * un archivo que el usuario acaba de elegir, no una clave que se pueda cachear.
 * Se vuelve a llamar cada vez que se corrige el mapeo o el prefijo del país,
 * porque las dos cosas cambian el resultado fila por fila.
 */
const usePreviewClientsImport = () =>
	useMutation({ mutationFn: previewClientsImport });

export default usePreviewClientsImport;
