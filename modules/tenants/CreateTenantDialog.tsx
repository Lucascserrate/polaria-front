'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { CreateTenantDto } from '@/types/tenant.types';

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	saving?: boolean;
	error?: string | null;
	onSubmit: (tenant: CreateTenantDto) => void;
}

const isValidEmail = (value: string) =>
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/**
 * El alta de un negocio: nombre y correo, nada más.
 *
 * Sigue siendo un diálogo, y no una pantalla como la edición, porque son dos
 * campos y ninguna decisión: crear es abrir la ficha, no llenarla. Todo lo demás
 * —tipo de negocio, ubicación, credenciales— se completa después, con el negocio
 * ya existiendo.
 *
 * **El teléfono no se pide.** Lo escribe el Embedded Signup cuando el negocio
 * conecta WhatsApp: es el único camino que sabe el número de verdad, porque lo
 * devuelve Meta. Un número tipeado a mano acá no habilita nada y, peor, ocupa el
 * índice único que después va a reclamar el número real.
 */
export function CreateTenantDialog({
	open,
	onOpenChange,
	saving = false,
	error,
	onSubmit,
}: Props) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const nextErrors: Record<string, string> = {};

		if (!name.trim()) {
			nextErrors.name = 'El nombre del negocio es obligatorio.';
		}

		if (!email.trim()) {
			nextErrors.email = 'El correo electrónico es obligatorio.';
		} else if (!isValidEmail(email)) {
			nextErrors.email = 'Ingresa un correo válido.';
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validate()) return;

		onSubmit({ name: name.trim(), email: email.trim() });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Crear negocio</DialogTitle>
					<DialogDescription>
						Con esto alcanza para que el negocio exista. El resto se completa en
						su ficha.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Nombre</Label>
						<Input
							id="name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Ej. Barbería Central"
							aria-invalid={Boolean(errors.name)}
						/>
						{errors.name && (
							<p className="text-sm text-red-600">{errors.name}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Correo electrónico</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="admin@negocio.com"
							aria-invalid={Boolean(errors.email)}
						/>
						{errors.email && (
							<p className="text-sm text-red-600">{errors.email}</p>
						)}
						<p className="text-xs text-muted-foreground">
							Es lo que vincula el negocio con su cuenta de Google la primera vez
							que entra al panel.
						</p>
					</div>

					{error && (
						<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
							{error}
						</p>
					)}

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={saving}>
							{saving && <Spinner className="size-3.5" />}
							Crear negocio
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default CreateTenantDialog;
