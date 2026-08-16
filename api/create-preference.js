module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido.'
    });
  }

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
     * Los precios se definen en el servidor.
     * No confiamos en el precio enviado desde el navegador.
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
      }
    };

    const selectedProduct = products[product.name];

    if (!selectedProduct) {
      return res.status(400).json({
        error: 'Producto no válido.'
      });
    }

    const origin =
      `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

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

    if (!mp.ok) {
      console.error('Mercado Pago:', data);

      return res.status(mp.status).json({
        error:
          data.message ||
          'Mercado Pago rechazó la solicitud.'
      });
    }

    return res.status(200).json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      id: data.id
    });

  } catch (error) {

    console.error('Error creando preferencia:', error);

    return res.status(500).json({
      error: 'No se pudo crear el pago.'
    });
  }
};
