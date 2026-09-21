'use client';

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import type { Lesson } from './lessons';

/**
 * Si al paso actual se llegó avanzando o volviendo.
 *
 * No es cosmético: los pasos que enseñan a llegar a algún lado se saltean cuando
 * ya se está ahí, y esa regla sólo vale yendo hacia adelante. Aplicada al
 * volver, deshacía el "Atrás" en el mismo cuadro —el paso se saltaba a sí mismo
 * de vuelta al que se venía— y no había forma de releer un paso anterior.
 */
export type TourDirection = 'forward' | 'back';

interface TourState {
	/** La lección en curso, o `null` si no hay tutorial andando. */
	lesson: Lesson | null;
	stepIndex: number;
	direction: TourDirection;
	/** El cajón de "Empezar", que es de donde salen las lecciones. */
	drawerOpen: boolean;
	setDrawerOpen: (open: boolean) => void;
	start: (lesson: Lesson) => void;
	stop: () => void;
	/** Al siguiente paso. En el último no hace nada: ahí termina el estado real. */
	next: () => void;
	back: () => void;
}

const TourContext = createContext<TourState | null>(null);

/**
 * El estado del tutorial, montado en el layout raíz.
 *
 * Tiene que vivir ahí y no en el marco del panel por una razón concreta: el
 * tutorial cruza pantallas —del menú a Servicios, de Servicios al editor— y en
 * el App Router cada sección tiene su propio layout, que se desmonta al salir de
 * ella. Colgado del marco, la lección se cortaría sola en el primer paso.
 */
export const TourProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [lesson, setLesson] = useState<Lesson | null>(null);
	const [stepIndex, setStepIndex] = useState(0);
	const [direction, setDirection] = useState<TourDirection>('forward');
	const [drawerOpen, setDrawerOpen] = useState(false);

	const start = useCallback((next: Lesson) => {
		// El cajón se va: lo que sigue pasa en la pantalla que él estaba tapando.
		setDrawerOpen(false);
		setLesson(next);
		setStepIndex(0);
		setDirection('forward');
	}, []);

	const stop = useCallback(() => setLesson(null), []);

	const next = useCallback(() => {
		setDirection('forward');
		setStepIndex((current) =>
			lesson && current < lesson.steps.length - 1 ? current + 1 : current,
		);
	}, [lesson]);

	const back = useCallback(() => {
		setDirection('back');
		setStepIndex((current) => (current > 0 ? current - 1 : current));
	}, []);

	const value = useMemo(
		() => ({
			lesson,
			stepIndex,
			direction,
			drawerOpen,
			setDrawerOpen,
			start,
			stop,
			next,
			back,
		}),
		[lesson, stepIndex, direction, drawerOpen, start, stop, next, back],
	);

	return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

/** El tutorial, desde cualquier parte de la aplicación. */
export const useTour = (): TourState => {
	const value = useContext(TourContext);
	if (!value) {
		throw new Error('useTour necesita estar dentro de <TourProvider>.');
	}
	return value;
};
