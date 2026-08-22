import { describe, expect, it } from 'vitest';
import {
	blockGeometry,
	buildColumnLayout,
	closedRangesOf,
	dateKeyInTimeZone,
	DAY_MINUTES,
	dayMinutesOf,
	formatMinute,
	HOUR_MARKS,
	isMinuteOpen,
	minutesInTimeZone,
	MIN_BLOCK_HEIGHT,
	PX_PER_MINUTE,
	normalizeOpenRanges,
	nowMinuteInTimeZone,
	openRangesForWeekday,
	shiftDateKey,
	SLOT_MINUTES,
	slotMinuteAt,
	todayKeyInTimeZone,
	weekDaysOf,
	weekdayOf,
} from './calendarLayout';

/** Bolivia: UTC-4 todo el año. Es la zona por defecto de los negocios. */
const LA_PAZ = 'America/La_Paz';
/** Santiago sí cambia de hora: sirve para ver que nada quede fijado. */
const SANTIAGO = 'America/Santiago';

describe('minutesInTimeZone', () => {
	it('ubica el instante en la hora del negocio, no en la del navegador', () => {
		// 13:00 UTC son las 09:00 en Bolivia.
		expect(minutesInTimeZone('2026-08-22T13:00:00.000Z', LA_PAZ)).toBe(9 * 60);
	});

	it('resuelve la medianoche como minuto 0 y no como 1440', () => {
		expect(minutesInTimeZone('2026-08-22T04:00:00.000Z', LA_PAZ)).toBe(0);
	});

	it('devuelve null ante un instante que no es una fecha', () => {
		expect(minutesInTimeZone('', LA_PAZ)).toBeNull();
		expect(minutesInTimeZone('no-es-fecha', LA_PAZ)).toBeNull();
	});

	it('no se apoya en texto formateado', () => {
		// `new Date('mañana a las 9')` devuelve el 1 de septiembre de 2001: el
		// parser inventa una fecha antes que rechazar la cadena. Por eso la agenda
		// se dibuja siempre desde el instante ISO y nunca desde lo ya formateado.
		expect(new Date('mañana a las 9').getTime()).not.toBeNaN();
	});
});

describe('dateKeyInTimeZone', () => {
	it('devuelve el día del negocio y no el de UTC', () => {
		// 02:00 UTC del 23 es todavía el 22 a las 22:00 en Bolivia.
		expect(dateKeyInTimeZone('2026-08-23T02:00:00.000Z', LA_PAZ)).toBe(
			'2026-08-22',
		);
	});

	it('cruza el fin de mes en la zona correcta', () => {
		expect(dateKeyInTimeZone('2026-09-01T03:00:00.000Z', LA_PAZ)).toBe(
			'2026-08-31',
		);
	});
});

describe('todayKeyInTimeZone', () => {
	it('no usa la fecha del navegador', () => {
		const instant = new Date('2026-08-23T02:00:00.000Z');

		expect(todayKeyInTimeZone(LA_PAZ, instant)).toBe('2026-08-22');
		expect(todayKeyInTimeZone('Europe/Madrid', instant)).toBe('2026-08-23');
	});
});

describe('nowMinuteInTimeZone', () => {
	it('da el minuto del día para ubicar la línea de ahora', () => {
		expect(
			nowMinuteInTimeZone(new Date('2026-08-22T20:30:00.000Z'), LA_PAZ),
		).toBe(16 * 60 + 30);
	});
});

describe('formatMinute', () => {
	it('escribe la hora con dos dígitos', () => {
		expect(formatMinute(0)).toBe('00:00');
		expect(formatMinute(9 * 60 + 15)).toBe('09:15');
		expect(formatMinute(23 * 60 + 45)).toBe('23:45');
	});

	it('el final del lienzo se lee como medianoche', () => {
		expect(formatMinute(DAY_MINUTES)).toBe('00:00');
	});
});

