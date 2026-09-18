'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AUTH_PHOTOS, PHOTO_INTERVAL_MS } from './photos';

const AuthPhotos: React.FC<{ className?: string }> = ({ className }) => {
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (AUTH_PHOTOS.length < 2) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const id = window.setInterval(() => {
			setCurrent((index) => (index + 1) % AUTH_PHOTOS.length);
		}, PHOTO_INTERVAL_MS);

		return () => window.clearInterval(id);
	}, []);

	return (
		<div
			aria-hidden="true"
			className={cn('relative overflow-hidden bg-muted', className)}
		>
			{AUTH_PHOTOS.map((photo, index) => (
				<Image
					key={photo.src}
					src={photo}
					alt=""
					fill
					sizes="50vw"
					priority={index === 0}
					className={cn(
						'object-cover transition-opacity duration-1000 ease-in-out',
						index === current ? 'opacity-100' : 'opacity-0',
					)}
				/>
			))}
		</div>
	);
};

export default AuthPhotos;
