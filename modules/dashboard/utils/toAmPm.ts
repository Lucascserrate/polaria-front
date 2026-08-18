const toAmPm = (timeLabel?: string | null): string => {
	if (typeof timeLabel !== 'string' || !timeLabel.trim()) return 'Sin hora';

	const parts = timeLabel.split(',').map((p) => p.trim());
	const time24h = parts.length >= 2 ? parts[1] : timeLabel.trim();
	const match = time24h.match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return time24h;
	const hours24 = Number(match[1]);
	const minutes = match[2];
	if (!Number.isFinite(hours24)) return time24h;
	const suffix = hours24 >= 12 ? 'PM' : 'AM';
	const hours12 = ((hours24 + 11) % 12) + 1;
	return `${String(hours12).padStart(2, '0')}:${minutes} ${suffix}`;
};

export default toAmPm;
