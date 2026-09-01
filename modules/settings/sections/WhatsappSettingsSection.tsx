'use client';

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
		<WhatsappEmbeddedSignupButton
			// El tenant sale del JWT: estas rutas escriben sobre el negocio que está
			// mirando. Soporte usa las suyas, que reciben el tenant en la URL.
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
	);
};

export default WhatsappSettingsSection;
