const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { items } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

    const line_items = items.map(item => ({
      quantity: item.qty,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.price * 100),
        product_data: { name: item.name }
      }
    }));

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const freeShipping = subtotal >= 20;

    const shipping_options = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: freeShipping ? 0 : 599, currency: 'usd' },
          display_name: freeShipping ? 'Free Shipping' : 'Standard Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 }
          }
        }
      }
    ];

    const origin = req.headers.origin || req.headers.referer || '';
    const base = origin.replace(/\/$/, '').split('/').slice(0, 3).join('/');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX', 'GB', 'AU']
      },
      shipping_options,
      automatic_tax: { enabled: true },
      success_url: base + '/success.html',
      cancel_url:  base + '/checkout.html',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
