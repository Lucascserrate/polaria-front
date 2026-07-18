'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

type EmbeddedSignupMetaPayload = {
	businessId?: string;
	wabaId?: string;
	phoneNumberId?: string;
};

const META_SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js';

const WhatsappEmbeddedSignupButton: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [connected, setConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const embeddedSignupMetaRef = useRef<EmbeddedSignupMetaPayload>({});

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

	const extractEmbeddedSignupMetaPayload = useCallback(
		(eventData: unknown): EmbeddedSignupMetaPayload | null => {
			let payload: unknown = eventData;

			if (typeof eventData === 'string') {
				try {
					payload = JSON.parse(eventData);
				} catch {
					return null;
				}
			}

			if (!payload || typeof payload !== 'object') return null;

			const candidate = payload as Record<string, unknown>;
			const sources = [
				candidate,
				candidate.data,
				candidate.payload,
				candidate.meta,
				candidate.response,
				candidate.extras,
			].filter((value): value is Record<string, unknown> => {
				return Boolean(value) && typeof value === 'object';
			});

			const readField = (
				sourcesToRead: Record<string, unknown>[],
				keys: string[],
			): string | undefined => {
				for (const source of sourcesToRead) {
					for (const key of keys) {
						const value = source[key];
						if (typeof value === 'string' && value.trim()) {
							return value;
						}
					}
				}
				return undefined;
			};

			const businessId = readField(sources, ['business_id', 'businessId']);
			const wabaId = readField(sources, ['waba_id', 'wabaId']);
			const phoneNumberId = readField(sources, [
				'phone_number_id',
				'phoneNumberId',
			]);

			if (!businessId && !wabaId && !phoneNumberId) return null;

			return {
				businessId,
				wabaId,
				phoneNumberId,
			};
		},
		[],
	);

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

	useEffect(() => {
		if (!loading || typeof window === 'undefined') return;

		const handleMessage = (event: MessageEvent) => {
			console.log('[Embedded Signup] RAW EVENT origin', event.origin);
			console.log('[Embedded Signup] RAW EVENT data', event.data);
			if (
				typeof event.origin !== 'string' ||
				!event.origin.includes('facebook.com')
			) {
				return;
			}

			const payload = extractEmbeddedSignupMetaPayload(event.data);
			if (!payload) return;

			embeddedSignupMetaRef.current = {
				...embeddedSignupMetaRef.current,
				...payload,
			};
			console.log(
				'[Embedded Signup] meta payload captured',
				embeddedSignupMetaRef.current,
			);
		};

		window.addEventListener('message', handleMessage);
		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, [extractEmbeddedSignupMetaPayload, loading]);

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

		setLoading(true);
		setConnected(false);
		setError(null);
		embeddedSignupMetaRef.current = {};
		console.log('[Embedded Signup] Starting Embedded Signup');
		console.log('[Embedded Signup] current URL', window.location.href);

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

						console.log('[Embedded Signup] code', code.substring(0, 20));
						// Esperar a que llegue el postMessage de Meta
						await new Promise((resolve) => setTimeout(resolve, 1500));
						const finalPayload = {
							code,
							businessId: embeddedSignupMetaRef.current.businessId,
							wabaId: embeddedSignupMetaRef.current.wabaId,
							phoneNumberId: embeddedSignupMetaRef.current.phoneNumberId,
						};
						console.log('[Embedded Signup] final payload', finalPayload);
						await completeWhatsappEmbeddedSignup(finalPayload);
						console.log('[Embedded Signup] OAuth completed');
						setConnected(true);
					} catch (signupError) {
						console.error('[Embedded Signup] complete failed', signupError);
						setError('No se pudo completar la conexión con WhatsApp.');
					} finally {
						setLoading(false);
					}
				})();
			},
			{
				config_id: configId,
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
