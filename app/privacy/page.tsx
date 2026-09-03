import { ROUTES } from '@/constants/routes';
import { Separator } from '@radix-ui/react-select';
import Link from 'next/link';
import { LuArrowLeft } from 'react-icons/lu';

export default function PrivacyPolicy() {
	const homeHref =
		'home' in ROUTES
			? ((ROUTES as typeof ROUTES & { home?: string }).home ?? '/')
			: '/';

	return (
		<div className="min-h-screen bg-muted/40 pt-12">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<Link
					href={homeHref}
					className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
				>
					<LuArrowLeft className="h-5 w-5" />
					<span>Volver</span>
				</Link>

				<h1 className="text-3xl font-bold text-foreground mb-4">
					Política de Privacidad
				</h1>

				<p className="text-sm text-muted-foreground mb-8">
					En Polaria nos comprometemos con la protección y el tratamiento
					responsable de los datos personales que se gestionan mediante nuestra
					plataforma. Esta Política de Privacidad explica qué información puede
					ser recopilada, para qué se utiliza, cómo puede ser tratada y qué
					papel desempeñan los servicios de terceros conectados a Polaria. Al
					utilizar Polaria, el usuario declara haber leído y comprendido esta
					Política de Privacidad.
				</p>

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						1. Definiciones
					</h2>

					<div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
						<p>
							<strong>Polaria</strong>: plataforma tecnológica destinada a
							proporcionar herramientas de gestión y atención para negocios.
						</p>

						<p>
							<strong>Usuario</strong>: persona que utiliza Polaria para
							gestionar un negocio o acceder a las funcionalidades disponibles.
						</p>

						<p>
							<strong>Negocio o Tenant</strong>: entidad o negocio que utiliza
							Polaria y cuyos datos se gestionan de manera independiente dentro
							de la plataforma.
						</p>

						<p>
							<strong>Cliente final</strong>: persona que interactúa con un
							negocio mediante sus canales de atención, realiza una reserva,
							proporciona información o participa en una conversación gestionada
							mediante Polaria.
						</p>

						<p>
							<strong>Datos personales</strong>: cualquier información que
							permita identificar o pueda estar relacionada con una persona.
						</p>

						<p>
							<strong>Servicios de terceros</strong>: plataformas externas
							conectadas o utilizadas mediante Polaria, como Google o
							Meta/WhatsApp.
						</p>
					</div>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						2. Información que puede ser tratada
					</h2>

					<div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
						<p>
							Dependiendo de las funcionalidades utilizadas, Polaria puede
							tratar a información proporcionada por el usuario o generada
							durante el uso de la plataforma.
						</p>

						<ul className="list-disc ml-5 space-y-2">
							<li>Nombre.</li>
							<li>Dirección de correo electrónico.</li>
							<li>Número de teléfono.</li>
							<li>Información básica relacionada con el negocio.</li>
							<li>Información de servicios ofrecidos.</li>
							<li>
								Información del personal o staff registrado por el negocio.
							</li>
							<li>Horarios comerciales.</li>
							<li>Información relacionada con reservas y citas.</li>
							<li>Información proporcionada por clientes finales.</li>
							<li>
								Mensajes y contenido de conversaciones gestionadas mediante la
								plataforma.
							</li>
							<li>
								Identificadores necesarios para operar determinadas
								integraciones.
							</li>
							<li>
								Información relacionada con la conexión de servicios externos
								autorizados por el usuario.
							</li>
							<li>
								Información técnica necesaria para garantizar el funcionamiento
								y seguridad de la plataforma.
							</li>
						</ul>

						<p>
							La información tratada dependerá de las funcionalidades que el
							usuario decida utilizar.
						</p>
					</div>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						3. Información obtenida mediante Google
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria permite utilizar mecanismos de autenticación proporcionados
						por Google. Cuando el usuario decide utilizar Google para iniciar
						sesión o conectar servicios compatibles, Polaria puede recibir y
						tratar la información que Google permita compartir de acuerdo con la
						autorización realizada por el usuario.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						El uso de los servicios de Google también está sujeto a las
						condiciones y políticas de privacidad de Google. Polaria no controla
						las prácticas de privacidad, disponibilidad o funcionamiento de los
						servicios de Google.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						4. Información relacionada con WhatsApp y Meta
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria puede integrarse con WhatsApp Business Platform y servicios
						proporcionados por Meta para permitir que los negocios conecten sus
						canales de comunicación.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Cuando un negocio conecta WhatsApp mediante las funcionalidades
						disponibles en Polaria, pueden tratarse datos necesarios para
						proporcionar dichas funciones, incluyendo información relacionada
						con:
					</p>

					<ul className="list-disc ml-5 space-y-2">
						<li>La cuenta empresarial conectada.</li>
						<li>El número de teléfono utilizado por el negocio.</li>
						<li>Identificadores técnicos asociados a la integración.</li>
						<li>Mensajes enviados o recibidos mediante WhatsApp.</li>
						<li>
							Información necesaria para identificar el negocio correspondiente.
						</li>
						<li>
							Información relacionada con conversaciones y atención de clientes.
						</li>
					</ul>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Los mensajes y demás información recibida mediante WhatsApp pueden
						almacenarse y procesarse dentro de Polaria cuando resulte necesario
						para proporcionar las funcionalidades de comunicación, atención y
						gestión de reservas.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						El tratamiento de información dentro del ecosistema de WhatsApp y
						Meta también está sujeto a las políticas, condiciones y reglas
						aplicables de dichos servicios. Polaria no es propietaria de
						WhatsApp ni de Meta y no controla sus servicios, políticas, APIs,
						disponibilidad o decisiones sobre sus plataformas.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						5. Finalidades del tratamiento
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						La información puede ser utilizada para las siguientes finalidades:
					</p>

					<ul className="list-disc ml-5 space-y-2">
						<li>Proporcionar y operar las funcionalidades de Polaria.</li>
						<li>Permitir la gestión de negocios y su información.</li>
						<li>Gestionar clientes y contactos registrados por el negocio.</li>
						<li>Gestionar servicios y personal.</li>
						<li>Gestionar horarios comerciales.</li>
						<li>Gestionar citas y reservas.</li>
						<li>
							Procesar y organizar conversaciones y mensajes relacionados con la
							atención del negocio.
						</li>
						<li>
							Permitir la integración con WhatsApp y otros servicios externos
							autorizados.
						</li>
						<li>Mantener la seguridad y funcionamiento de la plataforma.</li>
						<li>
							Detectar y prevenir usos indebidos, accesos no autorizados o
							actividades que puedan afectar a Polaria.
						</li>
						<li>
							Mantener la integridad de los datos correspondientes a cada
							negocio.
						</li>
						<li>Cumplir obligaciones legales cuando resulte aplicable.</li>
						<li>
							Realizar las operaciones técnicas necesarias para prestar las
							funcionalidades solicitadas por el usuario.
						</li>
					</ul>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Polaria no utilizará los datos para finalidades incompatibles con
						aquellas para las que fueron recopilados, salvo que exista una base
						legal que permita dicho tratamiento.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						6. Información de clientes finales
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Los negocios que utilizan Polaria pueden introducir información
						sobre sus propios clientes, incluyendo datos de contacto, reservas,
						conversaciones y otra información necesaria para prestar sus
						servicios.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						El negocio es responsable de garantizar que cuenta con las
						autorizaciones, bases legales o demás requisitos que correspondan
						para recopilar y utilizar dicha información.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Polaria actúa como plataforma tecnológica para gestionar esta
						información de acuerdo con las funcionalidades utilizadas por el
						negocio. El negocio debe evitar introducir información que no sea
						necesaria para la prestación de sus servicios o que no esté
						autorizado a tratar.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						7. Conversaciones y mensajes
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Cuando un negocio utiliza las funcionalidades de comunicación de
						Polaria, la plataforma puede procesar información relacionada con
						conversaciones y mensajes.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Esto puede incluir mensajes enviados por clientes finales al negocio
						y mensajes enviados por el negocio mediante las herramientas
						disponibles.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						La información puede ser utilizada para:
					</p>

					<ul className="list-disc ml-5 space-y-2">
						<li>Mantener el contexto de las conversaciones.</li>
						<li>Facilitar la atención al cliente.</li>
						<li>Gestionar solicitudes.</li>
						<li>Facilitar la gestión de reservas.</li>
						<li>
							Mantener registros necesarios para el funcionamiento de las
							funcionalidades utilizadas.
						</li>
					</ul>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						El contenido de las conversaciones puede contener información
						proporcionada directamente por los usuarios o clientes finales. El
						negocio es responsable del uso que realice de dicha información.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						8. Reservas y citas
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria permite a los negocios gestionar servicios, horarios,
						disponibilidad y reservas.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Para proporcionar estas funcionalidades, pueden tratarse datos
						relacionados con las citas, incluyendo información del cliente,
						servicio seleccionado, personal asignado, fecha, hora y demás
						información necesaria para gestionar la reserva.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Polaria proporciona herramientas tecnológicas para organizar esta
						información, pero el negocio continúa siendo responsable de la
						información que introduce y de la atención y prestación efectiva de
						los servicios reservados.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						9. Separación de información entre negocios
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria utiliza un modelo en el que cada negocio dispone de su
						propio espacio de información.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Los datos correspondientes a un negocio deben mantenerse separados
						de los datos correspondientes a otros negocios. El acceso a la
						información está sujeto a los mecanismos de autenticación,
						autorización y controles implementados por la plataforma.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Los usuarios no deben intentar acceder, consultar, modificar o
						utilizar información correspondiente a otro negocio.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						10. Servicios de terceros
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria puede depender de servicios externos para proporcionar
						determinadas funcionalidades. Entre ellos pueden encontrarse:
					</p>

					<ul className="list-disc ml-5 space-y-2">
						<li>Google y sus servicios de autenticación.</li>
						<li>Meta y WhatsApp Business Platform.</li>
						<li>
							Otros servicios externos que el usuario decida conectar mediante
							las funcionalidades disponibles.
						</li>
					</ul>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Cuando el usuario conecta un servicio externo, determinadas
						operaciones pueden requerir el intercambio de información entre
						Polaria y dicho proveedor.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						El tratamiento realizado directamente por dichos terceros se
						encuentra sujeto a sus propias políticas de privacidad y condiciones
						de servicio. Polaria no controla las prácticas de tratamiento de
						datos realizadas directamente por terceros.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						11. Información de autenticación y conexión con servicios externos
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Cuando el usuario conecta servicios externos con Polaria, pueden ser
						necesarios determinados datos técnicos o identificadores para
						mantener la conexión y permitir que las funcionalidades autorizadas
						continúen funcionando.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Estos datos se utilizan únicamente en la medida necesaria para
						proporcionar las funcionalidades correspondientes. El usuario puede
						dejar de utilizar o desconectar los servicios externos cuando las
						funcionalidades disponibles lo permitan.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						La revocación realizada directamente ante un proveedor externo puede
						afectar la capacidad de Polaria para continuar utilizando la
						integración correspondiente.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						12. Seguridad de la información
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria aplica medidas técnicas y organizativas razonables
						destinadas a proteger la información frente a accesos no
						autorizados, pérdida, alteración, divulgación o uso indebido.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Sin embargo, ningún sistema conectado a Internet puede garantizar
						una seguridad absoluta. El usuario también es responsable de
						mantener seguras sus credenciales y de utilizar la plataforma de
						manera responsable.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Si el usuario detecta un acceso no autorizado o un problema de
						seguridad relacionado con su cuenta, deberá comunicarlo mediante los
						canales disponibles.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						13. Conservación de la información
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria conservará la información durante el tiempo que resulte
						necesario para proporcionar las funcionalidades utilizadas, mantener
						la relación con el usuario, cumplir obligaciones legales o atender
						las necesidades legítimas relacionadas con la operación y seguridad
						de la plataforma.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Los períodos concretos de conservación pueden variar dependiendo del
						tipo de información y de la finalidad del tratamiento. Polaria no
						establece en esta política un período específico cuando dicho
						período no se encuentre definido de manera aplicable a la
						información correspondiente.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						14. Compartición de información
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria no comercializa los datos personales de los usuarios.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						La información puede ser comunicada o procesada por terceros cuando
						resulte necesario para:
					</p>

					<ul className="list-disc ml-5 space-y-2">
						<li>Proporcionar una funcionalidad solicitada por el usuario.</li>
						<li>Mantener una integración autorizada.</li>
						<li>
							Operar infraestructura o servicios necesarios para la plataforma.
						</li>
						<li>Cumplir obligaciones legales.</li>
						<li>Proteger la seguridad de Polaria, sus usuarios o terceros.</li>
					</ul>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Cuando el usuario conecta servicios como Google o Meta/WhatsApp,
						parte de la información puede ser procesada por dichos proveedores
						de acuerdo con sus propias condiciones y políticas.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						15. Responsabilidad del negocio sobre los datos
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						El negocio que utiliza Polaria es responsable de la información que
						introduce, administra o procesa mediante la plataforma.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Esto incluye, entre otros:
					</p>

					<ul className="list-disc ml-5 space-y-2">
						<li>Datos de clientes.</li>
						<li>Datos de empleados o staff.</li>
						<li>Información de servicios.</li>
						<li>Información de horarios.</li>
						<li>Reservas.</li>
						<li>Conversaciones.</li>
						<li>
							Información obtenida mediante canales de comunicación conectados.
						</li>
					</ul>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						El negocio debe asegurarse de que el tratamiento de dicha
						información sea legítimo y adecuado a las actividades que
						desarrolla.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						16. Derechos relacionados con los datos personales
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Dependiendo de la legislación aplicable, las personas pueden contar
						con derechos relacionados con sus datos personales, incluyendo
						aquellos relativos al acceso, actualización, rectificación,
						eliminación, oposición o limitación del tratamiento.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Las solicitudes relacionadas con datos personales podrán dirigirse
						al canal de contacto indicado en esta política. Para proteger la
						información y evitar solicitudes fraudulentas, Polaria podrá
						requerir información razonable para verificar la identidad de quien
						realiza una solicitud.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Los derechos concretos y las condiciones para ejercerlos dependerán
						de la legislación aplicable al caso.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						17. Cookies y tecnologías similares
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria puede utilizar mecanismos técnicos necesarios para permitir
						el funcionamiento de la plataforma y mantener determinadas
						funcionalidades.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						No se describen en esta política herramientas de publicidad,
						analítica o seguimiento que no hayan sido implementadas o
						confirmadas en la plataforma.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						En caso de que Polaria incorpore nuevas tecnologías de este tipo,
						esta política podrá actualizarse para reflejar su utilización cuando
						corresponda.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						18. Menores de edad
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria está orientada a la gestión de negocios y sus operaciones.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Los usuarios deben utilizar la plataforma de acuerdo con las leyes
						aplicables y con los requisitos de capacidad legal correspondientes
						a su situación.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Polaria no solicita deliberadamente información de menores para
						finalidades incompatibles con las funcionalidades de la plataforma.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						19. Cambios en esta Política de Privacidad
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Polaria podrá modificar esta Política de Privacidad cuando resulte
						necesario para reflejar cambios en:
					</p>

					<ul className="list-disc ml-5 space-y-2">
						<li>La plataforma.</li>
						<li>Las funcionalidades disponibles.</li>
						<li>Los servicios integrados.</li>
						<li>Los requisitos legales.</li>
						<li>Las prácticas de tratamiento de información.</li>
					</ul>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						La versión actualizada será publicada en esta misma página y
						mostrará su fecha de actualización.
					</p>
				</section>

				<Separator className="my-8" />

				<section className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						21. Aceptación
					</h2>

					<p className="text-sm text-muted-foreground leading-relaxed">
						Al utilizar Polaria, el usuario reconoce haber tenido acceso a esta
						Política de Privacidad y comprende de manera general las prácticas
						de tratamiento de información descritas en ella.
					</p>

					<p className="text-sm text-muted-foreground leading-relaxed mt-3">
						Esta política debe interpretarse conjuntamente con los Términos y
						Condiciones de Uso de Polaria.
					</p>
				</section>

				<div className="text-center pt-8 border-t">
					<p className="text-xs text-muted-foreground">
						Última actualización: 31 de julio de 2026
					</p>
					<p className="text-xs text-muted-foreground mt-1">© Polaria</p>
				</div>
			</div>
		</div>
	);
}
