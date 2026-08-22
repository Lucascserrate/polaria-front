'use client';

import WhatsappEmbeddedSignupButton from '@/modules/settings/WhatsappEmbeddedSignupButton';
import useGetSettings from '@/services/settings/useGetSettings';

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

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Cargando...</p>;
	}

	return (
		<WhatsappEmbeddedSignupButton
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
