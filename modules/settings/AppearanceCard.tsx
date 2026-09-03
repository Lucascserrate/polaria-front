'use client';

import { Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';

/**
 * El tema del panel.
 *
 * Es la única cosa de Configuración que no es del negocio sino de quien mira: no
 * se guarda en el servidor ni viaja con la cuenta, vive en este navegador. Por
 * eso lo dice en voz alta —dos personas que entran con el mismo usuario desde
 * dos computadoras no comparten esto, y sin el aviso el que lo cambió y no lo ve
 * en la otra pantalla lo lee como que no se guardó—.
 *
 * Va en una tarjeta y no en una fila con su propia pantalla como el resto del
 * hub: el control entero son tres botones, y una pantalla para tres botones es
 * un toque de más para llegar a algo que ya entraba.
 */
const AppearanceCard: React.FC = () => (
	<Card>
		<CardContent className="flex items-start gap-4">
			<Palette className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

			<div className="min-w-0 flex-1 space-y-3">
				<div className="space-y-1">
					<p className="text-base font-medium">Apariencia</p>
					<p className="text-sm text-muted-foreground">
						Cómo se ve el panel en este dispositivo. &quot;Sistema&quot; sigue
						lo que tengas configurado en la computadora o el teléfono.
					</p>
				</div>

				<ThemeToggle className="max-w-xs" />
			</div>
		</CardContent>
	</Card>
);

export default AppearanceCard;
