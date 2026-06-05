export const situaciones = [
  {
    "id": "situacion_001",
    "categoria": "llamada",
    "titulo": "Te llama el banco",
    "descripcion_breve": "Una persona dice ser del Banco Provincia",
    "contenido": {
      "tipo": "transcripcion_llamada",
      "emisor": "Martín García (Banco Provincia)",
      "texto": "Buenos días, le habla Martín García del área de seguridad del Banco Provincia. Detectamos un movimiento inusual de transferencia en su cuenta por 150.000 pesos. Para anularla y proteger su dinero, necesito que me confirme su clave de 6 dígitos del homebanking de inmediato."
    },
    "opciones": [
      { "id": "A", "texto": "Le paso la clave para evitar perder mi plata", "es_correcto": false },
      { "id": "B", "texto": "No le doy nada, le digo que no comparto mis claves y le corto", "es_correcto": true }
    ],
    "feedback_correcto": "¡Exacto! Ningún banco te va a pedir tu clave por teléfono, jamás. Si te apuran o te meten miedo diciendo que vas a perder dinero, es una estafa. Hiciste muy bien en cortar.",
    "feedback_incorrecto": "Esta vez te engañaron. Es normal asustarse cuando te dicen que perdés dinero, pero recordá: los estafadores usan el apuro. El banco NUNCA te pide claves para anular operaciones.",
    "red_flag_destacada": "Te apuran y te piden tu clave — ningún banco te pide claves por teléfono.",
    "es_estafa": true
  },
  {
    "id": "situacion_002",
    "categoria": "llamada",
    "titulo": "Trámite de ANSES",
    "descripcion_breve": "Llamada sobre una supuesta jubilación o turno",
    "contenido": {
      "tipo": "transcripcion_llamada",
      "emisor": "Supuesto agente de ANSES",
      "texto": "Hola, ¿hablo con el titular? Le llamamos de ANSES. Vimos que se le venció el plazo para cobrar el reajuste histórico de su jubilación. Necesitamos que vaya ahora mismo a un cajero automático y nos pase el ticket que sale al poner su tarjeta para reasignarle el cobro hoy mismo."
    },
    "opciones": [
      { "id": "A", "texto": "Voy al cajero y hago lo que me piden para no perder el beneficio", "es_correcto": false },
      { "id": "B", "texto": "Le digo que voy a ir en persona a la oficina de ANSES y le corto", "es_correcto": true }
    ],
    "feedback_correcto": "¡Excelente decisión! ANSES jamás te va a pedir hacer trámites apurados en el cajero automático ni te va a pedir claves por teléfono. Ir a la oficina oficial o verificar con un familiar es lo correcto.",
    "feedback_incorrecto": "Te engañaron esta vez. Los estafadores simulan ser del gobierno para ganarse tu confianza. Ningún organismo público te pide claves ni te manda al cajero por teléfono.",
    "red_flag_destacada": "Te piden ir al cajero y darles datos — ANSES no hace esto por teléfono.",
    "es_estafa": true
  },
  {
    "id": "situacion_003",
    "categoria": "llamada",
    "titulo": "Soporte de Mercado Pago",
    "descripcion_breve": "Te llaman por un supuesto hackeo",
    "contenido": {
      "tipo": "transcripcion_llamada",
      "emisor": "Soporte de Mercado Pago",
      "texto": "Hola, le hablo del departamento de ciberseguridad de Mercado Pago. Su cuenta está intentando ser abierta desde otra provincia. Le acabamos de enviar un mensaje de texto con un código de 6 números. Por favor, dígame ese código rápido para que podamos bloquear el acceso ajeno."
    },
    "opciones": [
      { "id": "A", "texto": "Le leo el código de 6 números que me llegó al celular", "es_correcto": false },
      { "id": "B", "texto": "No le digo el código. Le respondo que es privado y le corto", "es_correcto": true }
    ],
    "feedback_correcto": "¡Perfecto! Ese código de 6 números sirve para entrar a tu cuenta. Si se lo das, entran ellos y te roban tu dinero. El código que te llega por SMS es tuyo y de nadie más.",
    "feedback_incorrecto": "Esta vez caíste. Los estafadores te asustan diciendo que te hackearon, y luego te piden el código SMS. Con ese código ellos ingresan y cambian tus contraseñas.",
    "red_flag_destacada": "Te piden un código SMS — esos códigos son personales y secretos.",
    "es_estafa": true
  },
  {
    "id": "situacion_004",
    "categoria": "llamada",
    "titulo": "Turno de Vacunación",
    "descripcion_breve": "Ministerio de Salud te llama por la vacuna",
    "contenido": {
      "tipo": "transcripcion_llamada",
      "emisor": "Supuesto agente de Salud",
      "texto": "Buenas tardes, nos comunicamos del Ministerio de Salud para confirmar su turno de la vacuna de refuerzo para mañana por la mañana. Para asignarle el centro médico más cercano, le va a llegar un código de verificación por WhatsApp. Por favor, dictámelo."
    },
    "opciones": [
      { "id": "A", "texto": "Le dicto el código para asegurar mi turno", "es_correcto": false },
      { "id": "B", "texto": "Sospecho del pedido, le digo que voy a revisar el turno por la web oficial y corto", "es_correcto": true }
    ],
    "feedback_correcto": "¡Brillante! Te querían robar tu cuenta de WhatsApp. Al pedirte el código que te llegó, intentan instalar tu WhatsApp en otro teléfono para pedirle dinero prestado a tus contactos.",
    "feedback_incorrecto": "Te engañaron. Los estafadores usan temas sensibles como la salud y las vacunas para engañarte. Nunca le dictes a nadie códigos que te lleguen al teléfono.",
    "red_flag_destacada": "Piden códigos para 'confirmar turnos' — es una trampa para robarte el WhatsApp.",
    "es_estafa": true
  },
  {
    "id": "situacion_005",
    "categoria": "whatsapp",
    "titulo": "Familiar en apuros",
    "descripcion_breve": "Un mensaje de un número no guardado",
    "contenido": {
      "tipo": "whatsapp_chat",
      "remitente": "+54 9 11 3456-7890",
      "avatar": "👤",
      "mensajes": [
        { "emisor": "otro", "texto": "Hola má, agendá mi nuevo número. Tuve un problema con el otro celu y lo perdí." },
        { "emisor": "otro", "texto": "Che má, te hago una pregunta... ¿Tendrás para transferirme 50 mil pesos que tengo que pagar una cuenta urgente ahora y no me anda la app del banco? Mañana te los devuelvo sin falta." }
      ]
    },
    "opciones": [
      { "id": "A", "texto": "Le transfiero rápido porque es mi hijo y necesita ayuda", "es_correcto": false },
      { "id": "B", "texto": "Lo llamo por teléfono al número de siempre para ver si es él de verdad", "es_correcto": true }
    ],
    "feedback_correcto": "¡Excelente! Llamar al número habitual de tu familiar es la mejor forma de verificar. Los estafadores consiguen fotos de perfil y mienten diciendo que cambiaron de número para pedir plata.",
    "feedback_incorrecto": "Esta vez caíste. Siempre que un conocido te pida dinero desde un número desconocido, verificalo llamándolo a su número de siempre o en persona antes de transferir.",
    "red_flag_destacada": "Número nuevo y pedido urgente de dinero — confirmá siempre antes de enviar.",
    "es_estafa": true
  },
  {
    "id": "situacion_006",
    "categoria": "whatsapp",
    "titulo": "Sorteo del Supermercado",
    "descripcion_breve": "Premio sorpresa de COTO",
    "contenido": {
      "tipo": "whatsapp_chat",
      "remitente": "Premios Coto Oficial (no verificado)",
      "avatar": "🛒",
      "mensajes": [
        { "emisor": "otro", "texto": "¡FELICITACIONES! 🥳 Tu línea telefónica salió seleccionada con una orden de compra por $300.000 en Supermercados COTO." },
        { "emisor": "otro", "texto": "Para acreditar el premio en tu cuenta bancaria, por favor envianos una foto de frente y dorso de tu DNI y una foto de tu tarjeta de débito para validar la transferencia." }
      ]
    },
    "opciones": [
      { "id": "A", "texto": "Le mando las fotos para poder usar la orden de compra", "es_correcto": false },
      { "id": "B", "texto": "Sospecho porque no me anoté en ningún sorteo. No mando nada y los bloqueo", "es_correcto": true }
    ],
    "feedback_correcto": "¡Muy bien! Si no participaste de un sorteo, no ganaste nada. Además, jamás hay que enviar fotos de tarjetas ni del DNI por chat; con eso pueden sacar préstamos a tu nombre.",
    "feedback_incorrecto": "Esta vez caíste. Los premios falsos son ganchos para robarte identidad y datos bancarios. Ningún supermercado te va a pedir fotos de tarjetas por chat.",
    "red_flag_destacada": "Premio inesperado que te pide fotos de DNI y tarjetas — es fraude.",
    "es_estafa": true
  },
  {
    "id": "situacion_007",
    "categoria": "whatsapp",
    "titulo": "Mensaje de WhatsApp del Banco",
    "descripcion_breve": "Problema con tu cuenta de homebanking",
    "contenido": {
      "tipo": "whatsapp_chat",
      "remitente": "Soporte Banco Galicia",
      "avatar": "🏦",
      "mensajes": [
        { "emisor": "otro", "texto": "Estimado cliente: Se ha detectado un inicio de sesión no autorizado en su cuenta. Por seguridad, su clave BIP ha sido bloqueada temporalmente." },
        { "emisor": "otro", "texto": "Para restablecer su acceso y desbloquear la cuenta, ingrese a nuestro portal de seguridad aquí: http://galicia-seguridad-bip.com/login" }
      ]
    },
    "opciones": [
      { "id": "A", "texto": "Toco el enlace para desbloquear mi cuenta rápido", "es_correcto": false },
      { "id": "B", "texto": "No toco el enlace. Abro la aplicación oficial del banco para ver si está todo bien", "es_correcto": true }
    ],
    "feedback_correcto": "¡Excelente! Los bancos oficiales no te envían enlaces por WhatsApp ni SMS para restablecer claves. Acceder por fuera de los mensajes usando la aplicación oficial es la conducta más segura.",
    "feedback_incorrecto": "Esta vez caíste. Los enlaces que te mandan por mensaje dirigen a páginas web falsas que imitan al banco para robarte la clave cuando la escribís.",
    "red_flag_destacada": "Enlace en mensaje para solucionar un bloqueo — los bancos no mandan enlaces.",
    "es_estafa": true
  },
  {
    "id": "situacion_008",
    "categoria": "whatsapp",
    "titulo": "Envío de Correo Argentino",
    "descripcion_breve": "Un paquete que no se puede entregar",
    "contenido": {
      "tipo": "whatsapp_chat",
      "remitente": "Correo Argentino Notificaciones",
      "avatar": "📦",
      "mensajes": [
        { "emisor": "otro", "texto": "CORREO ARGENTINO: Su envío nacional con código AR-7382-91 no pudo ser entregado debido a que la dirección de domicilio indicada está incompleta." },
        { "emisor": "otro", "texto": "Para actualizar su dirección de envío y pagar la tasa de reprogramación ($150), ingrese a: http://correo-ar-reprogramaciones.com" }
      ]
    },
    "opciones": [
      { "id": "A", "texto": "Entro al enlace y pongo mis datos de tarjeta para pagar los $150", "es_correcto": false },
      { "id": "B", "texto": "No toco nada. No estoy esperando un paquete y sospecho de la dirección web", "es_correcto": true }
    ],
    "feedback_correcto": "¡Perfecto! Es una estafa muy común. Te piden un monto mínimo de $150 pero lo que buscan es que pongas los datos de tu tarjeta de crédito en su página web falsa para clonarla.",
    "feedback_incorrecto": "Te engañaron esta vez. La pequeña suma de $150 es un anzuelo. Al poner tu tarjeta, les regalás el acceso a todos tus fondos.",
    "red_flag_destacada": "Piden pago por reprogramar paquete con enlace externo — es una estafa.",
    "es_estafa": true
  },
  {
    "id": "situacion_009",
    "categoria": "sms",
    "titulo": "SMS de Cuenta Bloqueada",
    "descripcion_breve": "Un mensaje de texto preocupante",
    "contenido": {
      "tipo": "sms_texto",
      "remitente": "88200",
      "texto": "AVISO BANCO SUPERVIELLE: Por motivos de seguridad, suspendimos preventivamente su cuenta de homebanking. Ingrese YA aquí para reactivar: https://supervielle-web-bip.com"
    },
    "opciones": [
      { "id": "A", "texto": "Pienso que es el banco y toco el enlace para reactivar", "es_correcto": false },
      { "id": "B", "texto": "Borro el mensaje. El banco no me manda enlaces por mensaje de texto", "es_correcto": true }
    ],
    "feedback_correcto": "¡Muy bien! Los bancos nunca te van a mandar enlaces para reactivar cuentas por mensaje de texto. Siempre que tengas dudas, ingresá a la app oficial directamente.",
    "feedback_incorrecto": "Te engañaron. El enlace imita al banco de verdad, pero es una trampa. Si ponés tus datos ahí, los estafadores podrán vaciarte la cuenta.",
    "red_flag_destacada": "Enlace en SMS para solucionar una urgencia — es fraude.",
    "es_estafa": true
  },
  {
    "id": "situacion_010",
    "categoria": "sms",
    "titulo": "SMS de Mercado Pago",
    "descripcion_breve": "Aviso de compra de alto valor",
    "contenido": {
      "tipo": "sms_texto",
      "remitente": "44300",
      "texto": "MERCADO PAGO: Se autorizó una compra por $240.000 en 'Frávega Electrónica'. Si desconoce esta transacción urgente, ingrese a: http://mercadopago.desconocimientos-seguros.com"
    },
    "opciones": [
      { "id": "A", "texto": "Entro desesperado al enlace para cancelar la compra falsa", "es_correcto": false },
      { "id": "B", "texto": "Ignoro el enlace, abro la app oficial de Mercado Pago y reviso mi historial", "es_correcto": true }
    ],
    "feedback_correcto": "¡Gran decisión! Los estafadores juegan con el susto de compras millonarias para que entres rápido y pongas tus claves bancarias. Revisar tu app oficial te salvó.",
    "feedback_incorrecto": "Esta vez caíste. Los delincuentes envían compras falsas caras para asustarte y hacer que entres a sus enlaces maliciosos. Abrí siempre tu app para verificar.",
    "red_flag_destacada": "Compra sospechosa con enlace para desconocer — los enlaces son trampas.",
    "es_estafa": true
  },
  {
    "id": "situacion_011",
    "categoria": "sms",
    "titulo": "Alerta consumo Visa",
    "descripcion_breve": "Mensaje de tu tarjeta de crédito",
    "contenido": {
      "tipo": "sms_texto",
      "remitente": "VisaAlerta",
      "texto": "VISA INFOCARD: Compra aprobada por $185.000 en COTO DIGITAL. Para desconocer consumo haga clic en: https://visa-seguridad-ar.com"
    },
    "opciones": [
      { "id": "A", "texto": "Pienso que me clonaron la tarjeta, hago clic para frenarla", "es_correcto": false },
      { "id": "B", "texto": "No toco nada. Llamo al número oficial de atención al cliente de mi tarjeta", "es_correcto": true }
    ],
    "feedback_correcto": "¡Exacto! El número de atención oficial está atrás de tu tarjeta física. Llamar ahí es la forma más segura de constatar los consumos de tu tarjeta de crédito.",
    "feedback_incorrecto": "Esta vez caíste. Al hacer clic e ingresar los datos de tu tarjeta para 'anular' la compra, en realidad les estás regalando tus números para que compren de verdad.",
    "red_flag_destacada": "SMS de la tarjeta con enlace de cancelación — llamá siempre al número de tu tarjeta.",
    "es_estafa": true
  },
  {
    "id": "situacion_012",
    "categoria": "legitima",
    "titulo": "Token del Banco Provincia",
    "descripcion_breve": "Código que pediste para ingresar",
    "contenido": {
      "tipo": "sms_texto",
      "remitente": "BAPRO",
      "texto": "Tu código de verificación de Banco Provincia es 729103. Recuerde que el banco jamás le pedirá este código por llamada o mensaje. Válido por 5 minutos."
    },
    "opciones": [
      { "id": "A", "texto": "Lo considero estafa y no uso el código en mi homebanking", "es_correcto": false },
      { "id": "B", "texto": "Es legítimo si acabo de pedirlo yo mismo para hacer una operación", "es_correcto": true }
    ],
    "feedback_correcto": "¡Muy bien! Si vos estabas haciendo la operación y te llegó el mensaje, es legítimo. La clave es que es tuyo: usalo en la página oficial del banco, pero nunca se lo digas a nadie por teléfono.",
    "feedback_incorrecto": "Esta vez te equivocaste. Si vos iniciaste la acción, el código es real y necesario para avanzar. Es seguro usarlo en la app del banco, solo es peligroso si se lo pasás a otra persona.",
    "red_flag_destacada": "Código solicitado por vos — es seguro usarlo en la web oficial.",
    "es_estafa": false
  },
  {
    "id": "situacion_013",
    "categoria": "legitima",
    "titulo": "Confirmación de Turno PAMI",
    "descripcion_breve": "Turno médico en tu celular",
    "contenido": {
      "tipo": "sms_texto",
      "remitente": "PAMI",
      "texto": "PAMI INFORMA: Turno asignado para Oftalmología el día 18/06 a las 11:30 hs con el Dr. Rossi en el Consultorio de Av. Belgrano 2345. Presentarse con DNI."
    },
    "opciones": [
      { "id": "A", "texto": "Es un mensaje legítimo, solo me avisa del turno y no me pide nada", "es_correcto": true },
      { "id": "B", "texto": "Es una estafa, seguro quieren robarme algo", "es_correcto": false }
    ],
    "feedback_correcto": "¡Perfecto! Es un mensaje legítimo. Los avisos que solo informan, no contienen enlaces extraños y no te piden claves, códigos ni dinero, son seguros y oficiales.",
    "feedback_incorrecto": "Esta vez te equivocaste por desconfiar de más. Este mensaje es informativo, no pide ningún dato sensible, ni tiene enlaces. Es un recordatorio legítimo de PAMI.",
    "red_flag_destacada": "Mensaje informativo sin enlaces ni pedidos de datos — es seguro.",
    "es_estafa": false
  },
  {
    "id": "situacion_014",
    "categoria": "legitima",
    "titulo": "Paquete Entregado de Mercado Libre",
    "descripcion_breve": "Notificación de compra realizada",
    "contenido": {
      "tipo": "notificacion",
      "remitente": "Mercado Libre",
      "texto": "¡Tu compra ya fue entregada! Dejamos el paquete de 'Pava Eléctrica Philips' en tu domicilio. Contanos qué te pareció el producto."
    },
    "opciones": [
      { "id": "A", "texto": "Es una notificación legítima sobre algo que compré", "es_correcto": true },
      { "id": "B", "texto": "Es una estafa, quieren sacarme datos", "es_correcto": false }
    ],
    "feedback_correcto": "¡Muy bien! Las notificaciones dentro de la app o avisos sencillos sobre compras reales que vos hiciste son legítimos. No te piden contraseñas ni pins.",
    "feedback_incorrecto": "Te equivocaste. Si vos compraste ese producto y te llegó a tu casa, la notificación es real. Es segura porque no te pide ingresar datos sensibles ni tiene enlaces externos.",
    "red_flag_destacada": "Aviso informativo interno sobre compras reales — es legítimo.",
    "es_estafa": false
  },
  {
    "id": "situacion_015",
    "categoria": "legitima",
    "titulo": "Resumen de Cuenta BIP",
    "descripcion_breve": "Aviso mensual del banco",
    "contenido": {
      "tipo": "sms_texto",
      "remitente": "Banco Provincia",
      "texto": "BANCO PROVINCIA: Tu resumen de cuenta de la tarjeta Visa de Mayo ya se encuentra disponible para consultar. Podés acceder de forma segura a través de la app BIP oficial."
    },
    "opciones": [
      { "id": "A", "texto": "Es legítimo. Me avisa dónde ingresar de forma segura sin darme un enlace", "es_correcto": true },
      { "id": "B", "texto": "Es estafa. Seguro es mentira para que entre a mi cuenta", "es_correcto": false }
    ],
    "feedback_correcto": "¡Exacto! Es legítimo. El banco te avisa que entres vos mismo por la aplicación oficial, sin mandarte un enlace directo. Esa es una buena práctica del banco real.",
    "feedback_incorrecto": "Te equivocaste. El mensaje es legítimo justamente porque NO te incluye un enlace directo para robarte las claves. Te sugiere ingresar por la vía oficial, lo cual es muy seguro.",
    "red_flag_destacada": "Te avisa pero no te manda enlaces, te dice que uses la app oficial — es legítimo.",
    "es_estafa": false
  }
]
