import { axiosInstance } from '@/lib/axios';
import type {
	ImportAnalysisApi,
	ImportMappingApi,
	ImportResultApi,
} from '@/types/clients-import.types';

/** Lo que se manda en los dos pasos: el archivo, y qué hacer con él. */
export interface ImportRequest {
	file: File;
	/**
	 * Lo que el negocio corrigió. Un campo ausente significa "usá lo que
	 * detectaste"; una lista vacía significa "no importes este campo".
	 */
	mapping?: Partial<ImportMappingApi>;
	/** Prefijo para los números sin país, sin `+`. */
	dialCode?: string;
	/** Completar los campos vacíos de los clientes que ya existen. */
	fillMissing?: boolean;
}

/**
 * Cómo se dice "ninguna columna" en un formulario multipart.
 *
 * Un arreglo vacío no se puede enviar: `FormData` sólo tiene campos, y un campo
 * sin valores es un campo que no está, que el backend lee como "detectalo vos".
 * Mandar una cadena vacía es lo que distingue "no lo elegí" de "elegí que no se
 * importe", y el backend descarta las cadenas vacías al armar el mapeo.
 */
const NONE = '';

const appendColumns = (
	form: FormData,
	field: string,
	columns: string[] | undefined,
) => {
	if (!columns) return;
	if (columns.length === 0) {
		form.append(field, NONE);
		return;
	}

	columns.forEach((column) => form.append(field, column));
};

/**
 * El pedido como `multipart/form-data`.
 *
 * Sin `Content-Type` a mano: el navegador tiene que poner el suyo, que incluye
 * el `boundary` con el que se separan las partes. Escribirlo nosotros lo deja
 * sin `boundary` y el backend recibe un cuerpo que no puede partir.
 */
const toForm = ({ file, mapping, dialCode, fillMissing }: ImportRequest) => {
	const form = new FormData();
	form.append('file', file);

	appendColumns(form, 'nameColumns', mapping?.nameColumns);
	appendColumns(form, 'phoneColumns', mapping?.phoneColumns);
	appendColumns(form, 'emailColumns', mapping?.emailColumns);

	if (dialCode) form.append('dialCode', dialCode);
	if (fillMissing !== undefined) {
		form.append('fillMissing', String(fillMissing));
	}

	return form;
};

/** Qué pasaría si se importa este archivo. No escribe nada. */
export const previewClientsImport = async (
	request: ImportRequest,
): Promise<ImportAnalysisApi> => {
	const { data } = await axiosInstance.post<ImportAnalysisApi>(
		'/clients/import/preview',
		toForm(request),
	);

	return data;
};

/** Importa de verdad. El backend vuelve a analizar el archivo antes de escribir. */
export const importClients = async (
	request: ImportRequest,
): Promise<ImportResultApi> => {
	const { data } = await axiosInstance.post<ImportResultApi>(
		'/clients/import',
		toForm(request),
	);

	return data;
};
