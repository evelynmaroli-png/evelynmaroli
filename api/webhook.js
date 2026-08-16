module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido.'
    });
  }

  try {
    const notification = req.body || {};

    // Solo procesamos notificaciones de pagos
    if (
      notification.type !== 'payment' &&
      notification.action !== 'payment.updated'
    ) {
      return res.status(200).json({
        received: true,
        ignored: true
      });
    }

    const paymentId =
      notification.data &&
      notification.data.id;

    if (!paymentId) {
      return res.status(200).json({
        received: true,
        ignored: true
      });
    }

    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      console.error('Falta MP_ACCESS_TOKEN');

      return res.status(500).json({
        error: 'Falta configurar MP_ACCESS_TOKEN.'
      });
    }

    // Consultamos directamente a Mercado Pago
    // para obtener el estado real del pago.
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const payment = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('Error Mercado Pago:', payment);

      return res.status(500).json({
        error: 'No se pudo consultar el pago.'
      });
    }

    const metadata = payment.metadata || {};

    const appsScriptUrl =
      'https://script.google.com/macros/s/AKfycbxxhEvtZW6O_KJYvQ09KFbYrb-Cvc0s_KBoWxV3weJyU7c3CBdzy3uGooOf_GD5Qz-e/exec';

    // Enviamos la información verificada a Google Sheets
    const sheetsResponse = await fetch(
      appsScriptUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: metadata.nombre || '',
          apellido: metadata.apellido || '',
          celular: metadata.celular || '',
          email: metadata.email || '',
          producto: metadata.producto || '',
          importe: payment.transaction_amount || '',
          estado: payment.status || '',
          id_pago: String(payment.id || ''),
          referencia: payment.external_reference || ''
        })
      }
    );

    const sheetsResult = await sheetsResponse.text();

    console.log('Google Sheets:', sheetsResult);

    return res.status(200).json({
      received: true,
      payment_id: payment.id,
      status: payment.status
    });

  } catch (error) {
    console.error('Webhook error:', error);

    return res.status(500).json({
      error: 'Error procesando la notificación.'
    });
  }
};
