CONFIGURACIÓN EN VERCEL

1. Importá este proyecto en Vercel.
2. En Project Settings > Environment Variables agregá:
   MERCADOPAGO_ACCESS_TOKEN = tu Access Token de Mercado Pago
3. Hacé un nuevo deploy.

El flujo ya queda preparado así:
Botón -> formulario Nombre/Apellido/Celular/Email -> Mercado Pago.

Productos configurados:
- Página personalizada: $98.000 ARS
- Reinicio de números: $11.000 ARS
- E-book: $6.500 ARS

IMPORTANTE
El webhook recibe las notificaciones de Mercado Pago, pero todavía no guarda las ventas en Google Sheets/Drive porque para eso hay que conectar la cuenta/destino correspondiente.
