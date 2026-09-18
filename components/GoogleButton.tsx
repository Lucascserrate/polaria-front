import { API_BASE_URL } from '@/constants/env';
import { FcGoogle } from 'react-icons/fc';

const GoogleButton: React.FC = () => {
	return (
		<a
			href={`${API_BASE_URL}/auth/google`}
			className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-card text-sm font-medium ring-1 ring-border transition-colors hover:bg-accent"
		>
			<FcGoogle className="size-5" />
			Continuar con Google
		</a>
	);
};

export default GoogleButton;
