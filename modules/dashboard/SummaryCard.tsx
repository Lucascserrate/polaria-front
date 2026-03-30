import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface Props {
	count: number;
	confirmed: number;
	completed: number;
}

export const SummaryCard = ({ count, confirmed, completed }: Props) => {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
					<Calendar className="w-4 h-4 text-muted-foreground" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="text-3xl font-bold">{count}</div>
					<div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
						<div>
							<span className="text-blue-600 dark:text-blue-400 font-semibold">
								{confirmed}
							</span>{' '}
							Confirmed
						</div>
						<div>
							<span className="text-green-600 dark:text-green-400 font-semibold">
								{completed}
							</span>{' '}
							Completed
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
