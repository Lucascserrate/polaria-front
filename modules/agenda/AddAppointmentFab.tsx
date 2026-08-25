"use client";

import { Plus } from "lucide-react";
import { useMobileSidebar } from "@/components/sidebar-mobile";

interface Props {
  onClick: () => void;
}

/**
 * Crear cita, flotando sobre el calendario. Solo en móvil.
 *
 * En la barra el botón entero ocupaba lo que necesitaba la fecha y empujaba
 * todo a una tercera fila. Acá no le quita ancho a nada y queda donde cae el
 * pulgar, que es además desde donde se mira la agenda del día.
 *
 * De vidrio y no opaco a propósito: está encima de la grilla, y dejar ver la
 * hora que tapa es lo que evita que se sienta como un parche pegado arriba.
 */
const AddAppointmentFab: React.FC<Props> = ({ onClick }) => {
  // Con el menú abierto sobra: la pantalla ya es otra cosa, y un botón brillante
  // sobre el velo se lee como que quedó suelto.
  const menuOpen = useMobileSidebar();

  if (menuOpen) return null;

  return (
    <button
      type="button"
      aria-label="Agregar cita"
      onClick={onClick}
      className="fixed right-4 bottom-6 z-40 flex size-14 items-center justify-center rounded-full border border-white/25 bg-primary/80 text-primary-foreground shadow-[0_10px_30px_-6px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.35)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-150 active:scale-95 md:hidden"
    >
      {/* El reflejo de arriba, que es lo que lo hace leer como vidrio y no como
			    un círculo translúcido. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 top-1 h-4 rounded-full bg-white/20 blur-[6px]"
      />
      <Plus className="size-6" />
    </button>
  );
};

export default AddAppointmentFab;
