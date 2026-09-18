'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import useSearchBusinesses from '@/services/signup/useSearchBusinesses';
import { useRequestToJoin } from '@/services/signup/useJoinRequests';
import {
	MIN_SEARCH_LENGTH,
	type JoinableBusiness,
} from '@/services/signup/signup.service';

const errorMessage = (cause: unknown): string => {
	const detail = (
		cause as { response?: { data?: { message?: unknown } } } | undefined
	)?.response?.data?.message;

	return typeof detail === 'string'
		? detail
		: 'No pudimos mandar el pedido. Probá de nuevo.';
};

/**
 * Buscar el negocio donde ya trabajás y pedir entrar.
 *
 * Es la salida que le faltaba a un empleado. Antes de esto, Polaria le creaba un
 * negocio sin preguntar; después de la bifurcación, la única salida era pedirle
 * a su jefe que lo cargara. Ahora lo pide él.
 *
 * Pedir **no** da acceso: lo aprueba el negocio. Si alcanzara con pedirlo,
 * cualquiera con una cuenta de Google entraría a la agenda de cualquiera.
 */
const BusinessSearch: React.FC<{ onBack: () => void }> = ({ onBack }) => {
	const [query, setQuery] = useState('');
	const [error, setError] = useState<string | null>(null);

	/*
	 * La búsqueda espera a que se deje de escribir. Sin esto son ocho peticiones
	 * para escribir "peluquería", y la respuesta que importa es la última.
	 */
	const debounced = useDebouncedValue(query);
	const { data: results = [], isFetching } = useSearchBusinesses(debounced);
	const { mutateAsync: request, isPending, variables } = useRequestToJoin();

	const tooShort = debounced.trim().length < MIN_SEARCH_LENGTH;

	const handleRequest = async (business: JoinableBusiness) => {
		setError(null);

		try {
			await request(business.id);
		} catch (cause) {
			setError(errorMessage(cause));
		}
	};

	return (
		<div className="space-y-5">
			<button
				type="button"
				onClick={onBack}
				className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Volver
			</button>

			<div className="space-y-1">
				<p className="text-sm font-medium">Buscá tu negocio</p>
				<p className="text-sm text-muted-foreground">
					Encontralo y pedile acceso. El negocio tiene que aceptarte.
				</p>
			</div>

			<div className="relative">
				<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Nombre del negocio"
					autoComplete="off"
					className="pl-9"
				/>
			</div>

			{error && (
				<p
					role="alert"
					className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive"
				>
					{error}
				</p>
			)}

			{/*
			 * Cuatro estados y ninguno vacío: el silencio en un buscador se lee como
			 * "no hay nada", que no es lo mismo que "escribí un poco más".
			 */}
			{tooShort ? (
				<p className="text-sm text-muted-foreground">
					{`Escribí al menos ${MIN_SEARCH_LENGTH} letras del nombre.`}
				</p>
			) : isFetching ? (
				<div className="space-y-2">
					<div className="h-16 animate-pulse rounded-xl bg-muted" />
					<div className="h-16 animate-pulse rounded-xl bg-muted" />
				</div>
			) : results.length === 0 ? (
				<div className="space-y-1">
					<p className="text-sm font-medium">No encontramos ese negocio.</p>
					<p className="text-sm text-muted-foreground">
						Puede estar con otro nombre. Preguntale al negocio con qué nombre
						está en Polaria.
					</p>
				</div>
			) : (
				<ul className="space-y-2">
					{results.map((business) => (
						<li
							key={business.id}
							className="flex items-center gap-3 rounded-xl border border-border px-3 py-3"
						>
							{business.logoUrl ? (
								<Image
									src={business.logoUrl}
									alt=""
									width={40}
									height={40}
									className="size-10 shrink-0 rounded-lg object-cover"
								/>
							) : (
								<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
									<Building2 className="size-5" />
								</span>
							)}

							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">{business.name}</p>
								{business.ownerName && (
									<p className="truncate text-xs text-muted-foreground">
										{`Propietario: ${business.ownerName}`}
									</p>
								)}
							</div>

							<Button
								size="sm"
								className="shrink-0"
								disabled={isPending}
								onClick={() => void handleRequest(business)}
							>
								{isPending && variables === business.id && (
									<Spinner className="size-3.5" />
								)}
								Pedir acceso
							</Button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default BusinessSearch;
