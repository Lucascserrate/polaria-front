'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import useCompleteWhatsappSignup from '@/services/settings/useCompleteWhatsappSignup';
import {
	COEXISTENCE_FEATURE_TYPE,
	COEXISTENCE_FINISH_EVENT,
	META_SDK_SRC,
} from './utils/constants';
import { Card } from '@/components/ui/card';

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
	/** Evento final del flujo: FINISH, FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING, CANCEL, ERROR... */
	event?: string;
	errorMessage?: string;
};

type WhatsappEmbeddedSignupButtonProps = {
	connected?: boolean;
	connectedAt?: string | null;
	phoneNumber?: string | null;
	verifiedName?: string | null;
};

/**
 * `extras` del flujo de Embedded Signup.
 *
 * En v4 la selección de productos vive en la configuración de Facebook Login
 * for Business, y para el flujo estándar `extras` va vacío. Coexistence es la
 * excepción: Meta documenta que sigue pidiéndose con `featureType`, así que ese
 * campo se manda igual en v4.
 *
 * - `NEXT_PUBLIC_META_EMBEDDED_SIGNUP_VERSION`: `v4` (default) o `v3`.
 * - `NEXT_PUBLIC_META_EMBEDDED_SIGNUP_COEXISTENCE`: `false` para forzar el
 *   flujo estándar (crear WABA nueva) sin tocar código.
 *
 * v2 queda deprecado por Meta el 15 de octubre de 2026.
 */
const buildSignupExtras = (): Record<string, unknown> => {
	const version =
		process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_VERSION?.trim() || 'v4';
	const coexistenceEnabled =
		process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_COEXISTENCE?.trim() !==
		'false';

	if (version === 'v3') {
		return {
			setup: {},
			version: 'v3',
			...(coexistenceEnabled ? { featureType: COEXISTENCE_FEATURE_TYPE } : {}),
		};
	}

	return coexistenceEnabled ? { featureType: COEXISTENCE_FEATURE_TYPE } : {};
};

/** Solo se aceptan `postMessage` que vengan de un host de Meta. */
const isMetaOrigin = (origin: string): boolean => {
	try {
		const { hostname } = new URL(origin);
		return hostname === 'facebook.com' || hostname.endsWith('.facebook.com');
	} catch {
		return false;
	}
};

const WhatsappEmbeddedSignupButton: React.FC<
	WhatsappEmbeddedSignupButtonProps
> = ({
	connected = false,
	connectedAt = null,
	phoneNumber = null,
	verifiedName = null,
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const embeddedSignupMetaRef = useRef<EmbeddedSignupMetaPayload>({});
	const { mutateAsync: completeSignup } = useCompleteWhatsappSignup();

	// El estado de conexión sale de `/settings`, que es lo único que sabe qué
	// número quedó guardado. Un flag local además mentiría al cambiar de número:
	// diría "conectado" sin poder decir a cuál.
	const isConnected = connected;

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

			// Meta emite varios `postMessage` desde el iframe; solo el de tipo
			// WA_EMBEDDED_SIGNUP trae los ids del onboarding.
			if (candidate.type !== 'WA_EMBEDDED_SIGNUP') return null;

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
			const event = readField(sources, ['event']);
			const errorMessage = readField(sources, [
				'error_message',
				'errorMessage',
			]);

			if (!businessId && !wabaId && !phoneNumberId && !event) return null;

			return {
				businessId,
				wabaId,
				phoneNumberId,
				event,
				errorMessage,
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
		if (typeof window === 'undefined') return;

		const handleMessage = (event: MessageEvent) => {
			if (!isMetaOrigin(event.origin)) return;

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
	}, [extractEmbeddedSignupMetaPayload]);

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
							const { event, errorMessage } = embeddedSignupMetaRef.current;
							if (event === 'CANCEL') {
								setError('Cancelaste la conexión con WhatsApp.');
								return;
							}
							setError(
								errorMessage ?? 'Meta no devolvió un authorization code.',
							);
							return;
						}

						await new Promise((resolve) => setTimeout(resolve, 1500));
						const meta = embeddedSignupMetaRef.current;
						const finalPayload = {
							code,
							businessId: meta.businessId,
							wabaId: meta.wabaId,
							phoneNumberId: meta.phoneNumberId,
							// Coexistence: el número sigue activo en la app de WhatsApp
							// Business, así que el backend no debe registrarlo de nuevo y
							// tiene que disparar la sincronización de contactos e historial.
							coexistence: meta.event === COEXISTENCE_FINISH_EVENT,
						};
						await completeSignup(finalPayload);
					} catch (signupError) {
						console.error('[Embedded Signup] complete failed', signupError);
						// El caso más probable acá es un 409: el número o la cuenta ya
						// están conectados a otro negocio. Ese mensaje le sirve al dueño,
						// así que se muestra tal cual en vez de un error genérico.
						const message =
							axios.isAxiosError(signupError) &&
							typeof signupError.response?.data?.message === 'string'
								? signupError.response.data.message
								: 'No se pudo completar la conexión con WhatsApp. La conexión anterior sigue activa.';
						setError(message);
					} finally {
						setLoading(false);
					}
				})();
			},
			{
				config_id: configId,
				response_type: 'code',
				override_default_response_type: true,
				extras: buildSignupExtras(),
			},
		);
	};

	return (
		<Card className="p-4">
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
						WhatsApp Embedded Signup
					</p>
					<h3 className="text-lg font-semibold text-foreground">
						{isConnected ? 'WhatsApp conectado' : 'Conectá WhatsApp desde Meta'}
					</h3>

					{isConnected ? (
						<div className="space-y-0.5 pt-1">
							<p className="text-sm text-foreground">
								{phoneNumber ?? 'Número no disponible'}
								{verifiedName ? (
									<span className="text-muted-foreground">
										{' '}
										· {verifiedName}
									</span>
								) : null}
							</p>
							<p className="text-xs text-muted-foreground">
								{connectedAt
									? `Conectado el ${new Date(connectedAt).toLocaleString('es')}`
									: 'Conexión activa'}
							</p>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							Activá la integración oficial para empezar a recibir mensajes en
							tu cuenta.
						</p>
					)}
				</div>

				{/*
				 * Conectado, el botón no desaparece: cambiar de número es el mismo
				 * Embedded Signup, y esconderlo dejaba al negocio atado para siempre al
				 * primer número que eligió. Va en `outline` porque acá ya no es la
				 * acción principal de la pantalla.
				 */}
				<Button
					type="button"
					onClick={handleActivate}
					variant={isConnected ? 'outline' : 'default'}
					className="w-full md:w-auto md:min-w-44"
					size="lg"
					disabled={loading}
				>
					{loading
						? isConnected
							? 'Cambiando...'
							: 'Conectando...'
						: isConnected
							? 'Cambiar número'
							: 'Activar WhatsApp'}
				</Button>
			</div>

			{isConnected ? (
				<p className="mt-3 text-xs text-muted-foreground">
					Al cambiar el número conservás todo lo demás: servicios, staff,
					horarios y el historial de conversaciones. Solo se reemplaza la cuenta
					de WhatsApp que usa Polaria, y el número actual sigue activo hasta que
					la nueva conexión se complete.
				</p>
			) : null}

			{error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
		</Card>
	);
};

export default WhatsappEmbeddedSignupButton;
