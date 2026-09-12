module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido.'
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

    // Precios definidos en el servidor.
    const products = {
      'Página personalizada para sorteo': 98000,
      'Reinicio de números': 11000,
      'E-book para emprendedores': 6500,
      'Creación de tienda online': 120000,
      'Gestión de Paid Media': 250000
    };

    const price = products[product.name];

    if (!price) {
      return res.status(400).json({
        error: 'Producto no válido.'
      });
    }

    // URL de tu Google Apps Script
    const appsScriptUrl =
      'https://script.google.com/macros/s/AKfycbwBtJ2C_sqQXPg-yr_FV2GS9oxJoqNJiNZxIJg5i-6PHQxP11eovvbVFPNcKUrKErX8/exec';

    // Referencia única para identificar esta transferencia.
    const referencia =
      `TRF-${Date.now()}-${product.name
        .replace(/[^a-zA-Z0-9]/g, '-')
        .substring(0, 50)}`;

    // Envía los datos a Google Apps Script.
    const sheetsResponse = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre,
        apellido,
        celular,
        email,
        producto: product.name,
        importe: price,
        estado: 'pendiente',
        metodo_pago: 'Transferencia bancaria',
        id_pago: '',
        referencia
      })
    });

    const sheetsResult = await sheetsResponse.text();

    console.log(
      'Google Sheets transferencia:',
      sheetsResult
    );

    if (!sheetsResponse.ok) {
      return res.status(502).json({
        ok: false,
        error: 'Google no pudo registrar la transferencia.'
      });
    }

    return res.status(200).json({
      ok: true,
      referencia
    });

  } catch (error) {

    console.error(
      'Error registrando transferencia:',
      error
    );

    return res.status(500).json({
      ok: false,
      error: 'Error registrando la transferencia.'
    });
  }
};
