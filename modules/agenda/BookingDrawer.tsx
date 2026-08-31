"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import useGetAppointmentDetail from "@/services/appointments/useGetAppointmentDetail";
import useEditBooking from "@/services/appointments/useEditBooking";
import useCreateBooking from "@/services/appointments/useCreateBooking";
import useGetSettings from "@/services/settings/useGetSettings";
import type { BookingWarning } from "@/services/appointments/appointments.service";
import useGetServices from "@/services/services/useGetServices";
import useGetStaff from "@/services/staff/useGetStaff";
import useGetSlotsForBooking from "@/services/availability/useGetSlotsForBooking";
import { cn } from "@/lib/utils";
import BookingClientField from "./BookingClientField";
import BookingDateTimeField from "./BookingDateTimeField";
import BookingNotices from "./BookingNotices";
import BookingServicesField from "./BookingServicesField";
import BookingSummary from "./BookingSummary";
import BookingTimeStep from "./BookingTimeStep";
import useBookingDraft from "./useBookingDraft";
import { describeReminder } from "./utils/reminderStatus";
import { formatMinute, minutesInTimeZone } from "./utils/calendarLayout";

/**
 * Lo que el click en la agenda ya dijo, cuando la reserva nace de un hueco.
 *
 * No es una reserva a medio hacer: es el punto de partida. El día siempre; la
 * hora y el profesional cuando el click salió de una celda concreta.
 */
export interface BookingSeed {
  date: string;
  minute: number | null;
  staffId: string | null;
}

interface Props {
  /** Reserva a editar. `null` con `seed` presente abre el modo creación. */
  appointmentId: string | null;
  /** Presente abre el drawer para crear. */
  seed?: BookingSeed | null;
  /** Hoy en la zona del negocio. */
  todayKey: string;
  onClose: () => void;
  /**
   * Se llama con lo que el backend advirtió al crear.
   *
   * Las advertencias llegan con la reserva ya creada —el panel permite registrar
   * excepciones— así que se muestran afuera, donde queda la agenda, y no en un
   * panel que se está cerrando.
   */
  onSaved?: (warnings: BookingWarning[]) => void;
}

interface EditorProps {
  appointmentId: string | null;
  seed?: BookingSeed | null;
  todayKey: string;
  onClose: () => void;
  onSaved?: (warnings: BookingWarning[]) => void;
}

/** La hora de un instante, en la zona del negocio. */
const timeIn = (iso: string, timezone?: string): string => {
  const minute = minutesInTimeZone(iso, timezone);
  return minute === null ? "--:--" : formatMinute(minute);
};

/**
 * La reserva completa, en un panel lateral, editable.
 *
 * Este componente orquesta: sostiene la vista abierta, el guardado y los avisos.
 * Las cuentas del borrador viven en `useBookingDraft` y cada campo en su propio
 * componente, porque lo que sigue —crear una reserva desde acá— es el mismo
 * formulario con otro punto de partida, y un archivo que mezcle las dos cosas se
 * vuelve imposible de leer.
 *
 * Editar es editar: se guarda sobre la misma reserva, con su mismo id e
 * historial.
 */
