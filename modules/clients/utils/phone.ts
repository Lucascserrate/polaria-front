/**
 * El teléfono como se guarda —`59170123456`— vuelto legible.
 *
 * Se guarda en el formato de WhatsApp, que son dígitos pegados y sin `+`, y así
 * es incómodo de leer y de dictar por teléfono. Acá sólo se le devuelve el `+` y
 * se separa el país: no se intenta el formato nacional de cada país, que son
 * reglas distintas por prefijo y no vale la pena mantenerlas para una lista.
 */
export const formatClientPhone = (
	phone: string | null | undefined,
	dialCode?: string,
): string => {
	if (!phone) return '—';

	if (dialCode && phone.startsWith(dialCode)) {
		return `+${dialCode} ${phone.slice(dialCode.length)}`;
	}

	return `+${phone}`;
};

/** De dónde entró el cliente, en palabras. */
export const SOURCE_LABELS: Record<string, string> = {
	whatsapp: 'WhatsApp',
	web: 'Página web',
	panel: 'Cargado a mano',
};
