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

type WhatsappEmbeddedSignupButtonProps = {
	connected?: boolean;
	connectedAt?: string | null;
	phoneNumber?: string | null;
};

const META_SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js';

const WhatsappEmbeddedSignupButton: React.FC<
	WhatsappEmbeddedSignupButtonProps
> = ({ connected = false, connectedAt = null, phoneNumber = null }) => {
	const [loading, setLoading] = useState(false);
	const [localConnected, setLocalConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const embeddedSignupMetaRef = useRef<EmbeddedSignupMetaPayload>({});
	const isConnected = connected || localConnected;

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
		setLocalConnected(false);
		setError(null);
		embeddedSignupMetaRef.current = {};

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

						await new Promise((resolve) => setTimeout(resolve, 1500));
						const finalPayload = {
							code,
							businessId: embeddedSignupMetaRef.current.businessId,
							wabaId: embeddedSignupMetaRef.current.wabaId,
							phoneNumberId: embeddedSignupMetaRef.current.phoneNumberId,
						};
						await completeWhatsappEmbeddedSignup(finalPayload);
						setLocalConnected(true);
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
		<div className="rounded-2xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/10 via-cyan-500/10 to-sky-500/10 p-4 shadow-sm">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
						WhatsApp Embedded Signup
					</p>
					<h3 className="text-lg font-semibold text-foreground">
						{isConnected ? 'WhatsApp conectado' : 'Conecta WhatsApp desde Meta'}
					</h3>
					<p className="text-sm text-muted-foreground">
						{isConnected
							? 'La cuenta ya quedo vinculada desde Meta y esta lista para usar.'
							: 'Activa la integracion oficial para empezar a recibir mensajes en tu cuenta.'}
					</p>
					{isConnected ? (
						<p className="text-xs text-emerald-300">
							{phoneNumber
								? `Numero conectado: ${phoneNumber}`
								: 'Conexion activa'}
							{connectedAt
								? ` - Desde ${new Date(connectedAt).toLocaleString()}`
								: ''}
						</p>
					) : null}
				</div>

				{!isConnected ? (
					<Button
						type="button"
						onClick={handleActivate}
						className="w-full md:w-auto md:min-w-44"
						size="lg"
						disabled={loading}
					>
						{loading ? 'Conectando...' : 'Activar WhatsApp'}
					</Button>
				) : null}
			</div>

			{error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
		</div>
	);
};

export default WhatsappEmbeddedSignupButton;
