import { axiosInstance } from '@/lib/axios';

export const validateToken = async () => {
	const { data } = await axiosInstance.get('/auth/validateToken');
	return data;
};

export const logout = async () => {
	const { data } = await axiosInstance.post('/auth/logout');
	return data;
};
