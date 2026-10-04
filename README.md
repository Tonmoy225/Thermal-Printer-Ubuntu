<div align="center">

# 🖨️ PrintHub

**Print from your browser to a Bluetooth thermal printer. No app, no install.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-7c3aed?style=for-the-badge)](https://thermal-printer-ubuntu.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

PrintHub is a responsive web app for printing text and pictures on a Bluetooth thermal printer (tested target: **MX10**). It talks to the printer directly from Chrome using the **Web Bluetooth API**, so it works on Android phones and desktop computers without installing anything.

> 🔗 **Live:** https://thermal-printer-ubuntu.vercel.app

<!-- Add screenshots to a /docs folder and uncomment:
<p align="center">
  <img src="docs/login.png" width="30%" />
  <img src="docs/home.png" width="30%" />
  <img src="docs/admin.png" width="30%" />
</p>
-->

## ✨ Features

**Printing**
- Connect to the printer over Bluetooth Low Energy by typing its name (for example `MX10`)
- Live Bluetooth ON/OFF and printer connection status
- **Text** printing with font style, size, bold, italic, alignment, border and letter style (UPPERCASE, lowercase, Title Case, Sentence case, aLtErNaTe or mixed)
- **Picture Print** (images are converted to black and white)
- Ready-made tools built on text printing: Banner, Todo list, Sticky Note, Notes, Receipt-style Slip, Test Print
- Live print preview before printing
- A short demo popup before each tool

**Accounts and admin**
- Sign up, log in and log out with [Better Auth](https://www.better-auth.com)
- Forgot password / reset password by email
- Password show/hide eye icon
- **Admin panel:** view all users, change roles, ban/unban, reset passwords, delete users
- **Admin customization:** change app colors, rename or hide buttons, add your own custom print buttons. Changes apply to everyone.

**Experience**
- Fully responsive, from phone to widescreen
- Languages: **English, বাংলা, 中文**
- Purple gradient theme (changeable by the admin)

## 🧰 Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4, lucide-react icons |
| Auth | Better Auth (email and password, admin plugin) |
| Database | MongoDB Atlas |
| Email | Nodemailer (SMTP, for example Gmail) |
| Printing | Web Bluetooth API, cat-printer style BLE protocol |
| Hosting | Vercel |

## 🖨️ How printing works

1. The browser asks Bluetooth for a device whose name starts with your printer name.
2. PrintHub connects to the printer's BLE service `AE30` and writes to characteristic `AE01`.
3. Text or an image is drawn on a 384-pixel-wide canvas, converted to 1-bit rows, wrapped in the printer's packet format (with CRC8) and sent in small chunks.

The protocol follows the open-source [thermy](https://github.com/mazoqui/thermy) / cat-printer implementation. Other cat-printer style models (GB01, GB03 and similar) may work after changing the name prefix.

**Browser support:** Chrome or Edge on Android, Windows, macOS and Linux. iPhone and iPad are not supported by Web Bluetooth. On Linux you may need to enable `chrome://flags/#enable-experimental-web-platform-features`.

## 🚀 Getting started

### Requirements
- Node.js 18.17 or newer
- A MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works)
- Google Chrome

### Install and run

```bash
git clone https://github.com/Tonmoy225/Thermal-Printer-Ubuntu.git
cd Thermal-Printer-Ubuntu
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string, including the database name (for example `.../printhub`) |
| `BETTER_AUTH_SECRET` | A long random string (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Your site URL (`http://localhost:3000` locally) |
| `ADMIN_EMAIL` | The account with this email becomes the admin |
| `SMTP_USER` | Gmail address used to send reset emails |
| `SMTP_PASS` | Gmail App Password (16 characters) |

Without `SMTP_USER` and `SMTP_PASS`, the password reset link is printed in the server log instead of being emailed.

### Become the admin
Sign up (or log in) with the email you set in `ADMIN_EMAIL`. The **Admin** link then appears in the header.

## ☁️ Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel choose **Add New → Project** and import the repository.
3. Add the environment variables above.
4. In MongoDB Atlas, open **Network Access** and allow `0.0.0.0/0` so Vercel can connect.
5. Deploy. Pushing to `main` redeploys automatically.

`/api/health` shows whether the database connection works.

## 📁 Project structure

```
app/
  page.js              login and sign up
  home/                printing tools
  admin/               admin panel
  forgot-password/     request a reset link
  reset-password/      set a new password
  guide/               setup guide
  api/                 auth, settings, health
components/            header, modals, text and picture panels
lib/
  printer.js           Bluetooth and print protocol
  auth.js              Better Auth config
  i18n.js              English, Bangla and Chinese text
  features.js          tool definitions
```

## 🗺️ Roadmap

- [ ] Text Scan (camera to print)
- [ ] Document and website printing
- [ ] Print history
- [ ] More printer models

## Credits

Printer protocol based on [thermy](https://github.com/mazoqui/thermy) and the cat-printer community.

## 👤 Author

**Tonmoy** — CSE student at Daffodil International University, frontend web developer.
GitHub: [@Tonmoy225](https://github.com/Tonmoy225)