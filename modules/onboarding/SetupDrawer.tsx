'use client';

import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { LESSONS, type Lesson } from '@/modules/onboarding/tour/lessons';
import { useTour } from '@/modules/onboarding/tour/TourContext';
import { useIsDesktop } from '@/modules/onboarding/tour/useIsDesktop';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';

interface RowProps {
	lesson: Lesson;
	done: boolean;
}

/**
 * Una lección, en su tarjeta.
 *
 * El icono reemplazó al número: el orden ya lo dice la posición en la lista, y
 * un número obliga a leer para saber de qué se trata la fila. Cuando está hecha,
 * el icono lo reemplaza la tilde —el mismo lugar, una sola marca de estado—.
 */
const LessonRow: React.FC<RowProps> = ({ lesson, done }) => {
	const { start, setDrawerOpen } = useTour();
	const desktop = useIsDesktop();
	const Icon = lesson.icon;

	return (
		<li
			className={cn(
				'rounded-xl border border-border p-3',
				done ? 'bg-muted/40' : 'bg-card',
			)}
		>
			<div className="flex items-start gap-3">
				<span
					className={cn(
						'flex size-8 shrink-0 items-center justify-center rounded-lg',

						done
							? 'bg-green-50 text-green-700'
							: 'bg-muted text-muted-foreground',
					)}
				>
					{done ? <Check className="size-4" /> : <Icon className="size-4" />}
				</span>

				<div className="min-w-0 flex-1">
					<p
						className={cn(
							'text-sm font-medium',
							done ? 'text-muted-foreground' : 'text-foreground',
						)}
					>
						{lesson.title}
					</p>
					<p className="mt-0.5 text-sm text-muted-foreground">
						{lesson.description}
					</p>

					{!done && (
						<div className="mt-2.5">
							{/*
							 * En escritorio arranca el tutorial guiado; en un teléfono es un
							 * enlace a la pantalla. No es una versión recortada por falta de
							 * tiempo: el guiado ilumina el menú lateral y el nav del editor, y
							 * en móvil ninguno de los dos está a la vista.
							 */}
							{desktop ? (
								<Button
									size="sm"
									variant="outline"
									onClick={() => start(lesson)}
								>
									Iniciar
								</Button>
							) : (
								<Button asChild size="sm" variant="outline">
									<Link href={lesson.href} onClick={() => setDrawerOpen(false)}>
										Ir a la pantalla
									</Link>
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
		</li>
	);
};

/**
 * Los primeros pasos, en un cajón sobre la pantalla en la que se está.
 *
 * Era una pantalla propia y dejó de serlo. Una pantalla obligaba a irse de donde
 * se estaba para leer una lista de enlaces que devolvían a otro lado, y al
 * volver ya no estaba: el lugar natural de una lista de tareas es encima de lo
 * que se está haciendo, no en lugar de eso. Además el tutorial guiado necesita
 * la pantalla real debajo, y una pantalla de setup no la tiene.
 *
 * Son tres lecciones y no cinco. La información del negocio y los horarios se
 * cargan en el onboarding, antes de entrar: listarlos acá era mostrar dos
 * tildes que nadie puso. WhatsApp bajó a sugerencia, al pie.
 *
 * Se dibuja con los grises del tema y nada con `primary`, que acá es casi negro:
 * un círculo y un botón oscuros por lección convertían una lista de tres
 * renglones en lo más pesado de la pantalla, justo en lo que se abre encima de
 * otra cosa.
 */
const SetupDrawer: React.FC = () => {
	const { drawerOpen, setDrawerOpen } = useTour();
	const { data } = useGetOnboardingStatus(drawerOpen);

	const done = data ? LESSONS.filter((l) => data.steps[l.id]).length : 0;
	const trialPending = data?.subscription.state === 'NOT_STARTED';

	return (
		<Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
			{/*
			 * `overflow-x-hidden` explícito y no por descarte.
			 *
			 * El CSS dice que si un eje deja de ser `visible`, el otro pasa a `auto`
			 * solo: poner nada más `overflow-y-auto` en la lista le daba también
			 * scroll horizontal, y con que un borde desborde medio píxel ya aparecía
			 * la barra de abajo. El panel no tiene nada que mostrar a lo ancho.
			 *
			 * El scroll vive en la lista y no en el panel para que el encabezado y la
			 * tarjeta de WhatsApp queden fijos en sus bordes.
			 */}
			<DrawerContent className="overflow-x-hidden">
				<DrawerHeader className="gap-0">
					<div className="flex items-start gap-3">
						<span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums">
							{done}/{LESSONS.length}
						</span>

						<div className="min-w-0 flex-1">
							<DrawerTitle>Primeros pasos</DrawerTitle>
							<DrawerDescription>
								Has completado {done} de {LESSONS.length} tareas
							</DrawerDescription>
						</div>

						{/*
						 * La salida propia. A pantalla completa —en móvil— no queda nada
						 * afuera donde tocar para cerrar, así que el contenido tiene que
						 * traerla.
						 */}
						<DrawerClose
							aria-label="Cerrar"
							className="-mt-1 -mr-1 shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							<X className="size-4" />
						</DrawerClose>
					</div>
				</DrawerHeader>

				<p className="px-4 pb-3 text-sm font-semibold">
					Descubrí cómo usar Polaria
				</p>

				<ul className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto px-4 pb-4">
					{LESSONS.map((lesson) => (
						<LessonRow
							key={lesson.id}
							lesson={lesson}
							done={Boolean(data?.steps[lesson.id])}
						/>
					))}
				</ul>

				{/*
				 * WhatsApp, pegado al borde de abajo y sin margen a los costados.
				 *
				 * A ras del borde y con el fondo cambiado para que no se lea como una
				 * cuarta lección: dejó de ser un paso del onboarding —Polaria toma
				 * reservas por su página aunque el canal no esté conectado— pero sigue
				 * siendo lo primero que pregunta quien ya lo usa.
				 */}
				{data && !data.whatsappConnected && (
					<div className="flex items-center gap-3 border-t border-border bg-muted/40 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium">WhatsApp</p>
							<p className="text-sm text-muted-foreground">
								{trialPending
									? 'Al conectarlo empieza tu prueba.'
									: 'Que reserven solos por chat.'}
							</p>
						</div>

						<Button asChild size="sm" variant="outline">
							<Link
								href={ROUTES.settingsWhatsapp}
								onClick={() => setDrawerOpen(false)}
							>
								Conectar
							</Link>
						</Button>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
};

export default SetupDrawer;
