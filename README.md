# SCOOPX Store — Deploy Guide

## Step 1 — Push to GitHub
1. Go to github.com → New repository → name it `scoopx-store` → Create
2. Upload all your files (drag and drop works in GitHub)

## Step 2 — Deploy to Vercel
1. Go to vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import your `scoopx-store` repo
3. Click Deploy — your store is now live at `scoopx-store.vercel.app`

## Step 3 — Set up Stripe products (IMPORTANT)
For the dynamic cart to work, you need Stripe Price IDs (different from payment links).

1. Go to stripe.com → Dashboard → Products
2. Create 3 products:
   - "SCOOPX Pro One Single" → price $8.00
   - "SCOOPX Pro One 3 Pack" → price $19.99
   - "Gym Keychain Set" → price $12.99
3. For each product, click it → find the Price ID (starts with `price_...`) → copy it

## Step 4 — Add environment variables in Vercel
1. In Vercel → your project → Settings → Environment Variables
2. Add these one by one:

| Name | Value |
|------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (starts with `sk_live_...`) |
| `STRIPE_PRICE_SCOOP1` | Price ID for the single scoop (starts with `price_...`) |
| `STRIPE_PRICE_SCOOP3` | Price ID for the 3-pack (starts with `price_...`) |
| `STRIPE_PRICE_KEYCHAIN` | Price ID for the keychain (starts with `price_...`) |

3. Click Save → go to Deployments → Redeploy

## Where to find your Stripe Secret Key
Stripe Dashboard → Developers → API Keys → Secret key (click Reveal)

⚠️ Use `sk_test_...` while testing, switch to `sk_live_...` when ready for real payments.

## That's it!
Your store now has a real dynamic cart. Customers can add multiple products and pay in one single Stripe checkout.
