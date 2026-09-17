'use client';

import { currencyLabel } from '@/lib/currencies';

/**
 * Una sección por moneda, con su nombre arriba.
 *
 * Los rankings dibujan una barra proporcional al monto de la fila, y esa barra
 * sólo compara dentro de una misma moneda: poner `Bs 12.000` y `USD 340` en el
 * mismo eje haría ver al servicio en dólares como el más chico cuando puede ser
 * el que más deja.
 *
 * Con una sola moneda —que es el caso de casi todos los negocios— no dibuja
 * ningún encabezado y la pantalla queda igual que antes de que esto existiera:
 * nombrar la moneda ahí sería ruido para responder algo que nadie preguntó.
 */
const CurrencySections = <T,>({
	groups,
	render,
}: {
	/** En orden: la moneda que más factura primero. */
	groups: Array<[currency: string, items: T[]]>;
	render: (items: T[], currency: string) => React.ReactNode;
}) => {
	if (groups.length <= 1) {
		const [currency = '', items = []] = groups[0] ?? [];
		return <>{render(items, currency)}</>;
	}

	return (
		<div className="space-y-5">
			{groups.map(([currency, items]) => (
				<div key={currency} className="space-y-2">
					<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
						{currencyLabel(currency)} · {currency}
					</p>
					{render(items, currency)}
				</div>
			))}
		</div>
	);
};

export default CurrencySections;
