/**
 * Cuánto alto necesita cada parte de una card, en píxeles.
 *
 * Con la grilla a un píxel por minuto, el alto de una cita **es** su duración:
 * 15 minutos son 22px —el mínimo legible—, media hora son 30 y una hora 60. Así
 * que lo que entra en la card no es una preferencia visual, es una consecuencia
 * de la duración, y estos dos umbrales son las cuentas de qué cabe.
 */

/**
 * Debajo de esto, la hora y el cliente van en la misma línea.
 *
 * Dos líneas de texto de 11px con el padding de la card piden unos 34px. Una
 * cita de media hora mide 30, así que la mayoría de las citas cortas entran en
 * una sola línea: "09:00 Ana". Es lo que se busca al barrer la agenda con la
 * vista, y apilarlo lo cortaría.
 */
export const SINGLE_LINE_HEIGHT = 34;

/** A partir de acá entra una segunda línea con el servicio. */
export const DETAIL_HEIGHT = 46;
