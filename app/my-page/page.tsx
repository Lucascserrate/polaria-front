'use client';

import BookingLinkCard from '@/modules/public-page/BookingLinkCard';
import PhotosSection from '@/modules/public-page/PhotosSection';
import PublicPagePreview from '@/modules/public-page/PublicPagePreview';
import useGetSettings from '@/services/settings/useGetSettings';

/**
 * Mi página: el enlace público y lo que se ve en él.
 *
 * Es una sección propia y no una pantalla de Configuración porque no se
 * configura una vez: el enlace se comparte cada vez que llega un cliente nuevo,
 * y las fotos se cambian cuando el local cambia. Vivía repartido entre
 * "Información del negocio" —el enlace, debajo del mapa— y "Fotos del negocio",
 * y ninguna de las dos es una pantalla a la que alguien vuelva.
 *
 * Reúne lo que existe **solo** para que lo vea un cliente. El nombre, la zona
 * horaria y la dirección se siguen editando en Configuración aunque la página
 * los muestre: de la zona horaria depende la agenda y la dirección también se
 * manda por WhatsApp, así que no están ahí para la página.
 */
const MyPagePage = () => {
	const { data: settings, isLoading } = useGetSettings();
	const url = settings?.publicBookingUrl ?? null;

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 pb-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Mi página</h1>
				<p className="text-sm text-muted-foreground">
					La dirección donde tus clientes reservan solos, y lo que ven cuando
					entran.
				</p>
			</div>

			{/*
			 * Mientras llega la configuración no se dibuja la tarjeta del enlace.
			 *
			 * Sin esto se vería un cuadro de "tu página todavía no existe" que
			 * desaparece al segundo, y ese cartel es justamente el que no puede
			 * aparecer por error: dice que algo falta.
			 */}
			{isLoading ? (
				<div className="h-44 animate-pulse rounded-xl border border-border bg-muted/50" />
			) : (
				<BookingLinkCard url={url} />
			)}

			<PhotosSection />

			{/* La vista previa necesita una dirección que exista. */}
			{url && <PublicPagePreview url={url} />}
		</div>
	);
};

export default MyPagePage;
