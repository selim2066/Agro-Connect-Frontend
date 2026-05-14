# AgroConnect Backend

Backend API for AgroConnect — an AI-powered two-sided
agricultural marketplace for Bangladesh.

## Two Core Feeds
- Normal Feed: retail product marketplace (seller identity hidden)
- Shop Feed: wholesale farm directory (verified farms, connection credits)

## Platform Supports
- Retail marketplace with COD and online payment
- Wholesale farm connections via credit system
- Seller subscription plans (Starter / Pro)
- Buyer connection credit packs
- AI tools for farmers (crop disease, pricing, recommendations)
- Bilingual support (English / Bangla)
- Real-time notifications

## Roles
- CUSTOMER (unverified / verified by purchasing credits)
- SELLER (unverified / verified by admin + subscription plan)
- ADMIN

## Seller Plans
- Free: 5 listings, no AI, bottom of feed
- Starter (৳299/mo): 30 listings, Crop Doctor, mid feed
- Pro (৳799/mo): unlimited listings, full AI, top of feed

## Buyer Credit Packs
- Starter: ৳199 → 3 credits
- Standard: ৳499 → 10 credits
- Wholesale Pro: ৳999 → 25 credits
- Credits never expire
- Buying any pack = customer becomes verified

## Payment Provider
- SSLCommerz (retail orders + credit packs + subscriptions)

## AI Provider
- Gemini 2.5 Flash (crop disease detection — vision)
- Groq / OpenAI (price advisor, crop recommender, yield report, feed recommendations)