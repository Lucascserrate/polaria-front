'use client';

import { useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
	/** El texto tal como se edita, con el marcador sin resolver. */
	value: string;
	onChange: (value: string) => void;
	/** El de fábrica, al que se puede volver. */
	defaultText: string;
	/** El marcador que se reemplaza al enviar. Lo nombra el backend. */
	placeholder: string;
	maxLength: number;
	/** Los botones del menú, en orden. No son editables. */
	previewButtons: string[];
	/** Con qué se reemplaza el marcador en la vista previa. */
	businessName: string;
	disabled?: boolean;
}

/**
 * El saludo con el que Polaria recibe a un cliente.
 *
 * La vista previa está siempre abierta, a diferencia de la de recordatorios, que
 * se despliega. Acá el mensaje **es** lo que se edita: esconder el resultado
 * detrás de un clic obligaría a resolver el marcador de cabeza para saber qué
 * se está escribiendo.
 *
 * El reemplazo lo hace el navegador y no el backend porque tiene que seguir al
 * teclado. Lo único que no se decide acá es cómo se llama el marcador, que llega
 * en `placeholder`: es lo que evita que el panel y el envío entiendan cosas
 * distintas por "{negocio}".
 */
const WelcomeMessageCard: React.FC<Props> = ({
	value,
	onChange,
	defaultText,
	placeholder,
	maxLength,
	previewButtons,
	businessName,
	disabled = false,
}) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Misma regla que el backend: en blanco significa "el de fábrica", no "sin
	// saludo". El menú no puede salir sin cuerpo.
	const rendered = (value.trim() ? value : defaultText)
		.split(placeholder)
		.join(businessName || 'tu negocio');

	const isDefault = value.trim() === defaultText.trim();
	const remaining = maxLength - value.length;

	/**
	 * Inserta el marcador donde está el cursor.
	 *
	 * Existe porque escribir llaves en el teclado de un teléfono es incómodo, y
	 * este es un campo que se edita una vez y casi siempre desde el celular. Si
	 * no hay foco, se agrega al final: es lo que espera quien recién apretó el
	 * botón sin haber tocado el texto.
	 */
	const insertPlaceholder = () => {
		const textarea = textareaRef.current;

		if (!textarea) {
			onChange(`${value}${placeholder}`);
			return;
		}

		const { selectionStart, selectionEnd } = textarea;
		const next =
			value.slice(0, selectionStart) + placeholder + value.slice(selectionEnd);

		onChange(next.slice(0, maxLength));

		// El cursor tiene que quedar después del marcador, no volver al principio.
		requestAnimationFrame(() => {
			const caret = selectionStart + placeholder.length;
			textarea.focus();
			textarea.setSelectionRange(caret, caret);
		});
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<div className="flex items-end justify-between gap-4">
					<Label htmlFor="welcome-message" className="text-sm font-medium">
						El saludo
					</Label>

					{/*
					 * Se marca al llegar al tope y no al pasarlo: el `maxLength` del
					 * campo corta antes, así que sin esto el texto dejaría de entrar sin
					 * que nada lo explique.
					 */}
					<span
						className={cn(
							'text-xs tabular-nums',
							remaining === 0 ? 'text-amber-600' : 'text-muted-foreground',
						)}
					>
						{value.length} / {maxLength}
					</span>
				</div>

				<textarea
					id="welcome-message"
					ref={textareaRef}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					maxLength={maxLength}
					rows={4}
					disabled={disabled}
					className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full resize-y rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
				/>

				<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
					<button
						type="button"
						onClick={insertPlaceholder}
						disabled={disabled}
						className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-foreground transition-colors hover:bg-accent disabled:opacity-50"
					>
						{placeholder}
					</button>

					<p className="text-xs text-muted-foreground">
						Se reemplaza por el nombre de tu negocio al enviar. Si te renombrás,
						el saludo te sigue.
					</p>
				</div>
			</div>

			{!isDefault && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={disabled}
					onClick={() => onChange(defaultText)}
					className="-ml-2 h-8 text-muted-foreground"
				>
					<RotateCcw className="mr-2 h-3.5 w-3.5" />
					Volver al saludo original
				</Button>
			)}

			<div className="space-y-3">
				<p className="text-sm font-medium">Cómo lo verá tu cliente</p>

				{/*
				 * Una burbuja de chat, no una tarjeta del panel: el saludo se lee en un
				 * teléfono, arriba de dos botones, y esa forma es la mitad de la
				 * información. El ancho está acotado porque un mensaje de WhatsApp
				 * nunca ocupa toda la pantalla.
				 */}
				<div className="rounded-xl bg-neutral-100 p-4 sm:p-5">
					<div className="max-w-88 overflow-hidden rounded-2xl rounded-tl-sm bg-white shadow-sm ring-1 ring-black/5">
						<p className="px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-line text-neutral-800">
							{rendered}
						</p>

						{/*
						 * Dos botones van uno al lado del otro y tres se apilan: es como
						 * los acomoda WhatsApp, y el saludo tiene dos. Dibujarlos siempre
						 * igual haría que la vista previa dejara de parecerse al mensaje
						 * en cuanto el menú cambie.
						 */}
						{previewButtons.length > 0 && (
							<div
								className={cn(
									'border-t border-neutral-100',
									previewButtons.length > 2
										? 'divide-y divide-neutral-100'
										: 'flex divide-x divide-neutral-100',
								)}
							>
								{previewButtons.map((button) => (
									<span
										key={button}
										className="flex-1 py-2 text-center text-[13px] font-medium text-sky-600"
									>
										{button}
									</span>
								))}
							</div>
						)}
					</div>

					<p className="mt-3 text-xs text-neutral-500">
						Los botones no se editan: son lo que Polaria sabe hacer. Quien ya
						tiene un turno recibe otro mensaje, con su cita.
					</p>
				</div>
			</div>
		</div>
	);
};

export default WelcomeMessageCard;
