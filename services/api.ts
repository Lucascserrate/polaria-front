export async function apiFetch<T>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
	const url = new URL(path, baseUrl);
	const res = await fetch(url.toString(), options);

	if (!res.ok) {
		throw new Error('Request failed');
	}

	return (await res.json()) as T;
}
