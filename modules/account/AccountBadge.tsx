'use client';

import useGetAccount from '@/services/account/useGetAccount';

/** Iniciales del negocio, hasta dos: es lo que queda del saludo colapsado. */
const initialsOf = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join('');

/**
 * Quién está usando el panel, en el pie del menú.
 *
 * Sirve para lo que se ve poco pero importa: distinguir en qué cuenta se está.
 * Varios negocios comparten un mismo navegador —el dueño y quien atiende, o dos
 * locales—, y el correo es lo único que lo dice sin entrar a Configuración.
 *
 * Mientras carga no muestra nada: un "Hola" sin nombre es peor que un hueco.
 */
const AccountBadge: React.FC = () => {
	const { data } = useGetAccount();

	if (!data) return null;

	// En el menú angosto el nombre y el correo se recortan; el tooltip los completa.
	const label = data.email ? `${data.name} · ${data.email}` : data.name;

	return (
		<div
			className="flex items-center gap-2.5 collapsed:justify-center"
			title={label}
		>
			<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
				{initialsOf(data.name)}
			</span>

			<div className="min-w-0 collapsed:hidden">
				<p className="truncate text-sm font-medium text-neutral-900">
					Hola, {data.name}
				</p>
				{data.email && (
					<p className="truncate text-xs text-neutral-500">{data.email}</p>
				)}
			</div>
		</div>
	);
};

export default AccountBadge;
