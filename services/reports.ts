import { axiosInstance } from '@/lib/axios';
import type {
	ReportQuery,
	StaffReport,
	TenantReport,
} from '@/types/reports.types';

export const getReport = async (query: ReportQuery): Promise<TenantReport> => {
	const { data } = await axiosInstance.get<TenantReport>('/reports', {
		params: {
			preset: query.preset,
			// Solo viajan en el rango personalizado; en los presets el backend los
			// ignora y mandarlos vacíos rompería la validación de formato.
			...(query.preset === 'custom' && query.from ? { from: query.from } : {}),
			...(query.preset === 'custom' && query.to ? { to: query.to } : {}),
		},
	});
	return data;
};

/**
 * El reporte del profesional autenticado.
 *
 * No lleva a quién: el backend lo resuelve con el `staffId` del token. Si viajara
 * por parámetro, editarlo a mano sería suficiente para leer los números de un
 * compañero.
 */
export const getMyReport = async (query: ReportQuery): Promise<StaffReport> => {
	const { data } = await axiosInstance.get<StaffReport>('/reports/me', {
		params: {
			preset: query.preset,
			// Solo viajan en el rango personalizado; en los presets el backend los
			// ignora y mandarlos vacíos rompería la validación de formato.
			...(query.preset === 'custom' && query.from ? { from: query.from } : {}),
			...(query.preset === 'custom' && query.to ? { to: query.to } : {}),
		},
	});
	return data;
};
