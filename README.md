# STRK

Next.js 14 + Neon Postgres + Pusher Channels. Deploy on Vercel.

## Deploy
1. Neon: create project, copy pooled (DATABASE_URL) and direct (DIRECT_URL) strings.
2. Pusher Channels: create app, copy app id, key, secret, cluster.
3. `cp .env.example .env`, fill it in. Generate secrets: `openssl rand -hex 32`.
4. `npm i && npm run db:push && npm run seed`
5. `npm run dev`, open /admin (user: admin), tap CARD_001, watch /display?key=DISPLAY_KEY.
6. Push to GitHub, import in Vercel, paste the same env vars, deploy.

## Test the scanner webhook
BODY='{"member_id":"CARD_001"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print $2}')
curl -X POST https://YOUR-APP.vercel.app/api/v1/webhooks/scan -H "x-strk-signature: $SIG" -d "$BODY"

Scanner can't sign? Send header `x-api-key: <WEBHOOK_SECRET>` instead.

## TV
Chrome kiosk on the media player: `chromium --kiosk --noerrdialogs --disable-infobars https://YOUR-APP.vercel.app/display?key=DISPLAY_KEY`
Set BIOS/OS to auto-power-on and auto-launch that on boot.
