import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';
import { ROUTES } from '@/constants/routes';

export const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
});

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			window.location.href = ROUTES.auth;
		}

		return Promise.reject(error);
	},
);
