export const APPOINTMENT_STATUS = {
	CONFIRMED: 'confirmed',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
} as const;

export const STATUS_COLORS = {
	confirmed: {
		badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
		dot: 'bg-blue-500',
	},
	completed: {
		badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
		dot: 'bg-green-500',
	},
	cancelled: {
		badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
		dot: 'bg-red-500',
	},
} as const;
