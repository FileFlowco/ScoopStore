# Xsupply Store — Setup Guide

## Files
```
xsupply/
├── index.html          ← Homepage
├── product.html        ← Product page (all 3 products via ?id=scoop1|scoop3|keychain)
├── checkout.html       ← Checkout with Stripe
├── success.html        ← Order confirmed page
├── info.html           ← Shipping / Returns / Contact / Privacy
├── css/style.css       ← All styles
├── js/cart.js          ← Cart, auth modal, toast, nav logic
├── api/checkout.js     ← Stripe serverless function (Vercel)
├── assets/             ← Product images & video
├── vercel.json         ← Vercel routing config
└── package.json        ← Dependencies (stripe)
```

## Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import your repo
3. Add environment variable in Vercel dashboard:
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_live_your_key_here`
4. In `checkout.html`, replace:
   ```
   const STRIPE_PUBLISHABLE_KEY = 'pk_live_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY';
   ```
   with your actual Stripe publishable key (starts with `pk_live_`)

## Stripe Keys
- Dashboard: https://dashboard.stripe.com/apikeys
- Secret key → Vercel env var `STRIPE_SECRET_KEY`
- Publishable key → `checkout.html` line with `STRIPE_PUBLISHABLE_KEY`

## Google Analytics
- Already wired to G-2JP67WX64Y on all pages
- To change: find/replace `G-2JP67WX64Y` with your GA4 measurement ID

## Auth / Login
- Built-in email sign-up/login with localStorage persistence
- "Sign In" button in nav on all pages
- Google OAuth button is a placeholder — wire up Firebase/Auth0 if needed

## Discount Codes
In `checkout.html`, codes are:
- `XSUPPLY10` → 10% off
- `SAVE20` → 20% off  
- `WELCOME` → 15% off
Add/remove in the `COUPONS` object.

## Product URLs
- SCOOPX Pro One (single): `product.html?id=scoop1`
- SCOOPX Pro One (3 pack): `product.html?id=scoop3`
- Gym Keychain Set: `product.html?id=keychain`
