/**
 * Las direcciones de la herramienta de soporte, juntas.
 *
 * Viven acá y no en `constants/routes` porque este módulo está pensado para
 * salir a un repo de administración propio: cuando eso pase, la ruta base cambia
 * y tiene que haber un solo lugar donde cambiarla.
 */
export const TENANTS_BASE_ROUTE = '/super-admin/tenant-management';

export const tenantRoute = (id: string) => `${TENANTS_BASE_ROUTE}/${id}`;