const BookingEditor: React.FC<EditorProps> = ({
  appointmentId,
  seed,
  todayKey,
  onClose,
  onSaved,
}) => {
  const isCreating = appointmentId === null;

  const [view, setView] = useState<"detail" | "time">("detail");
  /** Día que se está mirando en el paso de horarios. */
  const [pickerDate, setPickerDate] = useState<string | null>(
    seed?.date ?? null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: booking, isLoading } = useGetAppointmentDetail(appointmentId);
  const { data: services = [] } = useGetServices();
  const { data: staff = [] } = useGetStaff();
  const { data: settings } = useGetSettings();
  const { mutateAsync: save, isPending: isSaving } = useEditBooking();
  const { mutateAsync: create, isPending: isCreatingBooking } =
    useCreateBooking();

  // Creando no hay reserva de la que sacar la zona: la trae la configuración.
  const timezone = booking?.timezone ?? settings?.timezone;
  // Sin configuración todavía, el código ISO es el del negocio por defecto.
  const currency = settings?.currency ?? "BOB";
  const dialCode = settings?.dialCode;
  const reminder = describeReminder(booking?.reminder ?? null);
  const segments = booking?.segments ?? [];

  const draft = useBookingDraft({ booking, services, timezone });
  const busy = isSaving || isCreatingBooking;

  /*
   * Con los servicios cambiados hay que revisar que la hora siga en pie: media
   * hora más de trabajo puede no entrar antes del cierre o pisar la cita
   * siguiente. Se pregunta al motor por el día que se está mirando.
   *
   * Creando se pregunta siempre: la hora se elige de esa misma lista, así que es
   * la que además preselecciona el hueco que se clickeó en la agenda.
   */
  const slotsDate = draft.dayKey ?? seed?.date ?? todayKey;

  const { startTimes } = useGetSlotsForBooking({
    date: slotsDate,
    items: draft.slotItems,
    excludeAppointmentId: appointmentId ?? undefined,
    scope: "panel",
    enabled:
      draft.slotItems.length > 0 &&
      (isCreating || (draft.servicesChanged && draft.canEdit)),
  });

  /*
   * El hueco que se clickeó en la agenda, si el motor lo ofrece.
   *
   * Se aplica cuando aparecen los horarios —o sea, recién cuando hay un
   * servicio elegido— y una sola vez: después manda lo que la persona elija.
   */
  const seedApplied = useRef(false);

  useEffect(() => {
    if (!isCreating || seedApplied.current) return;
    if (seed?.minute === null || seed?.minute === undefined) return;
    if (startTimes.length === 0) return;

    const match = startTimes.find(
      (startTime) => minutesInTimeZone(startTime, timezone) === seed.minute,
    );
    if (!match) return;

    seedApplied.current = true;
    draft.setStartTime(match);
  }, [isCreating, seed?.minute, startTimes, timezone, draft]);

  const timeStillFits =
    isCreating ||
    !draft.servicesChanged ||
    (draft.startTime !== null && startTimes.includes(draft.startTime));

  /** Creando hace falta todo; editando, que haya algo que guardar. */
  const isComplete = isCreating
    ? // Un id y no un nombre: sin cliente elegido no hay reserva que crear.
      draft.client.id !== null &&
      draft.items.length > 0 &&
      draft.startTime !== null
    : draft.hasChanges;

  /*
   * `timeStillFits` no entra acá a propósito.
   *
   * Que el motor ya no ofrezca ese horario con los servicios nuevos no lo hace
   * imposible: el panel puede registrar excepciones —fuera de horario, fuera de
   * jornada, pisado— y el backend las devuelve como advertencias. Bloquear el
   * botón obligaba a mover a un cliente que ya estaba sentado en la silla.
   */
  const canSave =
    !busy && isComplete && draft.summary.unknownServiceIds.length === 0;

  const handleSave = async () => {
    if (!draft.startTime || !canSave) return;

    setSaveError(null);

    try {
      if (isCreating) {
        /*
         * El cliente ya está elegido: o se buscó entre los que existen o se dio
         * de alta con su teléfono desde el mismo panel. Antes se creaba acá, a
         * partir del nombre escrito, y ése era el último camino del sistema que
         * producía clientes sin teléfono —o sea, imposibles de reconocer cuando
         * esa persona reservara por otro canal—.
         */
        const created = await create({
          clientId: draft.client.id as string,
          startTime: draft.startTime,
          items: draft.items,
        });

        onSaved?.(created.warnings);
      } else {
        const edited = await save({
          id: appointmentId as string,
          payload: { startTime: draft.startTime, items: draft.items },
        });

        onSaved?.(edited.warnings);
      }

      onClose();
    } catch (error) {
      // El 409 trae el motivo real —ocupado, cerrado, recién tomado— y es lo
      // que hay que decir en lugar de un "no se pudo".
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "object"
          ? ((error.response?.data as { message?: string }).message ?? null)
          : null;

      setSaveError(message ?? "No se pudo guardar. Intentá de nuevo.");
    }
  };

  return (
    <>
      <DrawerHeader className="border-b border-border">
        {view === "time" ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Volver a la reserva"
              onClick={() => setView("detail")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <DrawerDescription className="font-mono text-[10px] tracking-widest uppercase">
                Reserva · Hora
              </DrawerDescription>
              <DrawerTitle className="text-lg">Seleccioná una hora</DrawerTitle>
            </div>
          </div>
        ) : (
          <>
            <DrawerDescription className="font-mono text-[10px] tracking-widest uppercase">
              Reserva
            </DrawerDescription>
            <DrawerTitle className="text-lg">
              {isCreating ? "Nueva reserva" : "Editar reserva"}
            </DrawerTitle>
          </>
        )}
      </DrawerHeader>

      {!isCreating && (isLoading || !booking) ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : view === "time" ? (
        <div className="flex-1 overflow-y-auto p-4">
          <BookingTimeStep
            date={pickerDate ?? draft.dayKey ?? todayKey}
            onDateChange={setPickerDate}
            todayKey={todayKey}
            timezone={timezone}
            items={draft.slotItems}
            totalMinutes={draft.summary.totalMinutes}
            excludeAppointmentId={appointmentId ?? undefined}
            selected={draft.startTime}
            onSelect={(next) => {
              draft.setStartTime(next);
              setSaveError(null);
              setView("detail");
            }}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {/*
           * Dos columnas: el cliente al lado, no encima.
           *
           * Elegir el cliente es una búsqueda con su propia lista de
           * resultados, y elegir servicios es otra. Apiladas, cada una empuja a
           * la otra fuera de la pantalla justo cuando se la está usando; al
           * lado, las dos se leen a la vez y se ve la reserva entera armándose.
           * En pantalla angosta vuelven a apilarse, con el cliente primero
           * porque es lo primero que se decide.
           */}
          <div className="grid gap-5 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <BookingClientField
              client={draft.client}
              dialCode={dialCode}
              onChange={isCreating ? draft.setClient : undefined}
            />

            <div className="space-y-5">
              <BookingDateTimeField
                dayKey={draft.dayKey}
                time={timeIn(draft.startTime ?? "", timezone)}
                detail={
                  isCreating
                    ? draft.items.length === 0
                      ? "Primero elegí un servicio."
                      : draft.startTime
                        ? `${draft.summary.totalMinutes} min en total`
                        : "Elegí un horario disponible."
                    : draft.hasChanges
                      ? "Sin guardar"
                      : `Termina ${timeIn(booking?.endTime ?? "", timezone)} · ${booking?.totalDuration ?? 0} min en total`
                }
                // Sin servicios no hay disponibilidad que preguntar: la duración es
                // justamente lo que define qué horarios entran.
                editable={
                  draft.canEdit && (!isCreating || draft.items.length > 0)
                }
                onOpen={() => {
                  setPickerDate(draft.dayKey ?? seed?.date ?? todayKey);
                  setView("time");
                }}
              />

              <BookingServicesField
                items={draft.items}
                onChange={(next) => {
                  draft.setItems(next);
                  setSaveError(null);
                }}
                services={services}
                staff={staff}
                currency={currency}
                offsets={draft.offsets}
                startTime={draft.startTime}
                timezone={timezone}
                preferredStaffId={seed?.staffId ?? null}
                editable={draft.canEdit}
                segments={segments}
                disabled={busy}
                notices={
                  <BookingNotices
                    hasInactiveService={
                      draft.summary.unknownServiceIds.length > 0
                    }
                    timeNoLongerFits={draft.servicesChanged && !timeStillFits}
                    pendingChanges={
                      !isCreating && draft.hasChanges && timeStillFits
                    }
                    locked={!draft.canEdit && segments.length > 0}
                  />
                }
              />

              {reminder && (
                <div className="border-t border-border px-2 pt-4">
                  <p
                    className={cn(
                      "text-xs",
                      reminder.tone === "warning"
                        ? "text-amber-600 dark:text-amber-500"
                        : "text-muted-foreground",
                    )}
                  >
                    {reminder.label}
                  </p>
                </div>
              )}

              {saveError && (
                <p className="rounded-md border border-red-500/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
                  {saveError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {view === "detail" && (
        <DrawerFooter className="flex-row items-center justify-between border-t border-border">
          <BookingSummary
            currency={currency}
            totalMinutes={
              isCreating || draft.hasChanges
                ? draft.summary.totalMinutes
                : (booking?.totalDuration ?? 0)
            }
            totalPrice={
              isCreating || draft.hasChanges
                ? draft.summary.totalPrice
                : (booking?.totalPrice ?? 0)
            }
          />

          {isCreating || draft.hasChanges ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (isCreating) {
                    onClose();
                    return;
                  }
                  draft.discard();
                  setSaveError(null);
                }}
              >
                {isCreating ? "Cancelar" : "Descartar"}
              </Button>
              <Button disabled={!canSave} onClick={() => void handleSave()}>
                {busy
                  ? "Guardando..."
                  : isCreating
                    ? "Crear reserva"
                    : "Guardar cambios"}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </DrawerFooter>
      )}
    </>
  );
};

/**
 * El panel lateral de una reserva.
 *
 * El editor se monta con la reserva como clave: lo que quedó a medio elegir
 * pertenece a *esa* reserva y muere con ella, sin necesidad de limpiarlo a mano
 * al cerrar ni al abrir otra.
 */
const BookingDrawer: React.FC<Props> = ({
  appointmentId,
  seed,
  todayKey,
  onClose,
  onSaved,
}) => {
  const open = appointmentId !== null || Boolean(seed);

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      {/*
       * El ancho va con la variante de vaul y no con un `sm:max-w-*` suelto: la
       * clase propia de `DrawerContent` lleva un selector de atributo y le gana
       * a cualquier `max-w` plano. Con dos columnas eso se nota enseguida.
       */}
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl">
        {open && (
          <BookingEditor
            /*
             * La clave incluye el punto de partida: lo que quedó a medio elegir
             * pertenece a *esa* reserva —o a *ese* hueco— y muere con ella, sin
             * necesidad de limpiarlo a mano al cerrar ni al abrir otra.
             */
            key={appointmentId ?? `new:${seed?.date}:${seed?.minute}`}
            appointmentId={appointmentId}
            seed={seed}
            todayKey={todayKey}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default BookingDrawer;
