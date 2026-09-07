import { type ReactNode } from 'react';

export function SectionEyebrow({ children }: { children: ReactNode }) {
	return (
		<p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
			{children}
		</p>
	);
}

export function SectionTitle({
	eyebrow,
	title,
	description,
	className = '',
}: {
	eyebrow?: string;
	title: string;
	description?: string;
	className?: string;
}) {
	return (
		<div className={`max-w-3xl ${className}`}>
			{eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
			<h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:text-5xl">
				{title}
			</h2>
			{description && (
				<p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
					{description}
				</p>
			)}
		</div>
	);
}
