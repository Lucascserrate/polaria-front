'use client';

import { useState } from 'react';
import WhatsappEmbeddedSignupButton from '@/modules/settings/WhatsappEmbeddedSignupButton';
import { tenantsService } from '@/services/tenants.service';
import type { Tenant } from '@/types/tenant.types';
import SectionHeader from '../SectionHeader';

interface Props {
	tenant: Tenant;
	/** Relee la ficha: conectar y desconectar cambian el tenant del servidor. */
	onRefresh: () => void;
}

/**
 * La conexión con Meta, corrida desde soporte.
 *
 * Antes eran tres campos de texto —número, phone id, access token— y no servían
 * para lo único que hace falta cuando un negocio no puede conectar: **conectarlo**.
 * Un token pegado a mano no existe hasta que alguien lo obtiene de Meta, y el
 * intercambio del `code` por credenciales, el registro del número y la
 * suscripción de la app son cosas que solo hace el flujo real.
 *
 * Así que acá va el mismo Embedded Signup del panel del negocio, con una sola
 * diferencia: las rutas de soporte reciben el tenant en la URL en vez de sacarlo
 * del JWT. Ver `SupportWhatsappController`.
 *
 * Es una sección que **actúa en el momento**, no un formulario: no pasa por el
 * borrador ni espera al "Guardar cambios" de la cabecera. Es a propósito —si las
 * credenciales vivieran en el borrador, guardar después de conectar pisaría lo
 * que acaba de escribir Meta con lo que se leyó al abrir la pantalla.
 */
const WhatsappSection: React.FC<Props> = ({ tenant, onRefresh }) => {
	const [disconnecting, setDisconnecting] = useState(false);

	const handleDisconnect = async () => {
		setDisconnecting(true);
		try {
			await tenantsService.disconnectWhatsapp(tenant.id);
			onRefresh();
		} catch (error) {
			console.error('Error disconnecting WhatsApp:', error);
		} finally {
			setDisconnecting(false);
		}
	};

	return (
		<div className="space-y-8">
			<SectionHeader
				title="WhatsApp"
				description="Conectá el número del negocio con el mismo flujo de Meta que usa su panel."
			/>

			<WhatsappEmbeddedSignupButton
				audience="support"
				// El error se deja subir: el componente lo muestra tal cual, y el más
				// probable —el número ya está tomado por otro negocio— es justo el que
				// soporte necesita leer con las palabras del backend.
				onComplete={async (result) => {
					await tenantsService.completeWhatsappSignup(tenant.id, result);
					onRefresh();
				}}
				onDisconnect={() => void handleDisconnect()}
				disconnecting={disconnecting}
				connected={Boolean(tenant.whatsappPhoneId)}
				connectedAt={tenant.whatsappConnectedAt ?? null}
				phoneNumber={tenant.whatsappPhoneNumber}
				verifiedName={tenant.whatsappVerifiedName ?? null}
				unavailableSince={tenant.whatsappUnavailableSince ?? null}
				unavailableReason={tenant.whatsappUnavailableReason ?? null}
			/>

			<Credentials tenant={tenant} />
		</div>
	);
};

/**
 * Lo que quedó guardado, para leer y no para editar.
 *
 * Sirve para diagnosticar: cuando Meta responde algo raro, lo primero que hay
 * que ver es si el phone id y la WABA que quedaron son los que el negocio dice
 * tener. Editables no aportaban nada —ver arriba— pero visibles sí.
 */
const Credentials: React.FC<{ tenant: Tenant }> = ({ tenant }) => (
	<dl className="space-y-3 rounded-xl border border-border p-4 text-sm">
		<Row label="Número" value={tenant.whatsappPhoneNumber} />
		<Row label="Phone ID" value={tenant.whatsappPhoneId} />
		<Row
			label="Access token"
			// El token no se muestra: es una credencial que abre la cuenta de Meta del
			// negocio, y para diagnosticar alcanza con saber si está o no.
			value={tenant.whatsappAccessToken ? 'Guardado' : null}
		/>
	</dl>
);

const Row: React.FC<{ label: string; value?: string | null }> = ({
	label,
	value,
}) => (
	<div className="flex items-baseline justify-between gap-4">
		<dt className="text-muted-foreground">{label}</dt>
		<dd className="min-w-0 truncate text-right font-medium">
			{value || <span className="text-muted-foreground">Sin dato</span>}
		</dd>
	</div>
);

export default WhatsappSection;
