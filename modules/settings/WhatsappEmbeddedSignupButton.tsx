'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { completeWhatsappEmbeddedSignup } from '@/services/settings';

declare global {
	interface Window {
		FB?: {
			init: (config: {
				appId: string;
				cookie?: boolean;
				xfbml?: boolean;
				version?: string;
			}) => void;
			login: (
				callback: (response: {
					status?: string;
					authResponse?: {
						code?: string;
						accessToken?: string;
						userID?: string;
					};
					error?: { message?: string; type?: string; code?: number };
				}) => void,
				options?: Record<string, unknown>,
			) => void;
		};
	}
}

const META_SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js';

const WhatsappEmbeddedSignupButton: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [connected, setConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const initializeSdk = useCallback(() => {
		const appId = process.env.NEXT_PUBLIC_META_APP_ID;
		if (!appId || typeof window === 'undefined' || !window.FB) return;

		window.FB.init({
			appId,
			cookie: true,
			xfbml: true,
			version: 'v21.0',
		});
	}, []);

	const getRedirectUri = () => {
		if (typeof window === 'undefined') return '';

		const configuredOrigin = process.env.NEXT_PUBLIC_META_REDIRECT_URI;

		if (configuredOrigin) {
			const value = configuredOrigin.trim();
			const separatorIndex = value.indexOf('=');
			if (separatorIndex > 0 && value.startsWith('NEXT_PUBLIC_')) {
				return value.slice(separatorIndex + 1).trim();
			}
			return value;
		}

		return window.location.origin;
	};

	useEffect(() => {
		if (typeof window === 'undefined') return;

		if (window.FB) {
			initializeSdk();
			return;
		}

		const existingScript = document.querySelector<HTMLScriptElement>(
			`script[src="${META_SDK_SRC}"]`,
		);

		if (existingScript) {
			existingScript.addEventListener('load', initializeSdk);
			return () => {
				existingScript.removeEventListener('load', initializeSdk);
			};
		}

		const script = document.createElement('script');
		script.src = META_SDK_SRC;
		script.async = true;
		script.defer = true;
		script.crossOrigin = 'anonymous';
		script.onload = () => {
			initializeSdk();
		};
		script.onerror = () => {
			setError('No se pudo cargar el SDK de Meta.');
			setLoading(false);
		};
		document.body.appendChild(script);

		return () => {
			script.onload = null;
		};
	}, [initializeSdk]);

	const handleActivate = () => {
		const appId = process.env.NEXT_PUBLIC_META_APP_ID;
		const configId = process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID;

		if (!appId || !configId) {
			setError('Faltan variables de entorno de Meta.');
			return;
		}

		if (!window.FB) {
			setError('Meta SDK no está listo todavía.');
			return;
		}

		const redirectUri = getRedirectUri();

		setLoading(true);
		setConnected(false);
		setError(null);
		console.log('[WhatsApp Embedded Signup] Starting Embedded Signup');
		console.log('[WhatsApp Embedded Signup] redirect_uri', redirectUri);

		window.FB.login(
			(response) => {
				void (async () => {
					try {
						if (response.error) {
							setError(
								response.error.message ??
									'Meta devolvió un error durante Embedded Signup.',
							);
							return;
						}

						const code = response.authResponse?.code;
						if (!code) {
							setError('Meta no devolvió un authorization code.');
							return;
						}

						console.log(
							'[WhatsApp Embedded Signup] Authorization code received',
						);
						await completeWhatsappEmbeddedSignup({ code });
						console.log('[WhatsApp Embedded Signup] OAuth completed');
						setConnected(true);
					} catch {
						setError('No se pudo completar la conexión con WhatsApp.');
					} finally {
						setLoading(false);
					}
				})();
			},
			{
				config_id: configId,
				redirect_uri: redirectUri,
				response_type: 'code',
				override_default_response_type: true,
				scope: 'whatsapp_business_management,whatsapp_business_messaging',
			},
		);
	};

	return (
		<div className="pt-2">
			<Button
				type="button"
				onClick={handleActivate}
				className="w-full md:w-auto"
				size="lg"
				disabled={loading}
			>
				{loading
					? 'Conectando...'
					: connected
						? 'WhatsApp conectado'
						: 'Activar WhatsApp'}
			</Button>
			{error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
		</div>
	);
};

export default WhatsappEmbeddedSignupButton;
