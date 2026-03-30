import Link from 'next/link';
import { API_BASE_URL } from '@/constants/env';
import { FcGoogle } from 'react-icons/fc';

const GoogleButton: React.FC = () => {
	return (
		<Link
			href={`${API_BASE_URL}/auth/google`}
			className="w-full flex justify-center items-center gap-2 py-2.5 rounded-[10px] shadow-[2px_4px_5px_#00000022] cursor-pointer"
		>
			<FcGoogle className="w-6 h-6 xl:w-7 xl:h-7" />
			<div className="text-xs xl:text-sm font-medium">Continuar con Google</div>
		</Link>
	);
};

export default GoogleButton;
