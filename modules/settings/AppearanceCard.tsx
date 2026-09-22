'use client';

import { Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';

const AppearanceCard: React.FC = () => (
	<Card className="shadow-none">
		<CardContent className="flex items-start gap-4">
			<Palette className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

			<div className="min-w-0 flex-1 space-y-3">
				<div className="space-y-1">
					<p className="text-base font-medium">Apariencia</p>
					<p className="text-sm text-muted-foreground">
						Cómo se ve el panel en este dispositivo.
					</p>
				</div>

				<ThemeToggle className="max-w-xs" />
			</div>
		</CardContent>
	</Card>
);

export default AppearanceCard;
