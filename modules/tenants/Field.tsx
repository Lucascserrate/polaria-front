import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
	label: string;
	htmlFor: string;
	hint?: string;
	required?: boolean;
	className?: string;
	children: React.ReactNode;
}

/** Etiqueta, campo y la aclaración de abajo, con el mismo espaciado siempre. */
const Field: React.FC<Props> = ({
	label,
	htmlFor,
	hint,
	required,
	className,
	children,
}) => (
	<div className={cn('space-y-2', className)}>
		<Label htmlFor={htmlFor}>
			{label}
			{required && <span className="ml-0.5 text-muted-foreground">*</span>}
		</Label>
		{children}
		{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
	</div>
);

export default Field;
