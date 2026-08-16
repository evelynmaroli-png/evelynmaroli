module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Falta configurar MERCADOPAGO_ACCESS_TOKEN en Vercel.' });
  }

  try {
    const { product, nombre, apellido, celular, email } = req.body || {};

    if (!product || !product.name || !product.price || !nombre || !apellido || !celular || !email) {
      return res.status(400).json({ error: 'Faltan datos.' });
    }

    const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

    const preference = {
      items: [
        {
          title: product.name,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Number(product.price)
        }
      ],
      payer: {
        name: nombre,
        surname: apellido,
        email
      },
      external_reference: `${Date.now()}-${String(product.name).replace(/[^a-zA-Z0-9]/g, '-')}`,
      metadata: {
        nombre,
        apellido,
        celular,
        email,
        producto: product.name
      },
      back_urls: {
        success: `${origin}/?pago=exitoso`,
        pending: `${origin}/?pago=pendiente`,
        failure: `${origin}/?pago=rechazado`
      },
      auto_return: 'approved',
      notification_url: `${origin}/api/webhook`
    };

    const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await mp.json();

    if (!mp.ok) {
      return res.status(mp.status).json({
        error: data.message || 'Mercado Pago rechazó la solicitud.'
      });
    }

    return res.status(200).json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      id: data.id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo crear el pago.' });
  }
};
