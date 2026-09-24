'use client';

import BookingModeCard from '@/modules/settings/BookingModeCard';
import WhatsappEmbeddedSignupButton from '@/modules/settings/WhatsappEmbeddedSignupButton';
import useGetSettings from '@/services/settings/useGetSettings';
import useCompleteWhatsappSignup from '@/services/settings/useCompleteWhatsappSignup';
import useDisconnectWhatsapp from '@/services/settings/useDisconnectWhatsapp';

/**
 * Conexión de WhatsApp.
 *
 * Envuelve el componente que ya existía, que trae adentro los tres estados
 * —sin conectar, conectado, caída informada por Meta— junto con cambiar el número
 * y desconectar. No se dividió: son la misma decisión y el mismo bloque de
 * información.
 *
 * Debajo va cómo agendan los clientes, que es lo otro que decide qué hace
 * WhatsApp. Va segundo y no primero porque sin conexión no hay conversación que
 * configurar: primero se conecta el número, después se elige qué contesta.
 */
const WhatsappSettingsSection: React.FC = () => {
	const { data, isLoading } = useGetSettings();
	const whatsapp = data?.whatsappConnection;
	const { mutateAsync: completeSignup } = useCompleteWhatsappSignup();
	const { mutate: disconnect, isPending: disconnecting } =
		useDisconnectWhatsapp();

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Cargando...</p>;
	}

	return (
		<div className="space-y-8">
			<WhatsappEmbeddedSignupButton
				// El tenant sale del JWT: estas rutas escriben sobre el negocio que
				// está mirando. Soporte usa las suyas, que reciben el tenant en la URL.
				onComplete={completeSignup}
				onDisconnect={disconnect}
				disconnecting={disconnecting}
				connected={whatsapp?.connected ?? false}
				connectedAt={whatsapp?.connectedAt ?? null}
				phoneNumber={whatsapp?.phoneNumber ?? null}
				verifiedName={whatsapp?.verifiedName ?? null}
				unavailableSince={whatsapp?.unavailableSince ?? null}
				unavailableReason={whatsapp?.unavailableReason ?? null}
			/>

			<BookingModeCard />
		</div>
	);
};

export default WhatsappSettingsSection;
