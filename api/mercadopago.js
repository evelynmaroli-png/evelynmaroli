module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Método no permitido.'
    });
  }

  const token = process.env.MP_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({
      ok: false,
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
        ok: false,
        error: 'Faltan datos del cliente o del producto.'
      });
    }

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

    const selectedProduct = products[product.name];

    if (!selectedProduct) {
      return res.status(400).json({
        ok: false,
        error: 'Producto no válido.'
      });
    }

    const protocol =
      req.headers['x-forwarded-proto'] || 'https';

    const host =
      req.headers.host || process.env.VERCEL_URL;

    if (!host) {
      return res.status(500).json({
        ok: false,
        error: 'No se pudo determinar la URL del sitio.'
      });
    }

    const origin = `${protocol}://${host}`;

    const externalReference =
      `MP-${Date.now()}-${selectedProduct.title
        .replace(/[^a-zA-Z0-9]/g, '-')
        .substring(0, 60)}`;

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

      external_reference: externalReference,

      metadata: {
        nombre,
        apellido,
        celular,
        email,
        producto: selectedProduct.title,
        importe: selectedProduct.price
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

    const mpResponse = await fetch(
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

    const rawResponse = await mpResponse.text();

    let mpData = {};

    try {
      mpData = rawResponse
        ? JSON.parse(rawResponse)
        : {};
    } catch (parseError) {
      console.error(
        'Mercado Pago devolvió una respuesta no JSON:',
        rawResponse
      );

      return res.status(502).json({
        ok: false,
        error: 'Mercado Pago devolvió una respuesta inesperada.'
      });
    }

    if (!mpResponse.ok) {
      console.error(
        'Mercado Pago rechazó la preferencia:',
        mpData
      );

      return res.status(mpResponse.status).json({
        ok: false,
        error:
          mpData.message ||
          mpData.error ||
          'Mercado Pago rechazó la solicitud.'
      });
    }

    const paymentUrl =
      mpData.init_point ||
      mpData.sandbox_init_point ||
      null;

    if (!paymentUrl) {
      console.error(
        'Mercado Pago no devolvió init_point:',
        mpData
      );

      return res.status(502).json({
        ok: false,
        error: 'Mercado Pago no devolvió el enlace de pago.'
      });
    }

    console.log('Preferencia Mercado Pago creada:', {
      id: mpData.id,
      external_reference: externalReference
    });

    return res.status(200).json({
      ok: true,
      id: mpData.id,
      init_point: mpData.init_point || null,
      sandbox_init_point: mpData.sandbox_init_point || null
    });

  } catch (error) {
    console.error(
      'Error creando preferencia de Mercado Pago:',
      error
    );

    return res.status(500).json({
      ok: false,
      error: 'No se pudo crear el pago con Mercado Pago.'
    });
  }
};
