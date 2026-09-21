import { CalendarCheck, Tag, Users, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { OnboardingStep } from '@/services/onboarding/onboarding.service';
import { TOUR, type TourAnchor } from './anchors';
import type { StepRequirement } from './requirement';

/** Las tres lecciones son los tres pasos que no se resuelven en el onboarding. */
export type LessonId = Extract<
	OnboardingStep,
	'SERVICES' | 'STAFF' | 'FIRST_APPOINTMENT'
>;

export interface TourStep {
	/**
	 * Qué se ilumina. Sin anclaje —o con uno que no está en la pantalla— el
	 * cartel se planta en el medio y el paso sigue leyéndose.
	 */
	anchor?: TourAnchor;
	title: string;
	body: string;
	/**
	 * El anclaje cuya **aparición** da el paso por terminado.
	 *
	 * Es lo que hace que el tutorial siga al usuario en vez de mandarlo: el paso
	 * "entrá a Servicios" se cierra cuando aparece el botón de la pantalla de
	 * servicios, sin importar si llegó por el menú, por el teclado o volviendo
	 * atrás. Sin esto, el paso lo cierra el usuario con "Siguiente".
	 *
	 * Aparición y no presencia: tiene que haber faltado antes. Si valiera la
	 * presencia a secas, el paso "creá la reserva" se daría por hecho apenas
	 * empieza en una agenda que ya tiene citas de otro día.
	 */
	waitFor?: TourAnchor;
	/**
	 * El anclaje que, si **ya** está en pantalla al empezar el paso, lo saltea.
	 *
	 * Es para los pasos que enseñan a llegar a algún lado: a quien ya está parado
	 * en Servicios no se le explica cómo entrar a Servicios. Va aparte de
	 * `waitFor` porque no todos los pasos se vuelven innecesarios por estar donde
	 * hay que estar.
	 */
	skipIf?: TourAnchor;
	/**
	 * Lo que tiene que estar cargado para que "Siguiente" se encienda.
	 *
	 * Sólo lo llevan los pasos de completar. Sin esto, el paso de un formulario se
	 * pasaba de largo con el campo vacío y el tutorial terminaba con un botón de
	 * guardar apagado que nadie explicaba.
	 */
	requires?: StepRequirement;
}

export interface Lesson {
	id: LessonId;
	title: string;
	/** Qué se lleva el negocio de hacerla. Una línea, no dos. */
	description: string;
	/**
	 * El icono de la tarjeta.
	 *
	 * Tienen que servirle igual a una barbería, a un consultorio, a una clínica
	 * estética y a un spa: por eso una etiqueta de precio y no una tijera. Un
	 * icono que describe bien a un rubro le está diciendo a los otros cuatro que
	 * el producto no es para ellos.
	 */
	icon: LucideIcon;
	/** A dónde lleva el enlace directo cuando el tutorial guiado no corre. */
	href: string;
	steps: TourStep[];
}

/**
 * El guion de las tres lecciones.
 *
 * Ninguna termina con un paso que diga "listo": la lección se da por hecha
 * cuando el backend dice que el dato existe —hay un servicio, hay un profesional
 * que atiende, hay una cita finalizada—. Es la misma decisión que en el resto del
 * onboarding: lo que se mide es lo que quedó en la base, no por dónde pasó el
 * usuario. Así la lección también se cierra sola si la resolvió por su cuenta,
 * con el tutorial abierto o sin él.
 *
 * Los textos son cortos a propósito. Un cartel que tapa media pantalla para
 * explicar un botón se saltea sin leer, y lo que hace entender el paso es el
 * hueco iluminado, no el párrafo: el texto sólo tiene que decir qué tocar y por
 * qué importa, en ese orden y en un renglón o dos.
 */
export const LESSONS: readonly Lesson[] = [
	{
		id: 'SERVICES',
		title: 'Tu primer servicio',
		description: 'Qué ofrecés, cuánto dura y cuánto sale.',
		icon: Tag,
		href: ROUTES.services,
		steps: [
			{
				anchor: TOUR.navServices,
				waitFor: TOUR.servicesNew,
				skipIf: TOUR.servicesNew,
				title: 'Entrá a Servicios',
				body: 'Es el catálogo: de acá sale lo que el cliente elige al reservar.',
			},
			{
				anchor: TOUR.servicesNew,
				waitFor: TOUR.serviceSave,
				skipIf: TOUR.serviceSave,
				title: 'Creá uno nuevo',
				body: 'Uno por cada cosa que cobrás aparte.',
			},
			{
				anchor: TOUR.serviceName,
				requires: { anchor: TOUR.serviceName, kind: 'filled' },
				title: 'Ponele nombre',
				body: 'Con ese nombre lo elige tu cliente.',
			},
			{
				anchor: TOUR.serviceSections,
				waitFor: TOUR.servicePricing,
				skipIf: TOUR.servicePricing,
				title: 'Pasá a "Duración y precio"',
				body: 'Está en la columna de la izquierda.',
			},
			{
				anchor: TOUR.servicePricing,
				// El editor ya sabe si lo cargado alcanza: es lo que enciende su botón.
				requires: { anchor: TOUR.serviceSave, kind: 'enabled' },
				title: 'Cuánto dura y cuánto sale',
				body: 'La duración es el espacio que la cita ocupa en la agenda: poné la real.',
			},
			{
				anchor: TOUR.serviceSave,
				title: 'Creá el servicio',
				body: 'Queda listo para usar en una cita y en tu página de reservas.',
			},
		],
	},
	{
		id: 'STAFF',
		title: 'Quién atiende',
		description: 'Tu equipo y los servicios de cada uno.',
		icon: Users,
		href: ROUTES.team,
		steps: [
			{
				anchor: TOUR.navTeam,
				waitFor: TOUR.teamNew,
				skipIf: TOUR.teamNew,
				title: 'Entrá al equipo',
				body: 'Si trabajás solo, el primero sos vos.',
			},
			{
				anchor: TOUR.teamNew,
				waitFor: TOUR.teamSave,
				skipIf: TOUR.teamSave,
				title: 'Añadí al primero',
				body: 'Con el nombre alcanza para empezar.',
			},
			{
				anchor: TOUR.teamProfile,
				requires: { anchor: TOUR.teamSave, kind: 'enabled' },
				title: 'Completá el perfil',
				body: 'El nombre lo ve tu cliente al elegir con quién atenderse.',
			},
			{
				anchor: TOUR.teamSections,
				waitFor: TOUR.teamServices,
				skipIf: TOUR.teamServices,
				title: 'Pasá a "Servicios"',
				body: 'Está en la columna de la izquierda.',
			},
			{
				anchor: TOUR.teamServices,
				requires: { anchor: TOUR.teamServices, kind: 'filled' },
				title: 'Marcá qué hace',
				body: 'Sin ninguno marcado no aparece en la reserva. Es el paso que más se olvida.',
			},
			{
				anchor: TOUR.teamSave,
				title: 'Guardalo',
				body: 'Ya hay a quién reservarle.',
			},
		],
	},
	{
		id: 'FIRST_APPOINTMENT',
		title: 'Tu primera cita',
		description: 'De la reserva al cobro.',
		icon: CalendarCheck,
		href: ROUTES.agenda,
		steps: [
			{
				anchor: TOUR.navAgenda,
				waitFor: TOUR.agendaNew,
				skipIf: TOUR.agendaNew,
				title: 'Andá a la agenda',
				body: 'Es tu pantalla del día a día.',
			},
			{
				anchor: TOUR.agendaNew,
				waitFor: TOUR.bookingForm,
				skipIf: TOUR.bookingForm,
				title: 'Agregá una cita',
				body: 'También se carga tocando el horario en el calendario.',
			},
			{
				anchor: TOUR.bookingClient,
				waitFor: TOUR.bookingClientChosen,
				skipIf: TOUR.bookingClientChosen,
				title: 'Elegí al cliente',
				body: 'Te dejamos uno de prueba para que armes esta cita sin usar a nadie real.',
			},
			{
				/*
				 * Armar y guardar son un solo paso y no dos.
				 *
				 * Separados, el de armar necesitaba un "Siguiente" —no hay nada que el
				 * tutorial pueda detectar mientras se completa un formulario—, y quien
				 * guardaba directo, que es lo natural, dejaba ese paso sin forma de
				 * cerrarse: el cajón ya no estaba y el botón quedaba apagado para
				 * siempre. Juntos no hace falta ningún botón, porque el que gobierna el
				 * paso es "Guardar", que el propio formulario mantiene apagado hasta
				 * que la reserva esté completa.
				 */
				anchor: TOUR.bookingForm,
				waitFor: TOUR.appointmentCard,
				/*
				 * La red del paso. La tarjeta aparece en el calendario sólo si la cita
				 * quedó en el día que se está viendo, y la fecha se puede cambiar dentro
				 * del cajón: guardada para otro día, no hay tarjeta que esperar. Que el
				 * cajón ya no esté sí prueba que se guardó.
				 */
				requires: { anchor: TOUR.bookingForm, kind: 'absent' },
				title: 'Armá la cita y guardala',
				body: 'Elegí qué se le hace y a qué hora. Al guardar aparece en el calendario.',
			},
			{
				anchor: TOUR.appointmentCard,
				waitFor: TOUR.appointmentMenu,
				title: 'Abrí el menú de la cita',
				body: 'Clic derecho sobre ella en el calendario.',
			},
			{
				/*
				 * El menú se dibuja en un portal, fuera de la tarjeta. Con el paso
				 * anclado a la tarjeta, lo que había que tocar quedaba del lado velado:
				 * el hueco tiene que mudarse al menú.
				 */
				anchor: TOUR.appointmentFinish,
				title: 'Marcala como atendida',
				body: 'Es lo que la cuenta como hecha y cobrada: de ahí salen el balance y las comisiones.',
			},
		],
	},
];

export const lessonById = (id: LessonId): Lesson | undefined =>
	LESSONS.find((lesson) => lesson.id === id);
