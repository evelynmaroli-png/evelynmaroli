module.exports = async function handler(req, res) {
  // Mercado Pago puede enviar notificaciones por POST.
  // La confirmación definitiva del pago se implementará en el siguiente paso.
  return res.status(200).json({ received: true });
};
