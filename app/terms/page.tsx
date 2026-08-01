import { ROUTES } from '@/constants/routes';
import { Separator } from '@radix-ui/react-select';
import Link from 'next/link';
import { LuArrowLeft } from 'react-icons/lu';

export default function TermsAndConditions() {
	const homeHref =
		'home' in ROUTES
			? ((ROUTES as typeof ROUTES & { home?: string }).home ?? '/')
			: '/';

	return (
		<div className="min-h-screen bg-gray-50 pt-12">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<Link
					href={homeHref}
					className="flex items-center gap-2 mb-8 text-gray-700 hover:text-gray-900 transition-colors"
				>
					<LuArrowLeft className="h-5 w-5" />
					<span>Volver</span>
				</Link>

				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Términos y Condiciones de Uso
				</h1>

				<p className="text-sm text-gray-500 mb-8">
					Estos Términos y Condiciones de Uso regulan el acceso y utilización de
					Polaria y sus funcionalidades.
				</p>

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						1. Definiciones
					</h2>

					<div className="space-y-4 text-sm text-gray-600 leading-relaxed">
						<p>
							<strong>Polaria</strong>: plataforma tecnológica destinada a
							proporcionar herramientas para la gestión y atención de negocios,
							incluyendo la administración de clientes, servicios, personal,
							horarios, reservas, conversaciones e integraciones de
							comunicación.
						</p>

						<p>
							<strong>Usuario</strong>: persona que accede, se registra o
							utiliza las funcionalidades de Polaria en representación propia o
							de un negocio.
						</p>

						<p>
							<strong>Negocio o Tenant</strong>: entidad o negocio cuyos datos y
							operaciones son gestionados mediante una cuenta dentro de Polaria.
						</p>

						<p>
							<strong>Cliente final</strong>: persona que mantiene una relación
							o interacción con un negocio gestionado mediante Polaria,
							incluyendo personas que solicitan información, servicios o
							reservas.
						</p>

						<p>
							<strong>Servicios</strong>: prestaciones, actividades o servicios
							que un negocio configura y administra dentro de Polaria para su
							gestión y reserva.
						</p>

						<p>
							<strong>Plataforma</strong>: conjunto de interfaces,
							funcionalidades y componentes tecnológicos que conforman Polaria.
						</p>
					</div>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						2. Aceptación de los términos
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						El acceso o utilización de Polaria implica la aceptación de estos
						Términos y Condiciones de Uso. Si el usuario no está de acuerdo con
						alguna de sus disposiciones, deberá abstenerse de utilizar las
						funcionalidades de la plataforma.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						Estos términos podrán complementarse con políticas, condiciones o
						avisos específicos aplicables a determinadas funcionalidades de
						Polaria.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						3. Objeto de Polaria
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Polaria proporciona herramientas tecnológicas destinadas a facilitar
						la gestión operativa y la atención de negocios. Entre otras
						funcionalidades, la plataforma permite gestionar información del
						negocio, clientes, servicios, personal, horarios comerciales, citas
						y reservas, conversaciones e integraciones de comunicación.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						Polaria actúa como una herramienta tecnológica de gestión y no
						sustituye la responsabilidad del negocio respecto de sus clientes,
						servicios, disponibilidad, comunicaciones, reservas o decisiones
						comerciales.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						4. Registro y cuenta
					</h2>

					<div className="text-sm text-gray-600 leading-relaxed space-y-3">
						<p>
							Para utilizar determinadas funcionalidades de Polaria puede ser
							necesario crear o utilizar una cuenta. El usuario se compromete a
							proporcionar información correcta, suficiente y actualizada.
						</p>

						<p>
							El usuario es responsable de mantener la confidencialidad de sus
							credenciales y de las actividades realizadas desde su cuenta.
						</p>

						<p>
							Cuando el acceso se realice mediante Google u otro proveedor
							externo autorizado, el usuario deberá cumplir también las
							condiciones aplicables a dicho proveedor.
						</p>

						<p>
							El usuario deberá informar oportunamente cualquier acceso no
							autorizado o situación que pueda comprometer la seguridad de su
							cuenta.
						</p>
					</div>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						5. Uso permitido de la plataforma
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed mb-3">
						El usuario deberá utilizar Polaria de forma lícita, responsable y
						conforme a estos términos. El usuario podrá utilizar las
						funcionalidades disponibles para gestionar las operaciones de su
						negocio, administrar información y atender a sus clientes.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed">
						El usuario deberá asegurarse de que la información que introduzca en
						la plataforma sea adecuada para las finalidades para las que utiliza
						Polaria y de contar con las autorizaciones necesarias respecto de
						los datos que gestione.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						6. Usos prohibidos
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed mb-3">
						Queda prohibido utilizar Polaria para:
					</p>

					<ul className="text-sm text-gray-600 space-y-2 ml-5 list-disc">
						<li>Realizar actividades ilícitas, fraudulentas o engañosas.</li>
						<li>Suplantar la identidad de otra persona o negocio.</li>
						<li>
							Acceder o intentar acceder sin autorización a cuentas, información
							o datos pertenecientes a otros negocios.
						</li>
						<li>
							Manipular, eliminar o alterar reservas, clientes, conversaciones u
							otra información ajena.
						</li>
						<li>
							Introducir malware, código malicioso o cualquier elemento
							destinado a afectar el funcionamiento de la plataforma.
						</li>
						<li>
							Intentar vulnerar, desactivar o eludir mecanismos de seguridad o
							restricciones de acceso.
						</li>
						<li>
							Utilizar Polaria para enviar spam o comunicaciones no autorizadas.
						</li>
						<li>
							Utilizar las integraciones de WhatsApp de forma contraria a las
							condiciones, políticas o requisitos aplicables de Meta o WhatsApp.
						</li>
						<li>
							Utilizar la plataforma de una manera que pueda perjudicar su
							funcionamiento, seguridad o disponibilidad para otros usuarios.
						</li>
					</ul>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						7. Información y datos gestionados por el negocio
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						El negocio es responsable de la información que incorpora o
						administra mediante Polaria, incluyendo datos relacionados con sus
						clientes, servicios, personal, horarios, reservas, conversaciones y
						demás información necesaria para operar sus actividades.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						El negocio deberá contar con las autorizaciones o bases jurídicas
						que correspondan para recopilar, utilizar y gestionar la información
						que introduzca en la plataforma.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						8. WhatsApp, Google y servicios de terceros
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Algunas funcionalidades de Polaria dependen de servicios
						proporcionados por terceros, incluyendo servicios de Meta, WhatsApp
						y Google.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						El usuario reconoce que estos proveedores pueden modificar sus APIs,
						condiciones, políticas, requisitos técnicos o disponibilidad.
						Polaria no controla las decisiones, restricciones, interrupciones o
						cambios realizados directamente por dichos proveedores.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						El uso de integraciones de terceros también puede estar sujeto a sus
						propios términos, políticas y condiciones. El usuario será
						responsable de cumplir las obligaciones que resulten aplicables a
						dichos servicios.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						Meta, WhatsApp y Google son servicios independientes de Polaria.
						Polaria no se presenta como propietaria de dichas plataformas.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						9. Mensajes y comunicaciones
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Cuando el negocio conecta servicios de comunicación compatibles,
						Polaria puede procesar información y mensajes necesarios para
						proporcionar las funcionalidades de atención y comunicación
						disponibles en la plataforma.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						El negocio es responsable de las comunicaciones que realice con sus
						clientes y de utilizar las herramientas de comunicación de acuerdo
						con la normativa y las condiciones de los proveedores externos
						correspondientes.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						10. Reservas y citas
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Polaria proporciona herramientas para configurar y gestionar
						horarios, servicios, disponibilidad, citas y reservas.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						El negocio es responsable de mantener actualizada la información
						relacionada con sus servicios, horarios, disponibilidad y atención
						al cliente.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						La utilización de las herramientas de reserva de Polaria no
						constituye una garantía de que el servicio será finalmente prestado.
						Las condiciones, modificaciones, cancelaciones y prestación efectiva
						de los servicios corresponden al negocio y al cliente según
						corresponda.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						11. Propiedad intelectual
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						El software, diseño, interfaces, elementos gráficos, marca,
						logotipos, contenido y demás componentes propios de Polaria están
						protegidos por las normas aplicables de propiedad intelectual y
						pertenecen a sus respectivos titulares.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						El usuario conserva los derechos que legalmente le correspondan
						sobre los datos y contenidos que proporcione a través de la
						plataforma, sin perjuicio de las autorizaciones necesarias para que
						Polaria pueda procesarlos y utilizarlos exclusivamente en la medida
						necesaria para prestar sus funcionalidades.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						Salvo autorización expresa, el usuario no podrá copiar, modificar,
						distribuir, vender, realizar ingeniería inversa o explotar
						indebidamente elementos protegidos de Polaria.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						12. Disponibilidad y modificaciones de la plataforma
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Polaria podrá actualizar, modificar, incorporar, limitar o retirar
						funcionalidades de la plataforma cuando resulte necesario por
						razones técnicas, operativas, de mantenimiento, seguridad o
						evolución del producto.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						Determinadas funcionalidades también pueden depender de servicios
						externos, cuya disponibilidad no depende exclusivamente de Polaria.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						13. Seguridad
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Polaria aplica medidas razonables destinadas a proteger la
						plataforma y la información gestionada mediante ella frente a
						accesos o usos no autorizados.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						No obstante, ningún sistema tecnológico puede garantizar una
						seguridad absoluta. El usuario también debe adoptar medidas
						razonables para proteger sus credenciales, dispositivos y accesos.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						14. Suspensión o terminación
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Polaria podrá restringir, suspender o cancelar el acceso a la
						plataforma cuando exista un incumplimiento de estos términos, uso
						abusivo o fraudulento, actividad ilícita, riesgo para la seguridad o
						cualquier situación que pueda afectar de forma relevante el
						funcionamiento de la plataforma o a otros usuarios.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						15. Limitación de responsabilidad
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Polaria proporciona herramientas tecnológicas de gestión y no
						garantiza resultados comerciales, incremento de clientes, reservas,
						ventas u otros resultados específicos derivados del uso de la
						plataforma.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						El negocio mantiene la responsabilidad sobre sus operaciones,
						servicios, información, clientes, horarios, reservas y
						comunicaciones.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						En la medida permitida por la legislación aplicable, Polaria no será
						responsable por interrupciones, errores o limitaciones originadas
						directamente por servicios externos, fallos de conectividad,
						dispositivos del usuario, configuraciones incorrectas o hechos fuera
						de su control razonable.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						16. Servicios de terceros
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						El uso de determinadas funcionalidades puede requerir la conexión
						con servicios externos. La relación del usuario con dichos
						proveedores se encuentra sujeta a los términos y políticas
						establecidos directamente por cada proveedor.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						Polaria no controla ni garantiza las condiciones, disponibilidad o
						funcionamiento permanente de servicios externos como Google, Meta o
						WhatsApp.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						17. Modificaciones de estos términos
					</h2>

					<p className="text-sm text-gray-600 leading-relaxed">
						Polaria podrá modificar estos Términos y Condiciones cuando resulte
						necesario para reflejar cambios en la plataforma, requisitos
						operativos, aspectos técnicos o modificaciones aplicables.
					</p>

					<p className="text-sm text-gray-600 leading-relaxed mt-3">
						La versión vigente será la publicada en esta página. Cuando
						corresponda, se podrá informar al usuario sobre cambios relevantes
						mediante los canales disponibles.
					</p>
				</section>

				<div className="text-center pt-8 border-t">
					<p className="text-xs text-gray-500">
						Última actualización: 31 de julio de 2026
					</p>

					<p className="text-xs text-gray-500 mt-1">© Polaria</p>
				</div>
			</div>
		</div>
	);
}