describe('shiftDateKey', () => {
	it('avanza y retrocede un día', () => {
		expect(shiftDateKey('2026-08-22', 1)).toBe('2026-08-23');
		expect(shiftDateKey('2026-08-22', -1)).toBe('2026-08-21');
	});

	it('cruza fin de mes, fin de año y año bisiesto', () => {
		expect(shiftDateKey('2026-08-31', 1)).toBe('2026-09-01');
		expect(shiftDateKey('2026-12-31', 1)).toBe('2027-01-01');
		expect(shiftDateKey('2026-01-01', -1)).toBe('2025-12-31');
		expect(shiftDateKey('2028-02-28', 1)).toBe('2028-02-29');
		expect(shiftDateKey('2027-02-28', 1)).toBe('2027-03-01');
	});

	it('una semana entera es un salto de siete días', () => {
		expect(shiftDateKey('2026-08-17', 7)).toBe('2026-08-24');
		expect(shiftDateKey('2026-08-17', -7)).toBe('2026-08-10');
	});
});

describe('weekDaysOf', () => {
	it('devuelve siete días de lunes a domingo', () => {
		// El 22 de agosto de 2026 es sábado.
		expect(weekDaysOf('2026-08-22')).toEqual([
			'2026-08-17',
			'2026-08-18',
			'2026-08-19',
			'2026-08-20',
			'2026-08-21',
			'2026-08-22',
			'2026-08-23',
		]);
	});

	it('el domingo pertenece a la semana que empezó el lunes anterior', () => {
		// El domingo es el último día, no el primero: si `getUTCDay()` se usara sin
		// correr el índice, el 23 abriría su propia semana.
		expect(weekDaysOf('2026-08-23')[0]).toBe('2026-08-17');
		expect(weekDaysOf('2026-08-23')[6]).toBe('2026-08-23');
	});

	it('cualquier día de la semana devuelve la misma semana', () => {
		const week = weekDaysOf('2026-08-17');

		for (const day of week) {
			expect(weekDaysOf(day)).toEqual(week);
		}
	});

	it('funciona en una semana partida entre dos meses', () => {
		expect(weekDaysOf('2026-09-01')).toEqual([
			'2026-08-31',
			'2026-09-01',
			'2026-09-02',
			'2026-09-03',
			'2026-09-04',
			'2026-09-05',
			'2026-09-06',
		]);
	});
});

describe('weekdayOf', () => {
	it('devuelve el día de la semana con domingo en 0', () => {
		expect(weekdayOf('2026-08-17')).toBe(1); // lunes
		expect(weekdayOf('2026-08-22')).toBe(6); // sábado
		expect(weekdayOf('2026-08-23')).toBe(0); // domingo
	});
});

