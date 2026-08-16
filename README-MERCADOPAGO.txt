EVELYN MAROLI — VERCEL + MERCADO PAGO

Esta versión no incluye vercel.json a propósito: Vercel detecta automáticamente las funciones Node.js ubicadas en /api.

Para activar Mercado Pago:
1. En Vercel > Settings > Environment Variables, crear:
   MERCADOPAGO_ACCESS_TOKEN
2. Pegá allí tu Access Token privado de Mercado Pago.
3. Hacé Redeploy del proyecto.

Estructura:
- index.html
- api/create-preference.js
- api/webhook.js

No publiques el Access Token en GitHub ni dentro de index.html.
