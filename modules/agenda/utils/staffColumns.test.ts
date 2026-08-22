import { describe, expect, it } from 'vitest';
import type { Appointment } from '@/types/appointments.types';
import {
	buildStaffColumns,
	segmentBlocksOf,
	UNASSIGNED_COLUMN,
} from './calendarBlocks';
import { DAY_MINUTES } from './calendarLayout';

const LA_PAZ = 'America/La_Paz';

/** Horario del negocio del día: 09:00 a 19:00. */
const BUSINESS = [{ startMinute: 540, endMinute: 1140 }];

const segment = (overrides: {
	staffId?: string | null;
	staffName?: string | null;
	serviceName?: string | null;
	start: string;
	end: string;
}) => ({
	staffId: overrides.staffId === undefined ? 'diego' : overrides.staffId,
	staffName: overrides.staffName === undefined ? 'Diego' : overrides.staffName,
	serviceId: 'corte',
	serviceName:
		overrides.serviceName === undefined ? 'Corte' : overrides.serviceName,
	startTime: overrides.start,
	endTime: overrides.end,
	price: 50,
	durationMinutes: 30,
});

const appointment = (overrides: Partial<Appointment> = {}): Appointment =>
	({
		id: 'appt-1',
		clientName: 'Ana',
		timeLabel: '09:00',
		sortKey: 0,
		service: 'Corte',
		staff: 'Diego',
		status: 'confirmed',
		duration: 30,
		startTime: '2026-08-22T13:00:00.000Z',
		endTime: '2026-08-22T13:30:00.000Z',
		timezone: LA_PAZ,
		segments: [
			segment({
				start: '2026-08-22T13:00:00.000Z',
				end: '2026-08-22T13:30:00.000Z',
			}),
		],
		reminder: null,
		...overrides,
	}) as Appointment;

describe('segmentBlocksOf', () => {
	it('un servicio es un tramo, con su profesional', () => {
		const blocks = segmentBlocksOf(appointment(), LA_PAZ);

		expect(blocks).toHaveLength(1);
		expect(blocks[0]).toMatchObject({
			key: 'appt-1:0',
			staffId: 'diego',
			detail: 'Corte',
			startMinute: 540,
			endMinute: 570,
		});
	});

	it('dos servicios con dos profesionales son dos tramos con su propio horario', () => {
		// Es lo que hace que la vista diaria diga la verdad: Diego está ocupado la
		// primera media hora y Carlos la segunda, no los dos toda la hora.
		const blocks = segmentBlocksOf(
			appointment({
				endTime: '2026-08-22T14:00:00.000Z',
				staff: 'Varios',
				segments: [
					segment({
						start: '2026-08-22T13:00:00.000Z',
						end: '2026-08-22T13:30:00.000Z',
					}),
					segment({
						staffId: 'carlos',
						staffName: 'Carlos',
						serviceName: 'Barba',
						start: '2026-08-22T13:30:00.000Z',
						end: '2026-08-22T14:00:00.000Z',
					}),
				],
			}),
			LA_PAZ,
		);

		expect(blocks.map((block) => block.staffId)).toEqual(['diego', 'carlos']);
		expect(blocks[0]).toMatchObject({ startMinute: 540, endMinute: 570 });
		expect(blocks[1]).toMatchObject({ startMinute: 570, endMinute: 600 });
		expect(blocks[1].detail).toBe('Barba');
	});

	it('una cita sin tramos sigue apareciendo, sin profesional', () => {
		// Dato viejo: es preferible verla en "Sin asignar" a que desaparezca.
		const blocks = segmentBlocksOf(appointment({ segments: [] }), LA_PAZ);

		expect(blocks).toHaveLength(1);
		expect(blocks[0]).toMatchObject({
			key: 'appt-1',
			staffId: null,
			startMinute: 540,
		});
	});

	it('recorta a medianoche el tramo que cruza al día siguiente', () => {
		const blocks = segmentBlocksOf(
			appointment({
				segments: [
					segment({
						start: '2026-08-23T03:30:00.000Z',
						end: '2026-08-23T04:30:00.000Z',
					}),
				],
			}),
			LA_PAZ,
		);

		expect(blocks[0].endMinute).toBe(DAY_MINUTES);
	});
});

