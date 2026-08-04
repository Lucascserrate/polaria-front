const normalizeTenantPayload = <T extends object>(payload: T) =>
	Object.fromEntries(
		Object.entries(payload).filter(([, value]) => value !== undefined),
	) as Partial<T>;

export { normalizeTenantPayload };
