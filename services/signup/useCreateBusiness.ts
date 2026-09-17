import { useMutation } from '@tanstack/react-query';
import { createBusiness } from './signup.service';

/**
 * Crea el negocio y con eso termina el trámite.
 *
 * El servidor cambia la cookie del alta por las de sesión, así que después de
 * esto la pantalla tiene que recargar de verdad —no navegar— para que todo lo
 * que ya existe arranque leyendo una sesión de dueño.
 */
const useCreateBusiness = () => useMutation({ mutationFn: createBusiness });

export default useCreateBusiness;
