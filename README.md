# PrintHub

Next.js 16 + Tailwind 4 + Better Auth + MongoDB. Print to an MX10 thermal printer using Web Bluetooth.

## Setup
1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in the values
3. `npm run dev`, then open http://localhost:3000

## Admin
Sign up with the email in ADMIN_EMAIL to become admin, then open /admin.
Admin tabs: Users (roles, ban, password reset, delete), Appearance (app colors), Buttons (show/hide, rename, add custom buttons).

## Forgot password email
Set SMTP_USER and SMTP_PASS (Gmail App Password) in the environment variables.
Without them, the reset link is only printed in the server log.

## Languages
English, Bangla, Chinese. Add more in lib/i18n.js.

## Deploy (Vercel)
Add the same environment variables in Vercel, then redeploy.
