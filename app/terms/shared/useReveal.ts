'use client';

import { useEffect, useRef, useState } from 'react';

export function useReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
	const ref = useRef<T>(null);
	const [reduceMotion, setReduceMotion] = useState(() =>
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
	);
	const [isVisible, setIsVisible] = useState(reduceMotion);

	useEffect(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = (event: MediaQueryListEvent) => setReduceMotion(event.matches);

		if (media.addEventListener) {
			media.addEventListener('change', update);
			return () => media.removeEventListener('change', update);
		}

		media.addListener(update);
		return () => media.removeListener(update);
	}, []);

	useEffect(() => {
		if (reduceMotion) {
			return;
		}

		const node = ref.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{
				threshold: 0.18,
				rootMargin: '0px 0px -8% 0px',
				...options,
			},
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [options, reduceMotion]);

	return { ref, isVisible: isVisible || reduceMotion, reduceMotion };
}
