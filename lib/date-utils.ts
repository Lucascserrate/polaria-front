function formatTimeString(
	hours: number,
	minutes: number,
	format: '24h' | '12h' = '24h',
): string {
	const minutesStr = String(minutes).padStart(2, '0');

	if (format === '24h') {
		const hoursStr = String(hours).padStart(2, '0');
		return `${hoursStr}:${minutesStr}`;
	} else {
		// 12h format
		const period = hours >= 12 ? 'PM' : 'AM';
		const hours12 = hours % 12 || 12;
		const hoursStr = String(hours12).padStart(2, '0');
		return `${hoursStr}:${minutesStr} ${period}`;
	}
}

export function formatDateTime(
	date: Date,
	format: '24h' | '12h' = '24h',
): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const year = date.getFullYear();
	const hours = date.getHours();
	const minutes = date.getMinutes();

	const timeStr = formatTimeString(hours, minutes, format);

	return `${month}/${day}/${year}, ${timeStr}`;
}

export function formatDate(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const year = date.getFullYear();

	return `${month}/${day}/${year}`;
}

export function formatTime(date: Date, format: '24h' | '12h' = '24h'): string {
	const hours = date.getHours();
	const minutes = date.getMinutes();

	return formatTimeString(hours, minutes, format);
}
