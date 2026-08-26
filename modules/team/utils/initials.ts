/**
 * Las iniciales de alguien, para su avatar.
 *
 * Nombre y apellido cuando los hay; si solo hay un nombre, sus dos primeras
 * letras, que distingue mejor que una sola inicial en una lista de veinte
 * personas.
 */
export const initialsOf = (member: {
	firstName?: string | null;
	lastName?: string | null;
	name?: string;
}): string => {
	const first = clean(member.firstName);
	const last = clean(member.lastName);

	if (first && last) return (first[0] + last[0]).toUpperCase();
	if (first) return first.slice(0, 2).toUpperCase();

	// Los datos viejos podían no tener `firstName`, y una ficha sin iniciales se
	// ve como un avatar roto.
	const parts = clean(member.name).split(/\s+/).filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

	return '?';
};

const clean = (value?: string | null) => value?.trim() ?? '';
