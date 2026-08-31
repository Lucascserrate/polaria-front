"use client";

import { cloneElement, useId, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { ClientApi } from "@/types/appointments.types";
import useCreateClient from "@/services/clients/useCreateClient";

interface Props {
  open: boolean;
  dialCode?: string;
  onOpenChange: (open: boolean) => void;
  /**
   * El cliente recién creado. Lo usa la agenda, que abre este diálogo para
   * elegirlo en el acto: si el teléfono ya era de otro cliente, el backend
   * devuelve **ése**, y es el que corresponde poner en la reserva.
   */
  onCreated?: (client: ClientApi) => void;
}

const EMPTY = { name: "", phone: "", email: "", birthDate: "" };

/**
 * El alta de un cliente desde la lista.
 *
 * El teléfono es obligatorio, y es la decisión que sostiene todo el módulo: es
 * lo único con lo que se reconoce a la misma persona cuando vuelve por WhatsApp
 * o por la página. Dejarlo opcional acá sería sembrar de a un duplicado por
 * carga, y no habría forma de repararlo después.
 *
 * Un diálogo y no una pantalla: son cuatro campos, y la ficha completa se llena
 * después, editando.
 */
const NewClientDialog: React.FC<Props> = ({
  open,
  dialCode,
  onOpenChange,
  onCreated,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Añadir cliente</DialogTitle>
        <DialogDescription>
          El teléfono es lo que permite reconocerlo cuando reserve por WhatsApp
          o desde la página.
        </DialogDescription>
      </DialogHeader>

      {/*
       * El formulario vive en su propio componente para que cerrar el diálogo lo
       * desmonte: así el borrador se limpia solo al reabrirlo, sin un efecto que
       * lo resetee a mano.
       */}
      {open && (
        <NewClientForm
          dialCode={dialCode}
          onDone={onOpenChange}
          onCreated={onCreated}
        />
      )}
    </DialogContent>
  </Dialog>
);

const NewClientForm: React.FC<{
  dialCode?: string;
  onDone: (open: false) => void;
  onCreated?: (client: ClientApi) => void;
}> = ({ dialCode, onDone, onCreated }) => {
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const createClient = useCreateClient();

  const set = (field: keyof typeof EMPTY, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const canSave = draft.name.trim() !== "" && draft.phone.trim() !== "";

  const handleSave = async () => {
    setError(null);

    try {
      const created = await createClient.mutateAsync({
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim() || undefined,
        birthDate: draft.birthDate || undefined,
      });
      onCreated?.(created);
      onDone(false);
    } catch (cause) {
      // El backend explica qué pasó con el teléfono —ilegible, o ya usado— y
      // ese mensaje es más útil que uno genérico.
      setError(
        axios.isAxiosError(cause) &&
          typeof cause.response?.data?.message === "string"
          ? cause.response.data.message
          : "No se pudo crear el cliente. Intentá de nuevo.",
      );
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Field label="Nombre" required>
          <Input
            autoFocus
            value={draft.name}
            placeholder="Ana Quispe"
            onChange={(event) => set("name", event.target.value)}
          />
        </Field>

        <Field
          label="Teléfono"
          required
          hint={
            dialCode
              ? `Si no ponés país, se asume +${dialCode}.`
              : "Escribilo con el código de país si es del exterior."
          }
        >
          <Input
            value={draft.phone}
            inputMode="tel"
            placeholder={dialCode ? `+${dialCode} 70123456` : "70123456"}
            onChange={(event) => set("phone", event.target.value)}
          />
        </Field>

        <Field label="Email">
          <Input
            type="email"
            value={draft.email}
            placeholder="ana@ejemplo.com"
            onChange={(event) => set("email", event.target.value)}
          />
        </Field>

        <Field label="Fecha de nacimiento">
          <Input
            type="date"
            value={draft.birthDate}
            onChange={(event) => set("birthDate", event.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onDone(false)}>
          Cancelar
        </Button>
        <Button
          disabled={!canSave || createClient.isPending}
          onClick={() => void handleSave()}
        >
          {createClient.isPending && <Spinner className="size-4" />}
          Añadir
        </Button>
      </DialogFooter>
    </>
  );
};

/**
 * Una etiqueta y su campo, asociados de verdad.
 *
 * El `id` se genera y se inyecta en el hijo en lugar de dejar la etiqueta suelta
 * al lado: sin `htmlFor`, un lector de pantalla anuncia el campo sin nombre, y
 * tocar la etiqueta no enfoca el input.
 */
const Field: React.FC<{
  label: string;
  required?: boolean;
  /** Aclaración bajo el campo. Va acá y no dentro de `children` para que la
   * etiqueta siga apuntando a un único control. */
  hint?: string;
  children: React.ReactElement<{ id?: string }>;
}> = ({ label, required, hint, children }) => {
  const id = useId();

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {cloneElement(children, { id })}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};

export default NewClientDialog;
