export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ received: true });
  // Este endpoint recibe las notificaciones de Mercado Pago.
  // Para guardar las ventas en Google Sheets/Drive hay que conectar el destino elegido.
  return res.status(200).json({ received: true });
}
