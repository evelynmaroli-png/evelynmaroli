# CONFIGURACIÓN EN VERCEL

## 1. Importar el proyecto

Importá este proyecto en Vercel.

La estructura del proyecto es:

* `index.html`
* `api/create-preference.js`
* `api/webhook.js`

No es necesario utilizar `vercel.json`. Vercel detecta automáticamente las funciones Node.js ubicadas dentro de la carpeta `/api`.

---

## 2. Configurar Mercado Pago

En Vercel ingresá a:

**Project Settings → Environment Variables**

Agregá la siguiente variable:

```text
MP_ACCESS_TOKEN = tu Access Token privado de Mercado Pago
```

### IMPORTANTE

El nombre debe ser exactamente:

```text
MP_ACCESS_TOKEN
```

Esto coincide con el código de:

```text
api/create-preference.js
```

y:

```text
api/webhook.js
```

No uses `MERCADOPAGO_ACCESS_TOKEN` si el código está utilizando `MP_ACCESS_TOKEN`.

**Nunca publiques el Access Token en GitHub ni lo coloques dentro de `index.html`.**

---

## 3. Hacer un nuevo deploy

Después de agregar o modificar `MP_ACCESS_TOKEN`:

1. Guardá la variable en Vercel.
2. Andá a **Deployments**.
3. Hacé un nuevo **Redeploy** del proyecto.

Esto es necesario para que la función `/api` pueda utilizar la nueva variable de entorno.

---

## 4. Flujo de compra

El flujo queda preparado de la siguiente manera:

```text
Botón de compra
       ↓
Formulario
Nombre
Apellido
Celular
Email
       ↓
/api/create-preference.js
       ↓
Mercado Pago Checkout Pro
       ↓
Pago
       ↓
Mercado Pago envía notificación
       ↓
/api/webhook.js
       ↓
Mercado Pago verifica el pago
       ↓
Google Apps Script
       ↓
Google Sheets
```

---

## 5. Productos configurados

### Página personalizada para sorteo

**$98.000 ARS**

### Reinicio de números

**$11.000 ARS**

### E-book para emprendedores

**$6.500 ARS**

### Otros servicios configurados

**Creación de tienda online:** $120.000 ARS

**Gestión de Paid Media:** $250.000 ARS

---

## 6. Google Sheets

El webhook está preparado para enviar a Google Sheets la información del pago verificado.

Los datos enviados incluyen:

* Nombre
* Apellido
* Celular
* Email
* Producto
* Importe
* Estado del pago
* ID del pago
* Referencia

El envío se realiza mediante Google Apps Script.

---

## 7. Importante sobre las pruebas de Mercado Pago

Para realizar pruebas de Checkout Pro se deben utilizar las cuentas y credenciales de prueba correspondientes de Mercado Pago.

La cuenta utilizada como vendedor y la cuenta utilizada como comprador deben estar correctamente configuradas para el entorno de prueba.

Si Mercado Pago muestra:

**“Una de las partes con la que intentás hacer el pago es de prueba.”**

hay que revisar que la cuenta vendedora, la cuenta compradora y las credenciales utilizadas correspondan al mismo entorno de prueba.

No es necesario