describe('openRangesForWeekday', () => {
	const hours = [
		{ dayOfWeek: 1, startTime: '09:00', endTime: '13:00' },
		{ dayOfWeek: 1, startTime: '15:00', endTime: '19:00' },
		{ dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
	];

	it('toma solo las franjas de ese día', () => {
		expect(openRangesForWeekday(hours, 6)).toEqual([
			{ startMinute: 540, endMinute: 780 },
		]);
	});

	it('conserva el turno partido', () => {
		expect(openRangesForWeekday(hours, 1)).toEqual([
			{ startMinute: 540, endMinute: 780 },
			{ startMinute: 900, endMinute: 1140 },
		]);
	});

	it('un día sin franjas está cerrado', () => {
		expect(openRangesForWeekday(hours, 0)).toEqual([]);
	});

	it('tolera el formato con segundos que devuelve el backend', () => {
		expect(
			openRangesForWeekday(
				[{ dayOfWeek: 3, startTime: '09:00:00', endTime: '19:00:00' }],
				3,
			),
		).toEqual([{ startMinute: 540, endMinute: 1140 }]);
	});

	it('descarta una franja con horas ilegibles', () => {
		expect(
			openRangesForWeekday(
				[{ dayOfWeek: 3, startTime: 'mañana', endTime: '19:00' }],
				3,
			),
		).toEqual([]);
	});
});

describe('dayMinutesOf', () => {
	it('ubica la cita por su inicio y su fin reales', () => {
		expect(
			dayMinutesOf({
				startTime: '2026-08-22T13:00:00.000Z',
				endTime: '2026-08-22T13:45:00.000Z',
				duration: 45,
				timezone: LA_PAZ,
			}),
		).toEqual({ startMinute: 9 * 60, endMinute: 9 * 60 + 45 });
	});

	it('usa la duración cuando no hay fin', () => {
		expect(
			dayMinutesOf({
				startTime: '2026-08-22T13:00:00.000Z',
				duration: 30,
				timezone: LA_PAZ,
			}),
		).toEqual({ startMinute: 540, endMinute: 570 });
	});

	it('cae en media hora cuando tampoco hay duración', () => {
		// Una cita sin duración conocida tiene que verse igual: esconderla sería
		// peor que dibujarla con un alto arbitrario.
		expect(
			dayMinutesOf({
				startTime: '2026-08-22T13:00:00.000Z',
				timezone: LA_PAZ,
			}),
		).toEqual({ startMinute: 540, endMinute: 570 });
	});

	it('recorta a medianoche la cita que cruza al día siguiente', () => {
		// 23:30 a 00:30: sin recorte, el fin quedaría en el minuto 30 y el alto
		// sería negativo.
		const range = dayMinutesOf({
			startTime: '2026-08-23T03:30:00.000Z',
			endTime: '2026-08-23T04:30:00.000Z',
			duration: 60,
			timezone: LA_PAZ,
		});

		expect(range).toEqual({ startMinute: 23 * 60 + 30, endMinute: DAY_MINUTES });
	});

	it('devuelve null si el inicio no es un instante válido', () => {
		expect(dayMinutesOf({ startTime: '', timezone: LA_PAZ })).toBeNull();
	});

	it('respeta el cambio de horario de verano de la zona', () => {
		// Enero es verano en Santiago (UTC-3) y julio invierno (UTC-4): las 12:00
		// UTC caen en horas distintas del día según la fecha.
		const summer = dayMinutesOf({
			startTime: '2026-01-15T12:00:00.000Z',
			duration: 30,
			timezone: SANTIAGO,
		});
		const winter = dayMinutesOf({
			startTime: '2026-07-15T12:00:00.000Z',
			duration: 30,
			timezone: SANTIAGO,
		});

		expect(summer?.startMinute).toBe(9 * 60);
		expect(winter?.startMinute).toBe(8 * 60);
	});
});

describe('buildColumnLayout', () => {
	const block = (startMinute: number, endMinute: number, id = '') => ({
		id,
		startMinute,
		endMinute,
	});

	it('una cita sola ocupa todo el ancho', () => {
		const layout = buildColumnLayout([block(540, 570)]);

		expect(layout).toHaveLength(1);
		expect(layout[0]).toMatchObject({ lane: 0, laneCount: 1 });
	});

	it('dos simultáneas van en carriles distintos', () => {
		const layout = buildColumnLayout([
			block(540, 600, 'a'),
			block(540, 600, 'b'),
		]);

		expect(layout.map((item) => item.lane)).toEqual([0, 1]);
		expect(layout.every((item) => item.laneCount === 2)).toBe(true);
	});

	it('dos consecutivas comparten carril', () => {
		// El fin de una es el inicio de la otra: no se pisan.
		const layout = buildColumnLayout([
			block(540, 570, 'a'),
			block(570, 600, 'b'),
		]);

		expect(layout.map((item) => item.lane)).toEqual([0, 0]);
		expect(layout.map((item) => item.laneCount)).toEqual([1, 1]);
	});

	it('reparte por racimo y no por día entero', () => {
		// Tres a la mañana no tienen que angostar la única de la tarde.
		const layout = buildColumnLayout([
			block(540, 600, 'a'),
			block(540, 600, 'b'),
			block(540, 600, 'c'),
			block(1020, 1080, 'tarde'),
		]);

		const tarde = layout.find((item) => item.block.id === 'tarde');
		expect(tarde).toMatchObject({ lane: 0, laneCount: 1 });
		expect(
			layout.filter((item) => item.block.id !== 'tarde'),
		).toHaveLength(3);
		expect(
			layout
				.filter((item) => item.block.id !== 'tarde')
				.every((item) => item.laneCount === 3),
		).toBe(true);
	});

	it('encadena el racimo aunque los extremos no se toquen', () => {
		// A se pisa con B, y B con C, pero A y C no: siguen siendo un solo racimo,
		// porque si no B tendría que estar en dos anchos distintos a la vez.
		const layout = buildColumnLayout([
			block(540, 600, 'a'),
			block(570, 630, 'b'),
			block(600, 660, 'c'),
		]);

		expect(layout.every((item) => item.laneCount === 2)).toBe(true);
		expect(layout.find((item) => item.block.id === 'c')?.lane).toBe(0);
	});

	it('reutiliza el carril que quedó libre', () => {
		const layout = buildColumnLayout([
			block(540, 600, 'larga'),
			block(540, 570, 'corta'),
			block(570, 600, 'despues'),
		]);

		// "despues" empieza cuando "corta" termina: hereda su carril en lugar de
		// abrir un tercero, así el racimo queda en dos anchos y no en tres.
		expect(layout.every((item) => item.laneCount === 2)).toBe(true);

		const lanes = Object.fromEntries(
			layout.map((item) => [item.block.id, item.lane]),
		);
		expect(lanes.corta).toBe(0);
		expect(lanes.despues).toBe(0);
		expect(lanes.larga).toBe(1);
	});

	it('ordena por inicio aunque lleguen desordenadas', () => {
		const layout = buildColumnLayout([
			block(1020, 1080, 'tarde'),
			block(540, 600, 'mañana'),
		]);

		expect(layout.map((item) => item.block.id)).toEqual(['mañana', 'tarde']);
	});

	it('una lista vacía no produce bloques', () => {
		expect(buildColumnLayout([])).toEqual([]);
	});
});

describe('blockGeometry', () => {
	/*
	 * Las medidas se expresan contra `PX_PER_MINUTE` y no como números sueltos:
	 * cambiar el zoom del calendario es un ajuste razonable, y no tiene por qué
	 * romper seis tests que solo querían decir "el top es el minuto de inicio".
	 */
	it('el top es el minuto de inicio', () => {
		expect(blockGeometry({ startMinute: 540, endMinute: 570 }).top).toBe(
			540 * PX_PER_MINUTE,
		);
	});

	it('el alto es la duración', () => {
		expect(blockGeometry({ startMinute: 540, endMinute: 600 }).height).toBe(
			60 * PX_PER_MINUTE,
		);
	});

	it('garantiza un alto mínimo para las citas cortas', () => {
		// Un bloque de un minuto mediría un píxel y no entraría ni la hora.
		expect(blockGeometry({ startMinute: 540, endMinute: 541 }).height).toBe(
			MIN_BLOCK_HEIGHT,
		);

		// La celda de la grilla nunca queda por debajo del mínimo legible, sea cual
		// sea el zoom.
		expect(
			blockGeometry({ startMinute: 540, endMinute: 540 + SLOT_MINUTES }).height,
		).toBeGreaterThanOrEqual(MIN_BLOCK_HEIGHT);
	});
});

describe('normalizeOpenRanges', () => {
	it('fusiona dos franjas contiguas', () => {
		// Dibujarlas por separado pintaría un cierre a las 13:00 donde el negocio
		// no cierra.
		expect(
			normalizeOpenRanges([
				{ startMinute: 540, endMinute: 780 },
				{ startMinute: 780, endMinute: 1140 },
			]),
		).toEqual([{ startMinute: 540, endMinute: 1140 }]);
	});

	it('fusiona las que se solapan y ordena las que llegan al revés', () => {
		expect(
			normalizeOpenRanges([
				{ startMinute: 900, endMinute: 1140 },
				{ startMinute: 540, endMinute: 960 },
			]),
		).toEqual([{ startMinute: 540, endMinute: 1140 }]);
	});

	it('descarta las vacías o invertidas', () => {
		expect(
			normalizeOpenRanges([
				{ startMinute: 600, endMinute: 600 },
				{ startMinute: 700, endMinute: 600 },
			]),
		).toEqual([]);
	});

	it('recorta lo que se sale del día', () => {
		expect(
			normalizeOpenRanges([{ startMinute: -60, endMinute: DAY_MINUTES + 120 }]),
		).toEqual([{ startMinute: 0, endMinute: DAY_MINUTES }]);
	});
});

describe('closedRangesOf', () => {
	it('un día cerrado se dibuja cerrado entero', () => {
		// Un domingo sin horario tiene que verse cerrado, no vacío.
		expect(closedRangesOf([])).toEqual([
			{ startMinute: 0, endMinute: DAY_MINUTES },
		]);
	});

	it('deja cerrado antes de abrir y después de cerrar', () => {
		expect(closedRangesOf([{ startMinute: 540, endMinute: 1140 }])).toEqual([
			{ startMinute: 0, endMinute: 540 },
			{ startMinute: 1140, endMinute: DAY_MINUTES },
		]);
	});

	it('marca la pausa del mediodía en un turno partido', () => {
		expect(
			closedRangesOf([
				{ startMinute: 540, endMinute: 780 },
				{ startMinute: 900, endMinute: 1140 },
			]),
		).toEqual([
			{ startMinute: 0, endMinute: 540 },
			{ startMinute: 780, endMinute: 900 },
			{ startMinute: 1140, endMinute: DAY_MINUTES },
		]);
	});

	it('un día abierto de punta a punta no tiene bloques cerrados', () => {
		expect(
			closedRangesOf([{ startMinute: 0, endMinute: DAY_MINUTES }]),
		).toEqual([]);
	});

	it('los bloques cerrados y los abiertos cubren el día completo', () => {
		const open = [{ startMinute: 540, endMinute: 1140 }];
		const total = [...open, ...closedRangesOf(open)].reduce(
			(sum, range) => sum + (range.endMinute - range.startMinute),
			0,
		);

		expect(total).toBe(DAY_MINUTES);
	});
});

describe('isMinuteOpen', () => {
	const open = [{ startMinute: 540, endMinute: 1140 }];

	it('el minuto de apertura está abierto', () => {
		expect(isMinuteOpen(540, open)).toBe(true);
	});

	it('el minuto de cierre ya está cerrado', () => {
		// A las 19:00 el negocio cerró: ofrecer ese hueco sería ofrecer una cita
		// que empieza cuando se apagan las luces.
		expect(isMinuteOpen(1140, open)).toBe(false);
	});

	it('lo de antes de abrir está cerrado', () => {
		expect(isMinuteOpen(0, open)).toBe(false);
		expect(isMinuteOpen(539, open)).toBe(false);
	});

	it('sin horario nada está abierto', () => {
		expect(isMinuteOpen(600, [])).toBe(false);
	});
});

describe('slotMinuteAt', () => {
	/** El argumento es una posición vertical, así que se mide en píxeles. */
	const atMinute = (minute: number) => minute * PX_PER_MINUTE;

	it('redondea hacia abajo a la celda de 15 minutos', () => {
		expect(slotMinuteAt(atMinute(540))).toBe(540);
		expect(slotMinuteAt(atMinute(552))).toBe(540);
		expect(slotMinuteAt(atMinute(555))).toBe(555);
	});

	it('el primer píxel es medianoche', () => {
		expect(slotMinuteAt(0)).toBe(0);
	});

	it('el último tramo del día es 23:45', () => {
		expect(slotMinuteAt(atMinute(DAY_MINUTES) - 1)).toBe(23 * 60 + 45);
	});

	it('fuera del lienzo no hay hora', () => {
		expect(slotMinuteAt(-1)).toBeNull();
		expect(slotMinuteAt(atMinute(DAY_MINUTES))).toBeNull();
	});
});

describe('HOUR_MARKS', () => {
	it('son las 24 horas en punto', () => {
		expect(HOUR_MARKS).toHaveLength(24);
		expect(HOUR_MARKS[0]).toBe(0);
		expect(HOUR_MARKS[23]).toBe(23 * 60);
	});
});
