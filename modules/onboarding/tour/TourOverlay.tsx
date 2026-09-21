'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ONBOARDING_KEY } from '@/services/onboarding/onboarding.service';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';
import { findAnchor } from './anchors';
import { LESSONS, type Lesson } from './lessons';
import { CALLOUT_WIDTH, placeCallout, type Viewport } from './placement';
import { useRequirementMet } from './requirement';
import { useTour } from './TourContext';
import { useAnchorAppears } from './useAnchorAppears';
import { useAnchorRect, type AnchorRect } from './useAnchorRect';
import { useIsDesktop } from './useIsDesktop';

/** Lo que el hueco respira alrededor de lo iluminado. */
const PADDING = 8;

/** El redondeo de las esquinas del hueco, compartido con el recuadro. */
const RADIUS = 12;

/** Cada cuánto se vuelve a preguntar si la lección ya quedó hecha. */
const POLL_MS = 2500;

/*
 * El velo: un negro tenue, no el color de fondo del tema.
 *
 * Con `bg-background` el velo en claro era blanco sobre blanco y no oscurecía
 * nada: lavaba la pantalla en vez de apagarla, y el hueco no terminaba de
 * despegarse. Un negro al 30% apaga igual en los dos temas, que es lo que hace
 * que lo iluminado se lea como lo único encendido.
 */
const dimClasses =
	'absolute inset-0 bg-black/30 supports-backdrop-filter:backdrop-blur-[3px]';

const useViewport = () => {
	const [viewport, setViewport] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const sync = () =>
			setViewport({ width: window.innerWidth, height: window.innerHeight });

		sync();
		window.addEventListener('resize', sync);
		return () => window.removeEventListener('resize', sync);
	}, []);

	return viewport;
};

/**
 * El recorte del velo: la ventana entera menos el hueco, con esquinas redondas.
 *
 * `evenodd` es lo que convierte el segundo rectángulo en un agujero en vez de en
 * una segunda figura pintada.
 */
