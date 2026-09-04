'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { exitImpersonation } from '@/services/account/account.service';
import useGetAccount from '@/services/account/useGetAccount';

/**
 * El aviso de que no estás en tu negocio.
 *
 * Sin esto, una sesión de soporte se ve exactamente igual que la propia —es a
 * propósito: la gracia es reproducir lo que ve el negocio— y a los cinco minutos
 * uno se olvida. Estar a un click de tocarle algo al negocio de otro creyendo que
 * es el propio es el accidente que esta franja existe para evitar, así que va
 * arriba de todo, ocupa alto y no se puede cerrar.
 *
 * Salir recarga la página entera en vez de invalidar las consultas: lo que
 * cambia no es un dato sino de quién son **todos** los datos en memoria, y una
 * caché a medio limpiar mostraría las citas de un negocio con el nombre de otro.
 */
const ImpersonationBanner: React.FC = () => {
	const { data: account } = useGetAccount();
	const [leaving, setLeaving] = useState(false);

	if (!account?.impersonatedBy) return null;

	const leave = async () => {
		setLeaving(true);
		try {
			await exitImpersonation();
		} finally {
			window.location.reload();
		}
	};

	return (
		<div className="flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
			<ShieldAlert className="size-4 shrink-0" />
			<p className="min-w-0">
				Estás dentro de{' '}
				<span className="font-semibold">{account.businessName}</span> como
				soporte. Lo que hagas le cambia la agenda de verdad.
			</p>
			<Button
				type="button"
				size="sm"
				variant="outline"
				disabled={leaving}
				className="shrink-0 border-amber-900/30 bg-amber-100 text-amber-950 hover:bg-amber-50"
				onClick={() => void leave()}
			>
				{leaving && <Spinner className="size-3.5" />}
				Salir
			</Button>
		</div>
	);
};

export default ImpersonationBanner;
