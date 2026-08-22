'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { detectTimezone } from '@/modules/onboarding/constants';

interface Props {
	value: string;
	onChange: (timezone: string) => void;
	disabled?: boolean;
}

/**
 * Zonas horarias que ofrece el navegador.
 *
 * `Intl.supportedValuesOf` es la lista IANA completa y no hace falta mantenerla
 * a mano. Si el entorno no la expone, queda el valor actual más el del
 * dispositivo, que cubre el caso real: el negocio nació con la zona por defecto
 * y hay que corregirla a la de quien lo administra.
 */
const useTimezones = (current: string): string[] => {
	return useMemo(() => {
		const supported =
			typeof Intl.supportedValuesOf === 'function'
				? Intl.supportedValuesOf('timeZone')
				: [];

		const candidates = new Set<string>([
			...supported,
			current,
			detectTimezone() ?? current,
		]);

		return [...candidates].filter(Boolean).sort();
	}, [current]);
};

/** Hora actual en esa zona: es cómo uno verifica que eligió bien. */
const nowIn = (timezone: string): string | null => {
	try {
		return new Intl.DateTimeFormat('es', {
			timeZone: timezone,
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		}).format(new Date());
	} catch {
		return null;
	}
};

/**
 * Zona horaria del negocio.
 *
 * No es un dato cosmético: el horario de atención se interpreta en esta zona, y
 * una zona equivocada corre toda la agenda. Por eso se muestra la hora actual
 * allí, que es la forma en que una persona confirma de un vistazo si es la suya.
 */
const TimezoneSelect: React.FC<Props> = ({ value, onChange, disabled }) => {
	const timezones = useTimezones(value);
	const localTime = nowIn(value);

	return (
		<div className="space-y-2">
			<Label htmlFor="timezone">Zona horaria</Label>
			<Select value={value} disabled={disabled} onValueChange={onChange}>
				<SelectTrigger id="timezone">
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="max-h-72">
					{timezones.map((timezone) => (
						<SelectItem key={timezone} value={timezone}>
							{timezone}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="text-sm text-muted-foreground">
				{localTime
					? `Ahí son las ${localTime}. Tus horarios de atención se interpretan en esta zona.`
					: 'Tus horarios de atención se interpretan en esta zona.'}
			</p>
		</div>
	);
};

export default TimezoneSelect;