const holeClipPath = (hole: AnchorRect, viewport: Viewport): string => {
	const { top: y, left: x, width: w, height: h } = hole;
	// En un elemento más chico que el redondeo, la esquina se achica con él: si no,
	// los arcos se cruzan y el recorte sale dado vuelta.
	const r = Math.max(0, Math.min(RADIUS, w / 2, h / 2));

	const outer = `M0,0 H${viewport.width} V${viewport.height} H0 Z`;
	const inner =
		`M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} ` +
		`V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} ` +
		`H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} ` +
		`V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;

	return `path(evenodd, '${outer} ${inner}')`;
};

/**
 * El velo con un hueco.
 *
 * Es un solo panel recortado y no cuatro rectángulos alrededor. Con cuatro, el
 * hueco sólo podía ser un rectángulo de esquinas vivas, y quedaba peleado con
 * todo lo que ilumina —tarjetas, botones, campos—, que en este panel es redondo.
 * El recorte además sigue valiendo para el desenfoque: lo que queda afuera se
 * vela y se difumina hasta el borde curvo, no hasta una esquina cuadrada.
 *
 * Lo de adentro no tiene nada encima: el hueco está literalmente vacío y el
 * elemento se usa como siempre, que es de lo que se trata el tutorial.
 */
const Spotlight: React.FC<{ hole: AnchorRect | null; viewport: Viewport }> = ({
	hole,
	viewport,
}) => (
	<>
		<div
			className={dimClasses}
			style={hole ? { clipPath: holeClipPath(hole, viewport) } : undefined}
		/>

		{/*
		 * El recuadro que define el borde del hueco.
		 *
		 * Una línea de un píxel y casi transparente, no un anillo negro de dos: lo
		 * que llama la atención es el contraste entre lo nítido de adentro y lo
		 * velado de afuera, y el anillo sólo tiene que dejar claro dónde termina
		 * uno y empieza el otro. Marcado más fuerte competía con el elemento que
		 * estaba señalando.
		 */}
		{hole && (
			<div
				className="absolute ring-1 ring-foreground/15 transition-[top,left,width,height] duration-200"
				style={{
					top: hole.top,
					left: hole.left,
					width: hole.width,
					height: hole.height,
					borderRadius: RADIUS,
				}}
			/>
		)}
	</>
);

interface ActiveProps {
	lesson: Lesson;
}

const ActiveTour: React.FC<ActiveProps> = ({ lesson }) => {
	const { stepIndex, direction, next, back, stop, start } = useTour();
	const queryClient = useQueryClient();
	const viewport = useViewport();

	const index = Math.min(stepIndex, lesson.steps.length - 1);
	const step = lesson.steps[index];
	const isLast = index === lesson.steps.length - 1;

	const rect = useAnchorRect(step.anchor);
	const requirementMet = useRequirementMet(step.requires, index);

	/*
	 * El paso que espera una aparición se cierra solo. Sólo si no es el último:
	 * el último no lo cierra la interfaz sino el dato, más abajo.
	 */
	useAnchorAppears(step.waitFor, index, () => {
		if (!isLast) next();
	});

	/*
	 * La lección termina cuando el backend dice que el dato existe —hay un
	 * servicio, hay un profesional que atiende, hay una cita finalizada— y no
	 * cuando se acabaron los pasos. Es lo mismo que decide el cajón, así que una
	 * lección resuelta a mano, sin seguir el tutorial, también se cierra sola.
	 */
	const { data } = useGetOnboardingStatus();
	const celebrating = Boolean(data?.steps[lesson.id]);

	/*
	 * El estado lo cambia el usuario en otra pantalla —guarda un servicio, cierra
	 * una cita— y ninguna de esas mutaciones sabe del onboarding. Preguntar cada
	 * dos segundos y medio mientras el tutorial corre sale más barato que hacer
	 * que cada formulario del panel se acuerde de invalidar esta consulta.
	 */
	useEffect(() => {
		if (celebrating) return;

		const id = window.setInterval(() => {
			void queryClient.invalidateQueries({ queryKey: ONBOARDING_KEY });
		}, POLL_MS);

		return () => window.clearInterval(id);
	}, [celebrating, queryClient]);

	/*
	 * Un paso que enseña a llegar a donde ya se está no se muestra. Sólo yendo
	 * hacia adelante: al volver, esta misma regla mandaba de nuevo al paso que se
	 * venía de dejar, y "Atrás" no llegaba a verse.
	 */
	useLayoutEffect(() => {
		if (direction === 'back') return;
		if (step.skipIf && !isLast && findAnchor(step.skipIf)) next();
	}, [step, isLast, next, direction]);

	/*
	 * Salir con Escape. El tutorial no encierra a nadie, así que tampoco debería
	 * haber que buscar el botón para dejarlo.
	 */
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') stop();
		};

		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [stop]);

	/*
	 * Traer a la vista lo iluminado: una vez por paso, y recién cuando existe. Al
	 * empezar el paso el elemento puede estar todavía en la pantalla anterior.
	 */
	const scrolled = useRef(-1);
	useEffect(() => {
		if (!rect || scrolled.current === index) return;

		const element = step.anchor ? findAnchor(step.anchor) : null;
		scrolled.current = index;
		element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}, [rect, index, step.anchor]);

	const calloutRef = useRef<HTMLDivElement>(null);
	const [calloutHeight, setCalloutHeight] = useState(200);
	useLayoutEffect(() => {
		if (calloutRef.current) setCalloutHeight(calloutRef.current.offsetHeight);
	}, [step, celebrating, viewport.width]);

	const hole = rect
		? {
				top: rect.top - PADDING,
				left: rect.left - PADDING,
				width: rect.width + PADDING * 2,
				height: rect.height + PADDING * 2,
			}
		: null;

	const place = placeCallout(
		celebrating ? null : hole,
		calloutHeight,
		viewport,
		// Un paso que se quedó sin anclaje se corre al pie: algo ocupó la pantalla
		// —un diálogo, un menú que se cerró— y el centro es donde eso está.
		celebrating ? 'center' : 'bottom',
	);

	/*
	 * Cuándo se ofrece "Siguiente".
	 *
	 * En los pasos que piden una acción sobre la pantalla —entrar a Servicios,
	 * abrir una solapa, guardar— no se ofrece: el paso se cierra al hacerla, y un
	 * botón al lado es una segunda forma de avanzar que no hace lo que el paso
	 * pide. Ese botón era lo que desincronizaba el tutorial de la pantalla: el
	 * cartel pasaba a "cuánto dura y cuánto sale" mientras el formulario seguía
	 * mostrando el nombre, y el hueco quedaba señalando algo que no estaba.
	 *
	 * Sí se ofrece en los pasos de completar —escribir un nombre, tildar
	 * servicios—, donde no hay nada que tocar que el tutorial pueda detectar y el
	 * único que sabe que terminó es el usuario.
	 *
	 * También en los que declaran una condición propia, aunque esperen una
	 * aparición: esa condición es la red. Si lo que el paso espera no llega —la
	 * cita se guardó en otro día y su tarjeta no está en esta pantalla—, el botón
	 * se enciende igual en cuanto la condición se cumple, y nadie queda encerrado
	 * en un paso que ya hizo.
	 *
	 * Y se ofrece al volver, sea el paso del tipo que sea: a un paso anterior se
	 * vuelve para releerlo, con la acción ya hecha, así que esperar a que se haga
	 * de nuevo dejaría el tutorial trabado sin salida hacia adelante.
	 */
	const showsNext =
		!isLast &&
		(!step.waitFor || step.requires !== undefined || direction === 'back');

	/** La próxima lección pendiente, para encadenarlas sin volver al cajón. */
	const following = celebrating
		? LESSONS.find(
				(candidate) => candidate.id !== lesson.id && !data?.steps[candidate.id],
			)
		: undefined;

	return (
		/*
		 * El velo deja pasar los clicks en todos lados. Es deliberado: el tutorial
		 * acompaña, no encierra. Quien quiera abrir otra cosa a mitad de camino
		 * puede, y el paso lo sigue esperando donde estaba.
		 */
		<div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
			{!celebrating && <Spotlight hole={hole} viewport={viewport} />}

			<div
				ref={calloutRef}
				role="dialog"
				aria-live="polite"
				/*
				 * El toque muere acá y no llega al documento.
				 *
				 * El cartel se dibuja fuera del cajón de la reserva —tiene que poder
				 * pararse en cualquier lado de la pantalla—, así que para la librería
				 * de diálogos tocarlo es tocar "afuera", y afuera significa cerrar.
				 * Apretar "Siguiente" con el cajón abierto lo cerraba con la reserva a
				 * medio armar.
				 *
				 * Cortar la propagación es preferible a que cada cajón aprenda a
				 * ignorar al tutorial: son tres cajones y dos diálogos, y el que se
				 * agregue mañana no se va a acordar. El click sigue llegando al botón,
				 * que es un evento aparte.
				 */
				onPointerDown={(event) => event.stopPropagation()}
				onMouseDown={(event) => event.stopPropagation()}
				onTouchStart={(event) => event.stopPropagation()}
				className="pointer-events-auto absolute rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl transition-[top,left] duration-200"
				style={{ top: place.top, left: place.left, width: CALLOUT_WIDTH }}
			>
				{celebrating ? (
					<>
						<div className="flex items-center gap-2">
							<Check className="size-4 shrink-0 text-success" />
							<p className="text-sm font-semibold">{lesson.title}</p>
						</div>
						<p className="mt-1.5 text-sm text-muted-foreground">
							Listo. De acá en adelante lo hacés solo, todas las veces que
							quieras.
						</p>

						<div className="mt-4 flex items-center justify-end gap-2">
							<Button variant="ghost" size="sm" onClick={stop}>
								Cerrar
							</Button>
							{following && (
								<Button
									size="sm"
									variant="outline"
									onClick={() => start(following)}
								>
									{following.title}
									<ArrowRight className="size-3.5" />
								</Button>
							)}
						</div>
					</>
				) : (
					<>
						<div className="flex items-start justify-between gap-3">
							<p className="text-sm font-semibold">{step.title}</p>
							<button
								type="button"
								aria-label="Salir del tutorial"
								onClick={stop}
								className="-mt-1 -mr-1 shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								<X className="size-4" />
							</button>
						</div>

						<p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>

						<div className="mt-4 flex items-center justify-between gap-2">
							<span className="text-xs tabular-nums text-muted-foreground">
								{index + 1} de {lesson.steps.length}
							</span>

							<div className="flex items-center gap-1">
								{index > 0 && (
									<Button variant="ghost" size="sm" onClick={back}>
										Atrás
									</Button>
								)}
								{showsNext && (
									<Button
										size="sm"
										variant="outline"
										disabled={!requirementMet}
										onClick={next}
									>
										Siguiente
									</Button>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

/**
 * El tutorial guiado, sobre la interfaz de verdad.
 *
 * No hay pantallas de práctica: lo que el negocio carga durante la lección son
 * sus servicios, su equipo y su primera cita. Una demo habría que mantenerla al
 * día con las pantallas reales, y enseñaría a usar algo que no existe.
 *
 * Solo en escritorio. En un teléfono el menú es un cajón, el editor es una fila
 * con scroll y el cartel taparía justo lo que hay que tocar: ahí la lección se
 * ofrece como enlace a la pantalla, que es lo que dibuja el cajón.
 */
const TourOverlay: React.FC = () => {
	const { lesson } = useTour();
	const desktop = useIsDesktop();

	if (!lesson || !desktop) return null;

	/*
	 * La clave reinicia el estado interno al cambiar de lección: sin ella, la
	 * lección nueva heredaría el "esto ya estaba hecho" de la anterior y nunca
	 * llegaría a festejar.
	 */
	return <ActiveTour key={lesson.id} lesson={lesson} />;
};

export default TourOverlay;