describe('buildStaffColumns', () => {
	const working = [
		{ id: 'diego', name: 'Diego', ranges: [{ from: '09:00', to: '19:00' }] },
		{
			id: 'carlos',
			name: 'Carlos',
			ranges: [
				{ from: '09:00', to: '13:00' },
				{ from: '15:00', to: '19:00' },
			],
		},
	];

	it('una columna por profesional de turno, en su orden', () => {
		const columns = buildStaffColumns({
			appointments: [],
			workingStaff: working,
			businessRanges: BUSINESS,
			timezone: LA_PAZ,
		});

		expect(columns.map((column) => column.name)).toEqual(['Diego', 'Carlos']);
		expect(columns[0].openRanges).toEqual([
			{ startMinute: 540, endMinute: 1140 },
		]);
	});

	it('la columna se sombrea con la jornada propia, no con la del negocio', () => {
		// Carlos corta al mediodía: su columna tiene que mostrar esa pausa aunque el
		// negocio siga abierto.
		const columns = buildStaffColumns({
			appointments: [],
			workingStaff: working,
			businessRanges: BUSINESS,
			timezone: LA_PAZ,
		});

		expect(columns[1].openRanges).toEqual([
			{ startMinute: 540, endMinute: 780 },
			{ startMinute: 900, endMinute: 1140 },
		]);
	});

	it('cada tramo cae en la columna de su profesional', () => {
		const columns = buildStaffColumns({
			appointments: [
				appointment({
					id: 'compartida',
					endTime: '2026-08-22T14:00:00.000Z',
					staff: 'Varios',
					segments: [
						segment({
							start: '2026-08-22T13:00:00.000Z',
							end: '2026-08-22T13:30:00.000Z',
						}),
						segment({
							staffId: 'carlos',
							staffName: 'Carlos',
							serviceName: 'Barba',
							start: '2026-08-22T13:30:00.000Z',
							end: '2026-08-22T14:00:00.000Z',
						}),
					],
				}),
			],
			workingStaff: working,
			businessRanges: BUSINESS,
			timezone: LA_PAZ,
		});

		expect(columns[0].blocks.map((block) => block.key)).toEqual([
			'compartida:0',
		]);
		expect(columns[1].blocks.map((block) => block.key)).toEqual([
			'compartida:1',
		]);
	});

	it('sin citas, las columnas quedan vacías pero existen', () => {
		// La grilla también representa disponibilidad: un día sin citas sigue siendo
		// un día con profesionales de turno.
		const columns = buildStaffColumns({
			appointments: [],
			workingStaff: working,
			businessRanges: BUSINESS,
			timezone: LA_PAZ,
		});

		expect(columns).toHaveLength(2);
		expect(columns.every((column) => column.blocks.length === 0)).toBe(true);
	});

	it('agrega al profesional que tiene citas sin estar de turno', () => {
		// Pasa cuando alguien cambia su jornada después de que ya le reservaron:
		// esconderlo haría desaparecer una cita real del día.
		const columns = buildStaffColumns({
			appointments: [
				appointment({
					id: 'fuera',
					staff: 'Varios',
					segments: [
						segment({
							staffId: 'juan',
							staffName: 'Juan',
							start: '2026-08-22T13:00:00.000Z',
							end: '2026-08-22T13:30:00.000Z',
						}),
					],
				}),
			],
			workingStaff: working,
			businessRanges: BUSINESS,
			timezone: LA_PAZ,
		});

		const juan = columns.find((column) => column.staffId === 'juan');
		expect(columns).toHaveLength(3);
		// Va detrás de los de turno y su columna se dibuja cerrada: la cita está
		// fuera de su horario, y eso es justamente lo que hay que ver.
		expect(columns[2]).toBe(juan);
		expect(juan?.offDuty).toBe(true);
		expect(juan?.openRanges).toEqual([]);
		expect(juan?.blocks).toHaveLength(1);
	});

	it('no repite la columna del que tiene dos citas fuera de turno', () => {
		const columns = buildStaffColumns({
			appointments: [
				appointment({
					id: 'una',
					segments: [
						segment({
							staffId: 'juan',
							staffName: 'Juan',
							start: '2026-08-22T13:00:00.000Z',
							end: '2026-08-22T13:30:00.000Z',
						}),
					],
				}),
				appointment({
					id: 'otra',
					segments: [
						segment({
							staffId: 'juan',
							staffName: 'Juan',
							start: '2026-08-22T15:00:00.000Z',
							end: '2026-08-22T15:30:00.000Z',
						}),
					],
				}),
			],
			workingStaff: [],
			businessRanges: BUSINESS,
			timezone: LA_PAZ,
		});

		expect(columns).toHaveLength(1);
		expect(columns[0].name).toBe('Juan');
		expect(columns[0].blocks).toHaveLength(2);
	});

	it('"Sin asignar" aparece solo si hay tramos sin profesional', () => {
		const withoutStaff = buildStaffColumns({
			appointments: [appointment({ segments: [] })],
			workingStaff: working,
			businessRanges: BUSINESS,
			timezone: LA_PAZ,
		});

		const withStaff = buildStaffColumns({
			appointments: [appointment()],
			workingStaff: working,
			businessRanges: BUSINESS,
			timezone: LA_PAZ,
		});

		expect(withoutStaff.at(-1)).toMatchObject({
			key: UNASSIGNED_COLUMN,
			name: 'Sin asignar',
			openRanges: BUSINESS,
		});
		expect(
			withStaff.some((column) => column.key === UNASSIGNED_COLUMN),
		).toBe(false);
	});

	it('un día sin nadie deja una columna con el horario del negocio', () => {
		// Un domingo cerrado tiene que verse como un día cerrado, no como una
		// pantalla en blanco.
		const columns = buildStaffColumns({
			appointments: [],
			workingStaff: [],
			businessRanges: [],
			timezone: LA_PAZ,
		});

		expect(columns).toHaveLength(1);
		expect(columns[0]).toMatchObject({
			name: 'Sin profesionales',
			openRanges: [],
			blocks: [],
		});
	});
});
