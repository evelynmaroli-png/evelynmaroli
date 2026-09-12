```javascript
module.exports = async function handler(req, res) {
  // Solo permitimos POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido.'
    });
  }

  // Token configurado en Vercel
  const token = process.env.MP_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'Falta configurar MP_ACCESS_TOKEN en Vercel.'
    });
  }

  try {
    const {
      product,
      nombre,
      apellido,
      celular,
      email
    } = req.body || {};

    // Validar datos recibidos
    if (
      !product ||
      !product.name ||
      !nombre ||
      !apellido ||
      !celular ||
      !email
    ) {
      return res.status(400).json({
        error: 'Faltan datos.'
      });
    }

    /*
     * PRECIOS DEFINIDOS EN EL SERVIDOR
     * No confiamos en el precio enviado por el navegador.
     */
    const products = {
      'Página personalizada para sorteo': {
        title: 'Página personalizada para sorteo',
        price: 98000
      },

      'Reinicio de números': {
        title: 'Reinicio de números',
        price: 11000
      },

      'E-book para emprendedores': {
        title: 'E-book para emprendedores',
        price: 6500
      },

      'Creación de tienda online': {
        title: 'Creación de tienda online',
        price: 120000
      },

      'Gestión de Paid Media': {
        title: 'Gestión de Paid Media',
        price: 250000
      }
    };

    // Buscar producto válido
    const selectedProduct = products[product.name];

    if (!selectedProduct) {
      return res.status(400).json({
        error: 'Producto no válido.'
      });
    }

    // Detectar dominio actual
    const origin =
      `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

    // Crear preferencia
    const preference = {
      items: [
        {
          title: selectedProduct.title,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: selectedProduct.price
        }
      ],

      payer: {
        name: nombre,
        surname: apellido,
        email: email
      },

      external_reference:
        `${Date.now()}-${selectedProduct.title
          .replace(/[^a-zA-Z0-9]/g, '-')
          .substring(0, 80)}`,

      metadata: {
        nombre,
        apellido,
        celular,
        email,
        producto: selectedProduct.title
      },

      back_urls: {
        success: `${origin}/?pago=exitoso`,
        pending: `${origin}/?pago=pendiente`,
        failure: `${origin}/?pago=rechazado`
      },

      auto_return: 'approved',

      notification_url:
        `${origin}/api/webhook`
    };

    // Enviar preferencia a Mercado Pago
    const mp = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(preference)
      }
    );

    const data = await mp.json();

    // Mostrar el error real de Mercado Pago en los logs de Vercel
    if (!mp.ok) {
      console.error('Mercado Pago rechazó la preferencia:', data);

      return res.status(mp.status).json({
        error:
          data.message ||
          data.error ||
          'Mercado Pago rechazó la solicitud.'
      });
    }

    console.log('Preferencia creada:', {
      id: data.id,
      init_point: !!data.init_point,
      sandbox_init_point: !!data.sandbox_init_point
    });

    // Devolver ambos enlaces al frontend
    return res.status(200).json({
      init_point: data.init_point || null,
      sandbox_init_point: data.sandbox_init_point || null,
      id: data.id
    });

  } catch (error) {
    console.error('Error creando preferencia:', error);

    return res.status(500).json({
      error: 'No se pudo crear el pago.'
    });
  }
};
```

**Pero ojo:** con este archivo solo no terminamos el cambio. En tu `index` tenés que modificar la parte que recibe la respuesta de `/api/create-preference`.

Tiene que quedar así:

```javascript
const result = await response.json();

if (!response.ok) {
  throw new Error(result.error || 'No se pudo crear el pago.');
}

const paymentUrl =
  result.sandbox_init_point || result.init_point;

if (!paymentUrl) {
  throw new Error('No se recibió el enlace de pago.');
}

window.location.href = paymentUrl;
```

Así, cuando estés probando con la credencial de prueba, **va a intentar usar `sandbox_init_point` primero**.

Si querés, también puedo agarrar **el `index-corregido-completo.html` que ya me habías pasado y decirte exactamente qué bloque reemplazar**, para que no tengas que buscarlo a mano.
